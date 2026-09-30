import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
}
async function hmac(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
}
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const apiKey = Deno.env.get("CHECKR_API_KEY");
  if (!apiKey) return new Response("Provider not configured", { status: 503 });

  const raw = await req.text();
  const supplied = req.headers.get("X-Checkr-Signature") || "";
  const expected = await hmac(apiKey, raw);
  if (!supplied || supplied.toLowerCase() !== expected.toLowerCase()) return new Response("Invalid signature", { status: 401 });

  let event: any;
  try { event = JSON.parse(raw); } catch { return new Response("Bad JSON", { status: 400 }); }
  const obj = event?.data?.object || event?.data || {};
  const eventType = event?.type || "";
  const candidateId = obj.candidate_id || obj.candidate?.id || null;
  const reportId = obj.report_id || (obj.object === "report" ? obj.id : null);
  if (!candidateId && !reportId) return new Response("ok", { status: 200 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let query = admin.from("background_checks").select("*");
  query = reportId ? query.eq("provider_report_id", reportId) : query.eq("provider_candidate_id", candidateId);
  let { data: row, error: lookupError } = await query.maybeSingle();
  if (lookupError) return new Response("Lookup failed", { status: 500 });
  // New reports are not linked to the invitation row yet.
  if (!row && reportId && candidateId) {
    const fallback = await admin.from("background_checks").select("*")
      .eq("provider_candidate_id", candidateId).maybeSingle();
    if (fallback.error) return new Response("Lookup failed", { status: 500 });
    row = fallback.data;
    if (row?.provider_report_id && row.provider_report_id !== reportId) {
      return new Response("ok", { status: 200 });
    }
  }
  if (!row) return new Response("ok", { status: 200 });

  let status = row.status;
  let resultSummary = row.result_summary;
  let completedAt = row.completed_at;
  if (eventType === "invitation.completed" && !completedAt) status = "pending";
  if (eventType === "report.created" && !completedAt) status = "pending";
  if (eventType === "report.suspended" && !completedAt) status = "suspended";
  if (eventType === "report.completed") {
    status = obj.result === "clear" ? "clear" : obj.result === "consider" ? "consider" : "complete";
    resultSummary = obj.result || obj.assessment || "complete";
    completedAt = new Date().toISOString();
  }

  const { error: updateError } = await admin.from("background_checks").update({
    provider_report_id: reportId || row.provider_report_id,
    status,
    result_summary: resultSummary,
    completed_at: completedAt,
    updated_at: new Date().toISOString()
  }).eq("id", row.id);

  if (updateError) return new Response("Status update failed", { status: 500 });
  return new Response("ok", { status: 200 });
});