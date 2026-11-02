# RDMC Live mobile release preparation

Status: native project scaffolding only; not submitted or store-ready.

Implemented: Capacitor iOS/Android projects, bundled assets, mobile-relative Vite paths, safe-area CSS, pinned Capacitor packages. Proposed bundle identifier: us.rdmcfairfieldcounty.live (confirm availability before store registration).

Validated: consumption tests (3 passed), Vite mobile production build, Capacitor add/sync for both platforms.

Build limits: Android Gradle distribution download failed due to unavailable network. No Android binary produced. Xcode is unavailable on this Linux host; iOS has not compiled or run.

Commands: npm ci; npm test; npm run mobile:sync. Use npm run mobile:ios on a Mac with Xcode and npm run mobile:android with Android Studio installed.

Before release:
- Exercise owner, approved-member, pending and blocked access against actual backend policies. Test chat, Zoom and tracker on both real device platforms.
- Implement authenticated account deletion and associated-data handling; owner safeguards must not prevent a legitimate deletion request.
- Complete chat reporting/blocking/moderation, privacy policy, support URL and store privacy/data-safety disclosures based on actual data flows.
- Replace the disabled subscription placeholder with verified store products, purchase/restore flows, server-side receipt/notification validation and revocation/expiry handling. Never grant paid access from a client success callback alone.
- Configure Apple Developer/App Store Connect and Google Play Console under the chosen legal publisher, signing, icons, screenshots, review access, age/content declarations and testing tracks.
- Review external links and embedded Sol pages on device. Physical merchandise checkout remains Printful; do not confuse it with digital membership billing.

No paid subscriptions, store enrollment, signing certificates, live purchases or store submissions were created.
