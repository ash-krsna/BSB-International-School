# Android App And Play Store Guide

The mobile app lives in `apps/mobile` and is designed as a React Native / Expo Android app shell.

## Local Preview

```bash
npm --workspace apps/mobile run start
```

Use Expo Go for a quick preview, or generate a native Android project with:

```bash
npm --workspace apps/mobile run android
```

## Production Build

1. Create an Expo account.
2. Install EAS CLI: `npm install -g eas-cli`.
3. Set the production API URL in `apps/mobile/app.json`.
4. Configure Android package name: `com.bsb.internationalschool`.
5. Run:

```bash
npx eas build -p android --profile production
```

## Play Store Checklist

- App name: `BSB International School`
- App category: Education
- Upload signed `.aab`
- Add screenshots for parent, teacher, and driver views
- Add privacy policy page before public launch
- Enable production notification credentials
