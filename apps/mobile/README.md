# BSB International School Android App

React Native / Expo shell for the parent, teacher, and driver app.

## Roles

- Parent: attendance, fees, results, notices, homework
- Teacher: attendance, marks, homework, remarks, student progress photos
- Driver: pickup list, parent contact, route, bus payment status

## Production Path

1. Replace `extra.apiBaseUrl` in `app.json` with the deployed backend API URL.
2. Run `npx eas init` once and replace `extra.eas.projectId`.
3. Add Firebase Cloud Messaging or Expo Notifications credentials.
4. Build testing APK:

```bash
npm run preview:android
```

5. Build Play Store AAB:

```bash
npm run build:android
```

6. Upload the signed AAB to Google Play Console.

## Current Build

- Role switcher for Parent, Teacher, and Driver
- Real `/auth/login` API attempt
- Offline demo mode when backend is not reachable
- Parent metrics and module cards
- Teacher metrics and module cards
- Driver route, pickup, and collection module cards
