# RDMC Fairfield County Live — iOS release handoff

This is the **existing** React/Vite/Supabase RDMC Live app, not a new project. Keep the original `IMG_1995.jpg` logo unchanged. The iOS packaging work remains on `app-store-ios-preparation`; the public website on `main` has not been changed by this branch.

## Verified November 3, 2026

- **Signed App Store iPhone release: PASSED** in GitHub Actions run [41670163993](https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions/runs/41670163993).
- The workflow completed dependency installation, consumption tests, web build, original-logo comparison, Capacitor iOS generation/sync, Release archive, IPA export, and artifact upload successfully.
- Artifact: `RDMC-signed-iPhone-release` (2,661,772 bytes; artifact ID `13249245280`), expires **November 10, 2026**. [Download from the workflow run](https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions/runs/41670163993) while signed in to GitHub.
- App identifier: `us.rdmcfairfieldcounty.live`; Apple Team: `B852HHFN2S`.
- The signing credentials are held as encrypted GitHub Actions secrets, not source files.
- **Not yet done:** IPA upload to App Store Connect; Apple processing; TestFlight distribution; physical iPhone acceptance test; App Store review and publication. A passing build does not imply Apple acceptance.

## Next action: upload the existing IPA to TestFlight

1. In the existing GitHub Actions run above, open artifact `RDMC-signed-iPhone-release` and download its ZIP. Extract the `.ipa` file. Do not rename or edit its contents.
2. In [App Store Connect](https://appstoreconnect.apple.com/apps), open the existing **RDMC Fairfield County Live** app (do not register another app).
3. Upload the IPA using **Apple Transporter on a Mac**, **Xcode Organizer**, or a properly authorized macOS CI upload integration. App Store Connect's normal web app page is not a general-purpose IPA uploader. Windows alone cannot use Apple Transporter for macOS; an authorized macOS cloud runner with App Store Connect API credentials is an alternative.
4. Wait for Apple processing, address any validation messages, and enable an internal TestFlight tester.
5. Test login/member authorization, account deletion, data isolation (including the consumption tracker), logo/app icon, navigation, notifications, and purchases on a physical iPhone. Confirm the app is more than a simple website wrapper.
6. Before requesting review, verify support/privacy-policy URLs, privacy disclosures, actual app screenshots, review/demo access, account deletion, permissions to use brand imagery, and Apple's payment rules. Paid download or monthly subscriptions have **not** been verified as configured.
7. Submit for review only after TestFlight passes and the account holder confirms the final listing and commercial terms.

## Important release constraints

- Do not publish an untested binary to the App Store.
- Never place Apple private keys, P12s, provisioning profiles, API keys, or passwords in commits, PR descriptions, or issue comments.
- This is a draft PR; do not merge the preparation branch into the public website until its changes are reviewed.
- The `.ipa` is time-limited in Actions; rerun the existing signed release workflow if the artifact expires.
