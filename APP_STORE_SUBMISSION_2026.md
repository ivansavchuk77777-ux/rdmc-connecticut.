# RDMC Fairfield County Live — App Store submission preparation

Prepared: November 12, 2026. **Draft / not submitted to Apple.**

## Existing app — do not register a duplicate

- App name: **RDMC Fairfield County Live**
- Apple App ID (from previous App Store Connect correspondence): **6829960532** — verify in App Store Connect
- Bundle ID: `us.rdmcfairfieldcounty.live`
- Apple developer team: `B852HHFN2S`
- iOS source branch: `app-store-ios-preparation`
- Original Red Devil artwork: `IMG_1995.jpg` — **do not modify or replace**
- Current working iOS upload: **build 12**, accepted by Apple's upload service on November 6, 2026; Apple processing/TestFlight eligibility still must be confirmed in App Store Connect
- Signed build: https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions/runs/42301602025
- Upload: https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions/runs/42302003521

## App Store listing copy — proposed, not yet published

**Name:** RDMC Fairfield County Live

**Subtitle:** Private chapter member hub

**Promotional text:**
Stay connected with RDMC Fairfield County through a private member hub for chapter updates, events, communication, and club activities.

**Description:**
RDMC Fairfield County Live is a private app for approved members and invited brothers.

Access chapter announcements, planned rides and events, member communications, and club resources in one place. Depending on your approved account permissions, the app also provides a member directory, club tasks, inventory, consumption tracking, and administrative tools.

Membership access requires registration and approval by the chapter administrator. Certain areas are limited to Connecticut chapter members. This app is not intended to grant public access to private club information.

**Keywords (draft):**
RDMC,Red Devils,motorcycle club,chapter,members,rides,events,community

**Primary category (proposal):** Social Networking. Confirm with Apple based on final functionality.

**Support URL:** PENDING — a working page with support contact details is required.

**Privacy Policy URL:** PENDING — a published, accurate privacy policy is required.

**Marketing URL:** https://rdmcfairfieldcounty.us/ — verify this is live and appropriate.

**Copyright:** PENDING — use the correct rights holder and year after confirmation.

**App review contact:** PENDING — name, email, and phone must be entered privately in App Store Connect.

## App Review notes — draft

This is an existing members-only motorcycle club app. New users register and remain pending until an administrator approves access. Reviewers need a working demo account with approved permissions; do not place its password in this repository.

For review, supply:
1. Approved demo username/password securely in App Store Connect.
2. Clear instructions to open the login screen and reach the member dashboard.
3. A second test account or reviewer instructions for admin-only areas, if those features are in scope.
4. Any explanation needed for restricted chapter data or real-time features.
5. Working support/privacy links and any required purchase/subscription test configuration.

## Release blockers — must resolve before submission

- [ ] **Apple processing:** Confirm build 12 (or a newer build) appears as processed and selectable in App Store Connect. GitHub's successful upload alone does not establish TestFlight availability.
- [ ] **Real iPhone QA:** Verify logo/icon, Fairfield County header, login, pending approval, approved member access, blocked access, chat, notifications, events, consumption data isolation, and logout.
- [ ] **Account deletion:** Current `src.jsx` has sign-up and sign-out, but no verified in-app account deletion flow. Implement and test secure account deletion plus associated-data handling, including Supabase backend authorization, before submission.
- [ ] **Subscription/paywall:** Current `src.jsx` shows a disabled “Subscribe on iPhone — coming next” button. The requested $1.99/month subscription is **not implemented or verified** as Apple in-app purchase. Do not claim it is active. Configure subscription product, StoreKit integration, entitlement verification, restore purchases, and subscription disclosures if monetizing access.
- [ ] **Paid download:** Requested $1.99 upfront price is **not verified** in App Store Connect. Confirm pricing and whether combining an upfront price with subscription access is the intended, compliant customer experience.
- [ ] **Privacy policy:** Publish a policy accurately covering accounts, names, email/phone, member directory, messaging, club records, retention, deletion, third parties, and contact information. Verify actual data practices before publication.
- [ ] **App Privacy questionnaire:** Complete using actual Supabase, analytics, communications, and third-party data collection/sharing.
- [ ] **Support URL:** Publish a working support contact page.
- [ ] **Screenshots:** Capture actual iPhone screenshots of the finished app (not mockups) in App Store Connect's required dimensions; avoid exposing member personal information.
- [ ] **App Review access:** Create approved demo account(s) and provide credentials privately through App Store Connect.
- [ ] **Permissions:** Check microphone and speech-recognition usage prompts and actual feature behavior; do not request permissions before needed.
- [ ] **Content and rights:** Confirm permission to use original RDMC branding and any other third-party artwork.
- [ ] **Store listing:** Confirm age rating, export compliance, contact details, copyright, and final category.
- [ ] **Review decision:** Get final approval for screenshots, pricing, and app listing before clicking Submit for Review.

## Tester checklist

- [ ] Fresh install on iPhone, app icon shows original red devil.
- [ ] Login with existing member, sign out, and sign in again.
- [ ] Register new brother; account remains pending until approved.
- [ ] Admin approves and blocks a test account; changes take effect.
- [ ] World brother cannot access Connecticut-only records.
- [ ] Chat, events, member directory, and contact links behave correctly.
- [ ] Consumption tracker protects member data and handles month changes.
- [ ] Voice/microphone permissions are requested only when used.
- [ ] No broken pages, placeholder purchase controls, crashes, or misleading pricing.

## Where to continue

- App Store Connect: https://appstoreconnect.apple.com/apps
- GitHub Actions: https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions
- Source branch: https://github.com/ivansavchuk77777-ux/rdmc-connecticut./tree/app-store-ios-preparation

**Do not submit to App Review or publish the app until the blockers are resolved and verified.**
