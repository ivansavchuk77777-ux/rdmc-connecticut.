# RDMC Bridgeport private beta

Version 0.1.0, build 1. Proposed bundle/application ID: `com.rdmc.bridgeport`.

This branch contains the current RDMC app, a bundled mobile build, Android Studio and Xcode projects. It is a source package, not a signed store upload. The live GitHub Pages site remains on main.

## Important for testers

- The beta connects to the existing RDMC Supabase project. Account, membership, inventory and chat changes affect live data. Use designated test accounts and avoid changing real members during a rehearsal.
- Member access and Ivan's owner permissions still apply. Installing the beta does not approve or activate an account.
- Zoom creation and external meeting links need a device test. Checkr remains unconfigured; do not initiate paid checks during testing.
- Store products are previews. In-app subscription billing and push delivery are not implemented.
- The desktop-only local Sol engine is not included in this phone beta. No camera or microphone permission is requested.
- No API secret, signing key, keystore or store credential belongs in this repository.

## Rebuild

Install Node.js 22 or later, then:

```sh
npm ci
npm run mobile:sync
```

`build:mobile` creates `dist-mobile` with relative asset paths and copies event flyers/logo assets. `mobile:assets` recreates launcher icons and splash screens from the existing devil artwork. Capacitor sync copies that bundle into both native projects. Do not use the GitHub Pages build inside Capacitor.

## Android / Google Play internal testing

1. Install Android Studio 2025.2.1 or later with Android SDK 36 and its bundled JDK (Java 21 or later).
2. Run `npm run mobile:android`, then run the app on a device/emulator first.
3. Create and verify Ivan's Google Play Console account. Confirm the permanent application ID before the first upload.
4. Android Studio: Build > Generate Signed Bundle / APK > Android App Bundle. Create and keep the upload keystore securely outside this repository.
5. Upload the signed `.aab` through Play Console's Internal testing track. Complete the required app setup and choose testers. No upload or tester invitation has been performed by this package.

The CI debug APK is for direct device testing only. It cannot be uploaded as the store release.

## iPhone / TestFlight

1. Use a Mac with Xcode 26 or later, or a macOS build service. Run `npm ci` and `npm run mobile:ios`.
2. In Xcode, select the App target and Ivan's Apple Developer team under Signing & Capabilities. Confirm the permanent bundle ID before uploading.
3. Run on a simulator/iPhone first. The CI simulator build cannot be installed through TestFlight.
4. Create RDMC Bridgeport in App Store Connect using the same bundle ID. Archive a signed device build and upload through Xcode Organizer.
5. Complete export-compliance and beta details. For ordinary club members, use external TestFlight testing; Apple's beta review may be required. Do not grant App Store Connect staff access just to let brothers test.

Enrollment, payments, account verification, agreements, certificates and store submission are still pending. The app has not been accepted by either store.

## Before inviting brothers

- Verify sign-in, sign-out, pending-account approval and blocked-account access on real iPhone and Android devices.
- Confirm chat sending/refresh, inventory controls and owner-only screens with designated test accounts.
- Confirm flyers/logo images, keyboard scrolling and bottom navigation on a small phone.
- Test Zoom, phone calls, WhatsApp, email and text links; confirm these launch the intended app.
- Provide a public privacy-policy URL, support contact and accurate store privacy/data-safety declarations. Review account-deletion requirements before a store review; the current app has no self-service deletion flow.
- Verify screenshots and description show available features honestly. Dashboard funds/tasks/rides contain sample values.

## Automated checks

The Mobile beta workflow builds the bundled web app, an Android debug APK and an unsigned iOS simulator app. These validate compilation, not device behavior or store acceptance. It never uploads to a store or sends invitations.

References: https://capacitorjs.com/docs/getting-started/environment-setup ; https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/ ; https://support.google.com/googleplay/android-developer/answer/9845334

Validation on October 2, 2026: the existing web build, mobile bundle, copied assets, Capacitor sync, Android debug APK and unsigned iOS simulator build passed. Tested native commit: `5048e45b2c1d04f516e398bc477632f2f3eae4aa`. Build results: https://github.com/ivansavchuk77777-ux/rdmc-connecticut./actions/runs/37026792579 . The Android SDK setup now requests platform-tools explicitly, and the iOS job uses an Intel macOS 26 runner after ARM runner capacity prevented the first attempt from starting. Real-device behavior, signing and store uploads remain unverified.
