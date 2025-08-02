# TestFlight Distribution Guide for StitchCounter

This guide walks you through distributing your StitchCounter app to TestFlight for offline iPhone use.

## Prerequisites

- macOS with Xcode installed
- Apple Developer account (free account works for TestFlight)
- iPhone for testing

## First-Time Setup (One-time only)

### 1. Apple Developer Account
- Sign up for free Apple Developer account at [developer.apple.com](https://developer.apple.com)
- No payment required for TestFlight distribution

### 2. App Store Connect Setup
- Go to [App Store Connect](https://appstoreconnect.apple.com)
- Sign in with your Apple Developer account
- Click "My Apps" → "+" → "New App"
- Fill in the form:
  - **Platform**: iOS
  - **Name**: StitchCounter
  - **Primary Language**: English
  - **Bundle ID**: `com.stitchcounter.app` (should auto-populate)
  - **SKU**: Can be anything unique, like `stitchcounter-001`

## Building and Distributing to TestFlight

### 1. Prepare the iOS Build
```bash
# Switch to the iOS branch
git checkout ios-capacitor-setup

# Build the web app and sync to iOS
npm run cap:build

# Open in Xcode
npm run cap:open
```

### 2. Archive in Xcode
- In Xcode, make sure the target device is set to "Any iOS Device" (not Simulator)
- Go to **Product** menu → **Archive**
- Wait for the build to complete (usually 2-5 minutes)
- The Xcode Organizer window will open automatically

### 3. Upload to App Store Connect
- In the Organizer window, select your archive
- Click **"Distribute App"**
- Choose **"App Store Connect"**
- Select **"Upload"** (not Export)
- Follow the prompts:
  - Include bitcode: Yes (default)
  - Upload symbols: Yes (default)
  - Manage Version and Build Number: Automatically manage (default)
- Click **"Upload"**
- Wait for upload to complete

### 4. Set up TestFlight Testing
- Go back to [App Store Connect](https://appstoreconnect.apple.com)
- Select your StitchCounter app
- Go to the **TestFlight** tab
- Wait for your build to appear in "iOS Builds" (processing takes ~5 minutes)
- Once processing is complete, click on your build
- Click **"Internal Testing"** in the sidebar
- Click the **"+"** next to "Internal Testers"
- Add yourself as an internal tester using your Apple ID email

### 5. Install on iPhone
- Download the **TestFlight** app from the App Store on your iPhone
- Check your email for the TestFlight invitation
- Tap the invitation link or open TestFlight app
- Find StitchCounter and tap **"Install"**

## Using the App Offline

Once installed via TestFlight:
- The app works completely offline on your iPhone
- All your knitting projects and counters are stored locally
- No internet connection required after installation
- Perfect for knitting on planes!

## Updating the App

When you make changes to the app:

```bash
# Make your code changes, then:
npm run cap:build
npm run cap:open
```

Then repeat steps 2-3 above (Archive and Upload). TestFlight will automatically notify you of the update on your iPhone.

## TestFlight Limitations

- **90-day expiry**: TestFlight builds expire after 90 days
- **Renewal**: Simply upload a new build before expiry (can be identical)
- **Internal testers**: Up to 100 people can test your app
- **No App Store submission required**: Perfect for personal use

## Troubleshooting

### Build Errors in Xcode
- Make sure you're targeting "Any iOS Device", not a simulator
- Try cleaning: Product → Clean Build Folder

### Upload Fails
- Check your Apple Developer account is active
- Verify the Bundle ID matches in both Xcode and App Store Connect

### App Not Working Offline
- The app stores all data in browser localStorage
- First launch may require brief internet connection to load initial resources
- After that, works completely offline

## Commands Reference

```bash
# Build web app and sync to iOS
npm run cap:build

# Open iOS project in Xcode
npm run cap:open

# Development mode (web version)
npm run dev
```

## App Details

- **Bundle ID**: `com.stitchcounter.app`
- **Data Storage**: Local browser storage (no server required)
- **Offline Capability**: Full offline functionality after initial load
- **Target Platform**: iOS (iPhone/iPad)