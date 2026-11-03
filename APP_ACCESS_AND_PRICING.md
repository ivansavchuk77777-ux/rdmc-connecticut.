# RDMC Fairfield County Live — confirmed product requirements

## Access
- Private members-only app. Users sign in and can view only content permitted by the club administrator.
- Club administrator approves, limits, deactivates, or removes member access.
- Payment alone must never confer club membership or privileged access.
- Before launch, verify authorization on the server/Supabase RLS, not only in the user interface.

## Requested Apple pricing
- Paid App Store download: USD $1.99 one time.
- Auto-renewable subscription: USD $1.99 per month for ongoing private member services.
- Clearly disclose both charges and renewal terms before purchase; confirm final App Store policy eligibility and configuration.
- The subscription must have meaningful ongoing value, such as maintained private member information and communications; do not present it solely as a charge for retaining an installed app.
- Club dues, merchandise, and other payments are out of scope for this initial submission.

## Review readiness
- Provide a safe reviewer demo account or review mode that allows Apple to inspect the gated experience without granting real club access.
- Ensure the paid app remains useful and App Review can assess its functionality; a simple website wrapper is insufficient.
- Test behavior for approved/unapproved members, expired subscriptions, restored purchases, and subscription cancellation.
- Configure Apple Paid Apps Agreement, banking, tax, app price, subscription group/product, and required disclosures in App Store Connect.

This document records requirements only. It does not implement purchases, activate pricing, or upload a build.
