# Apple subscription implementation contract (not yet enabled)

This is the implementation plan for RDMC Fairfield County Live, not proof that App Store Connect products or Apple transactions are configured.

## Proposed products and billing
- One-time paid app download: USD 1.99, configured as the app price in App Store Connect, **not** as an in-app purchase.
- One auto-renewable subscription in a subscription group, proposed product ID `us.rdmcfairfieldcounty.live.member.monthly`, USD 1.99/month.
- Final product ID, territory pricing, group, eligibility, and terms must be confirmed in App Store Connect before code uses them.
- The subscription purchase does not grant RDMC membership or override administrator approval.

## Secure server-side purchase lifecycle
1. Authenticate the user through Supabase Auth and establish a server-side identity. Never trust a client-supplied member ID.
2. Native iOS StoreKit presents Apple's purchase sheet and provides a signed transaction. The client must not directly set `profiles.subscription_status`, `access_scope`, or `role`.
3. Backend verifies signed Apple transaction data and bundle ID, product ID, environment, ownership association, expiration, revocation, and subscription status using Apple's supported verification APIs. Store transaction identifiers idempotently and never log signed tokens.
4. Backend stores a private entitlement linked to the authenticated user and recomputes entitlement from verified Apple data. Do not expose a writable entitlement table to clients.
5. Configure and authenticate App Store Server Notifications V2, process renewals, refunds, expirations, and revocations idempotently. Reconcile missed notifications through App Store Server API.
6. A member may enter gated services **only if both** (a) the RDMC administrator approved the account and (b) the backend confirms an active subscription or an explicitly authorized exemption. Enforce this in database RLS and backend APIs, not only React.
7. Support Restore Purchases, manage subscription, cancellation messaging, subscription terms, privacy policy, and reviewer demonstration access without exposing real member data.

## Release blockers
- No confirmed Apple subscription group/product or final paid-app pricing.
- No native StoreKit/Capacitor purchase implementation, transaction-verification endpoint, notifications handler, or entitlement storage.
- No end-to-end signed-in RLS tests, sandbox purchase/restore/expiry tests, or cloud Mac iOS archive.
- Confirm Apple review eligibility for a paid download **plus** a recurring subscription and for a restricted-membership club app before submitting.

Do not enable purchase buttons or claim paid access works until every blocker is addressed.
