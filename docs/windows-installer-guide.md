# Windows Installer Guide

## Build Goal

Generate a Windows installer for the office desktop ERP using Electron Builder.

## Steps

1. Install all workspace dependencies
2. Build the renderer bundle:

```bash
npm run build:desktop
```

3. Inside `apps/desktop`, run:

```bash
npm run dist
```

## Expected Output

- `apps/desktop/release/BSB International School ERP Setup.exe`

## Notes

- The installer is configured for NSIS
- Update app icons, signing certificate, and product metadata before production release
- I did not generate the actual `.exe` in this session because dependencies were not installed and packaging was not executed
