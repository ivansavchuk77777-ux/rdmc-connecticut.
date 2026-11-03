import test from 'node:test';
import assert from 'node:assert/strict';
import { canOpenMemberServices, subscriptionAccessMessage } from '../src/lib/memberEntitlement.js';

const profile = { id: 'member-1', access_scope: 'ct_member', subscription_status: 'active' };
const verified = { memberId: 'member-1', source: 'verified_server', active: true };

test('approved member with server-verified active entitlement may access', () => {
  assert.equal(canOpenMemberServices({ profile, entitlement: verified }), true);
});

test('never grants access to a client-provided or mismatched entitlement', () => {
  assert.equal(canOpenMemberServices({ profile, entitlement: { ...verified, source: 'client' } }), false);
  assert.equal(canOpenMemberServices({ profile, entitlement: { ...verified, memberId: 'someone-else' } }), false);
  assert.equal(canOpenMemberServices({ profile, entitlement: null }), false);
});

test('blocked, pending, and worldwide users cannot enter CT member services', () => {
  for (const change of [{ subscription_status: 'blocked' }, { subscription_status: 'pending' }, { access_scope: 'worldwide' }]) {
    assert.equal(canOpenMemberServices({ profile: { ...profile, ...change }, entitlement: verified }), false);
  }
});

test('expired entitlement is denied; server-verified admin exemption is allowed', () => {
  assert.equal(canOpenMemberServices({ profile, entitlement: { ...verified, active: false } }), false);
  assert.equal(canOpenMemberServices({ profile, entitlement: { ...verified, active: false, adminExempt: true } }), true);
});

test('shows safe messages when verification is missing or access is blocked', () => {
  assert.match(subscriptionAccessMessage({ profile }), /Checking subscription/);
  assert.match(subscriptionAccessMessage({ profile: { ...profile, subscription_status: 'blocked' }, entitlement: verified }), /blocked/i);
});

test('expired or unknown profile status never passes even with active Apple entitlement', () => {
  for (const status of ['expired', 'unknown', null]) {
    assert.equal(canOpenMemberServices({ profile: { ...profile, subscription_status: status }, entitlement: verified }), false);
  }
  assert.match(subscriptionAccessMessage({ profile: { ...profile, subscription_status: 'expired' }, entitlement: verified }), /approval or renewal/i);
});
