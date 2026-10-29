import React, {useEffect, useMemo, useRef, useState} from 'react';
import {supabase} from './supabase';
import {chapterDay} from './calendar.mjs';
import {PRODUCTS, monthRange, summarizeConsumption, validateConsumption} from './consumption.mjs';

export default function ConsumptionTracker({user}) {
  const today = chapterDay();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [access, setAccess] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [connection, setConnection] = useState('Connecting');
  const [updated, setUpdated] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [draft, setDraft] = useState({member_id: '', product: PRODUCTS[0], quantity: '1', used_on: today, notes: ''});
  const pending = useRef(null);
  const saving = useRef(false);
  const data = useMemo(() => summarizeConsumption(members, entries), [members, entries]);

  useEffect(() => {
    let live = true, running = false, queued = false;
    setMembers([]); setEntries([]); setLoading(true); setError(''); setUpdated(null);
    const load = async () => {
      if (running) { queued = true; return; }
      running = true;
      try {
        const {data: profile, error: profileError} = await supabase.from('profiles').select('role,access_scope,subscription_status').eq('id', user.id).single();
        if (profileError) throw profileError;
        const allowed = profile?.access_scope === 'ct_member' && ['active', 'exempt'].includes(profile.subscription_status);
        if (!live) return;
        setAccess(allowed); setAdmin(allowed && profile.role === 'admin');
        if (!allowed) { setMembers([]); setEntries([]); return; }
        const range = monthRange(month);
        const {data: roster, error: rosterError} = await supabase.from('consumption_members').select('id,name,sort_order').order('sort_order').order('id');
        if (rosterError) throw rosterError;
        // Page through the entire month so the server's row limit never truncates totals.
        const records = [];
        for (let offset = 0; ; offset += 1000) {
          const {data: page, error: pageError} = await supabase.from('consumption_entries').select('id,member_id,product,quantity,used_on,notes,created_at,recorded_by,voided_at').gte('used_on', range.start).lt('used_on', range.end).order('created_at', {ascending: false}).order('id').range(offset, offset + 999);
          if (pageError) throw pageError;
          records.push(...page);
          if (page.length < 1000) break;
        }
        if (live) { setMembers(roster); setEntries(records); setError(''); setUpdated(new Date()); }
      } catch (e) {
        if (live) { setError('Could not refresh consumption records. '+e.message); setMembers([]); setEntries([]); setUpdated(null); }
      } finally {
        running = false;
        if (live) setLoading(false);
        if (live && queued) { queued = false; load(); }
      }
    };
    const reload = () => { if (!document.hidden) load(); };
    load();
    const channel = supabase.channel('consumption-'+user.id+'-'+month)
      .on('postgres_changes', {event: '*', schema: 'public', table: 'consumption_entries'}, load)
      .on('postgres_changes', {event: '*', schema: 'public', table: 'consumption_members'}, load)
      .subscribe(status => { if (live) setConnection(status === 'SUBSCRIBED' ? 'Live' : 'Auto refresh'); });
    const timer = setInterval(reload, 20000);
    document.addEventListener('visibilitychange', reload);
    window.addEventListener('online', reload);
    return () => { live = false; clearInterval(timer); document.removeEventListener('visibilitychange', reload); window.removeEventListener('online', reload); supabase.removeChannel(channel); };
  }, [user.id, month, refresh]);

  const save = async event => {
    event.preventDefault();
    if (saving.current || !admin) return;
    const invalid = validateConsumption(draft, chapterDay());
    if (invalid) { setMessage(invalid); return; }
    const payload = {...draft, quantity: Number(draft.quantity), notes: draft.notes.trim()};
    const signature = JSON.stringify(payload);
    if (pending.current?.signature !== signature) pending.current = {signature, id: crypto.randomUUID()};
    saving.current = true; setBusy(true); setMessage('');
    try {
      const {error: insertError} = await supabase.from('consumption_entries').insert({...payload, id: pending.current.id});
      // A retry of an already saved request is safe: its ID is unchanged.
      if (insertError && insertError.code !== '23505') throw insertError;
      pending.current = null;
      setMessage('Usage saved. Monthly totals updated.');
      setDraft(d => ({...d, quantity: '1', notes: ''}));
      setMonth(payload.used_on.slice(0, 7)); setRefresh(v => v+1);
    } catch (e) { setMessage('Not confirmed saved. '+e.message+' You can retry safely.'); }
    finally { saving.current = false; setBusy(false); }
  };

  const voidEntry = async entry => {
    if (saving.current || !admin || !window.confirm('Void this '+entry.quantity+' × '+entry.product+' entry? It will stay in the history and stop counting toward totals.')) return;
    saving.current = true; setBusy(true); setMessage('');
    try {
      const {data: changed, error: voidError} = await supabase.from('consumption_entries').update({voided_at: new Date().toISOString()}).eq('id', entry.id).is('voided_at', null).select('id');
      if (voidError) throw voidError;
      setMessage(changed.length ? 'Entry voided. History retained.' : 'Entry was already voided or your access changed.');
      setRefresh(v => v+1);
    } catch (e) { setMessage('Could not void entry. '+e.message); }
    finally { saving.current = false; setBusy(false); }
  };

  const exportCsv = () => {
    const csv = [['Member', ...PRODUCTS, 'Total items'], ...data.rows.map(r => [r.name, ...PRODUCTS.map(p => r.counts[p]), r.total]), ['MONTH TOTAL', ...PRODUCTS.map(p => data.totals[p]), data.total]];
    const text = csv.map(row => row.map(v => '"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF'+text], {type: 'text/csv;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'RDMC-Consumption-'+month+'.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (access === false) return <div className="card"><h1>Consumption</h1><p>Only approved Fairfield County members can view these records.</p></div>;
  const title = new Date(month+'-01T12:00:00Z').toLocaleDateString('en-US', {timeZone: 'UTC', month: 'long', year: 'numeric'});
  const names = Object.fromEntries(members.map(m => [m.id, m.name]));
  return <div className="consumptionTracker">
    <div className="title"><h1>Consumption</h1><p>RDMC Fairfield County • Monthly member usage</p></div>
    <div className="consumptionToolbar"><label>Month<input type="month" min="2020-01" max="2100-12" value={month} onChange={e => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) setMonth(e.target.value); }}/></label><button type="button" disabled={loading} onClick={() => setRefresh(v => v+1)}>Refresh</button><button type="button" disabled={!updated || loading || !!error} onClick={exportCsv}>Export CSV</button></div>
    <p className="consumptionSync" role="status">{loading ? 'Loading records…' : error ? 'Records unavailable' : updated ? connection+' • Updated '+updated.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Waiting for records'}</p>
    {error && <p role="alert" className="chatError">{error}</p>}
    {message && <p role="status" className="authMsg">{message}</p>}
    {updated && !loading && !error && <><div className="consumptionSummary"><span>{title}</span><b>{data.total}</b><small>Total items recorded</small></div><p className="permissionNote">All approved chapter members can view the monthly sheet. The Owner/Admin records and corrects usage.</p>
      <div className="consumptionTableWrap" role="region" aria-label={title+' consumption sheet'} tabIndex="0"><table className="consumptionTable"><caption>{title} consumption sheet</caption><thead><tr><th scope="col">Member</th>{PRODUCTS.map(p => <th scope="col" key={p}>{p}</th>)}<th scope="col">Total</th></tr></thead><tbody>{data.rows.map(r => <tr key={r.id}><th scope="row">{r.name}</th>{PRODUCTS.map(p => <td key={p} className={r.counts[p] ? 'used' : ''}>{r.counts[p]}</td>)}<td><b>{r.total}</b></td></tr>)}</tbody><tfoot><tr><th scope="row">Month total</th>{PRODUCTS.map(p => <td key={p}>{data.totals[p]}</td>)}<td>{data.total}</td></tr></tfoot></table></div>
      {!data.total && <p>No usage has been recorded for this month.</p>}
    </>}
    {admin && <form className="card consumptionForm" onSubmit={save}><h2>Record usage</h2><label>Member<select required value={draft.member_id} onChange={e => setDraft({...draft, member_id:e.target.value})}><option value="">Choose member</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Product<select value={draft.product} onChange={e => setDraft({...draft, product:e.target.value})}>{PRODUCTS.map(p => <option key={p}>{p}</option>)}</select></label><div className="consumptionFormPair"><label>Quantity<input required type="number" min="1" max="999" step="1" value={draft.quantity} onChange={e => setDraft({...draft, quantity:e.target.value})}/></label><label>Date used<input required type="date" min="2020-01-01" max={today} value={draft.used_on} onChange={e => setDraft({...draft, used_on:e.target.value})}/></label></div><label>Notes <small>(optional)</small><input maxLength="300" value={draft.notes} onChange={e => setDraft({...draft, notes:e.target.value})}/></label><button disabled={busy || loading || !!error} type="submit">{busy ? 'Saving…' : 'Save usage'}</button></form>}
    {updated && !loading && !error && <details className="consumptionHistory"><summary>Usage history ({entries.length} entries)</summary>{entries.map(entry => <article className="card" key={entry.id}><b>{names[entry.member_id] || 'Member'} • {entry.quantity} × {entry.product}</b><p>{entry.used_on}{entry.voided_at ? ' • VOIDED' : ''}</p>{entry.notes && <p>{entry.notes}</p>}<small>Recorded {new Date(entry.created_at).toLocaleString()}</small>{admin && !entry.voided_at && <button type="button" disabled={busy} onClick={() => voidEntry(entry)}>Void entry</button>}</article>)}</details>}
  </div>;
}
