# BSB International School Android App

React Native / Expo shell for the parent, teacher, and driver app.

## Roles

- Parent: attendance, fees, results, notices, homework
- Teacher: attendance, marks, homework, remarks, student progress photos
- Driver: pickup list, parent contact, route, bus payment status

## Production Path

1. Install Expo and EAS CLI.
2. Replace `extra.apiBaseUrl` in `app.json` with the deployed backend API URL.
3. Add Firebase Cloud Messaging or Expo Notifications credentials.
4. Run `npx eas build -p android --profile production`.
5. Upload the signed AAB to Google Play Console.
