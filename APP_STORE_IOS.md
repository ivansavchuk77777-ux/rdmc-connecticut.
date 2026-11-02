# RDMC Fairfield County Live — iOS App Store preparation

This is the **existing** React/Vite/Supabase RDMC Live application, not a new project. The existing image assets, including `IMG_1995.jpg`, are preserved. Do not substitute or redraw the club logo.

## Status
- iOS packaging configuration prepared on the `app-store-ios-preparation` branch.
- Native Xcode project, app icon asset catalog, signed archive, TestFlight testing, Apple Developer enrollment, and App Store submission **not yet completed**.
- An active Apple Developer membership and access to a Mac with current supported Xcode (or a secure macOS CI build) are needed to produce and sign the iOS release.

## Create native iOS project on a Mac
1. Clone **this exact repository** (note the final period in its repository name) and switch to `app-store-ios-preparation`.
2. Install Node.js LTS and Xcode. Run `npm install`.
3. Run `npm run build:ios` to create a web build with relative asset paths.
4. Run `npm run ios:add` **once** to generate the native iOS folder inside this existing repository.
5. Run `npm run ios:sync` after each web app change.
6. Run `npm run ios:open`, then select your Apple Developer Team under Signing & Capabilities and test on iPhone.
7. Use Xcode Archive / Distribute to upload to App Store Connect, first testing with TestFlight.

The proposed bundle identifier is `us.rdmcfairfieldcounty.live`; verify availability and ownership in your Apple account before locking it. The public website GitHub Pages Vite build remains unchanged.

## Before requesting Apple review
- Provide a real privacy policy and support URL, and complete App Store Connect privacy disclosures.
- Ensure an accessible in-app account deletion initiation flow if users can create accounts; administrative member deactivation alone does not satisfy account deletion.
- Provide App Review with a working approved demo account or Apple-approved demo mode; member-only access does not waive review requirements.
- Verify native navigation, external links, email/SMS links, login persistence, zoom, downloads, and all core screens on a real iPhone.
- Confirm ownership and authorization to use club name, marks, images, and merchandise imagery.
- Confirm any paid digital membership/subscriptions comply with App Store payment rules; physical merchandise has different rules.
- Prepare an original authorized 1024×1024 app icon derived from the existing logo (do not alter or replace the original logo), screenshots of the actual iOS app, description, age rating, contact details, and release notes.
- Check backend RLS policies and user data permissions, including consumption records. Do not include private keys or Apple credentials in GitHub.
- Confirm app offers functionality beyond a basic website wrapper, per App Review Guideline 4.2.

This preparation branch is intentionally separate from the live website until reviewed and merged.
