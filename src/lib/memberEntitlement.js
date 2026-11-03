/**
 * RDMC Live iOS access decision.
 * IMPORTANT: This is presentation logic only. Supabase RLS and a trusted server
 * must independently enforce every read/write. Never trust a client-supplied
 * subscription_status or Apple purchase receipt as proof of payment.
 */
export function canOpenMemberServices({ profile, entitlement } = {}) {
  if (!profile || !entitlement) return false;
  if (profile.access_scope !== 'ct_member') return false;
  if (!['active', 'exempt'].includes(profile.subscription_status)) return false;
  if (entitlement.memberId !== profile.id) return false;
  // entitlement must come from an authenticated backend which verified Apple
  // transactions, not from local storage or client-side purchase callbacks.
  return entitlement.source === 'verified_server' &&
    (entitlement.active === true || entitlement.adminExempt === true);
}

export function subscriptionAccessMessage({ profile, entitlement } = {}) {
  if (!profile) return 'Sign in to continue.';
  if (profile.subscription_status === 'blocked') return 'Account blocked. Contact the administrator.';
  if (profile.access_scope !== 'ct_member') return 'Connecticut chapter approval required.';
  if (!['active', 'exempt'].includes(profile.subscription_status)) return 'Membership approval or renewal required.';
  if (!entitlement || entitlement.source !== 'verified_server') return 'Checking subscription with the server.';
  if (!entitlement.active && !entitlement.adminExempt) return 'Subscription inactive. Restore or renew your purchase.';
  return 'Member access available.';
}
