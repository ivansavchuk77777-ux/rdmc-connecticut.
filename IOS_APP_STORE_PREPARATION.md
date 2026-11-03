# RDMC Fairfield County Live — iOS preparation

Work on branch `ios-app-store-preparation`; do not replace the original logo (`IMG_1955.PNG`) or change the public website deployment without review.

## Verified starting point
- Existing Vite/React application with Supabase client.
- Existing App Store Connect listing: iOS 1.0, Prepare for Submission (reported by owner).
- No iOS build uploaded yet (reported by owner).

## Required before uploading
1. Confirm Apple App Store Connect Bundle ID matches `us.rdmcfairfieldcounty.live` in capacitor.config.json; update this config if it differs. Do not create a duplicate App Store listing.
2. Install and lock `@capacitor/core`, `@capacitor/cli`, and `@capacitor/ios` with compatible versions. Change Vite asset base to `./` for the packaged app, without breaking GitHub Pages deployment.
3. Run `npm ci`, tests, and `npm run build`; generate and sync the iOS project with Capacitor. Use a trusted macOS cloud runner for Xcode signing and App Store upload.
4. Audit authenticated member access, Supabase RLS policies, secrets, and any public/member-only data exposure before distribution. Supply Apple reviewer demo credentials or a functioning demo mode.
5. Test iPhone navigation, safe areas, offline/error states, push permissions, external links, and native-app functionality; avoid a thin website wrapper.
6. Prepare original-logo app icon, launch screen, real iPhone screenshots, privacy policy, privacy disclosures, age rating, support URL, and encryption export-compliance answers.
7. Test with TestFlight, then attach the signed build to the existing App Store listing and submit for review.

## Payments decision needed
App Store download pricing, in-app digital membership/subscription charges, and external club dues/physical merchandise are different payment flows with different Apple rules. Confirm what members will pay for and which authorized merchant account should receive proceeds. Do not add a payment checkout or assume payout account details without this decision.

No iOS binary has been built, signed, uploaded, or approved by Apple as part of this commit.
