# RDMC Fairfield County Live — current iOS release status

Updated November 12, 2026.

This is the **existing** RDMC Fairfield County Live app, not a new app. The iOS release branch is `app-store-ios-preparation`. Preserve the original Red Devil logo `IMG_1995.jpg`.

## Verified release milestones

- **Signed iOS build 12 succeeded** November 6, 2026: https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions/runs/42301602025
- **Upload of signed build 12 succeeded** November 6, 2026: https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions/runs/42302003521
- The uploader log reports **“UPLOAD SUCCEEDED with no errors”** and confirms bundle ID `us.rdmcfairfieldcounty.live` with build number **12**.
- Apple Team: `B852HHFN2S`.
- **Not independently verified:** Apple's processing result, TestFlight availability, physical iPhone acceptance, App Store pricing, subscription configuration, review approval, or publication.

## App Store submission preparation

The current listing copy, reviewer notes, tester checklist, and unresolved submission blockers are in [APP_STORE_SUBMISSION_2026.md](./APP_STORE_SUBMISSION_2026.md).

**Key blockers:** verify Apple processing and iPhone testing; implement/verify account deletion; resolve the currently disabled in-app subscription control if a $1.99/month subscription is planned; publish accurate support and privacy pages; provide genuine screenshots and private review credentials; confirm App Store pricing.

## Next actions

1. Open https://appstoreconnect.apple.com/apps and select the existing RDMC Fairfield County Live app (Apple App ID 6829960532, verify there).
2. Confirm build **12** appears under TestFlight or select a newer processed build.
3. Complete iPhone QA and resolve the release blockers in the submission package.
4. Fill App Store Connect metadata, pricing, privacy disclosures, review credentials, and screenshots.
5. Submit only after testing and explicit final approval. **Do not create another app.**

Signing/API keys and passwords must remain in encrypted secrets or Apple's secure review fields, never committed to the repository.
