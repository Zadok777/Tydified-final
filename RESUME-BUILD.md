# Chorely — Build / Play Store Resume Notes

_Last updated: 2026-06-30_

## Goal
Get a signed Android build (`.aab`) to upload to **Google Play Console → Internal testing**.
This both lets us test on a phone AND satisfies Google's "register your package names /
prove ownership by providing the APK signed with your private key" prompt. Uploading the
signed bundle IS the ownership proof — no private key to generate by hand; EAS holds it.

- App: Expo SDK 54 (expo 54.0.35, react-native 0.81.5)
- Android package: `com.zad0k777.chorely`
- iOS bundle id: `com.zad0k777.chorely`
- EAS profiles (eas.json): `preview` = APK (internal), `production` = AAB (autoIncrement)
- EAS login: DONE (logged in successfully)

## Where we got stuck (BLOCKER)
`npx eas build --platform android --profile production` fails early at the
`expo config --json` step with:

```
/Users/santiagos4god/Desktop/Chorely 2/node_modules/expo/bin/cli config --json exited with non-zero code: 1
TypeError: exec is not a function
  at node_modules/expo/node_modules/@expo/cli/build/bin/cli:252:5
Node.js v22.17.1
```

### What we know
- @expo/cli version is CORRECT: expo@54.0.35 wants @expo/cli@54.0.25, and 54.0.25 is what's installed (nested at `node_modules/expo/node_modules/@expo/cli`). No version skew.
- The config module DOES export `expoConfig`, and `typeof expoConfig === 'function'` when required directly. So the code itself is fine.
- Yet running the bundled cli (`node node_modules/expo/.../bin/cli config --json`) crashes with "exec is not a function".
- Conclusion / hypothesis: **partial or corrupted `node_modules` install.** Standard fix is a clean reinstall. Node is v22.17.1.

## NEXT STEP (start here)
1. Confirm the crash is reproducible:
   ```
   node node_modules/expo/node_modules/@expo/cli/build/bin/cli config --json
   ```
2. Clean reinstall:
   ```
   rm -rf node_modules
   npm install
   ```
   (optionally `npm cache clean --force` first if it persists)
3. Re-verify config works:
   ```
   npx expo config --json | head
   ```
   Should print JSON, exit 0.
4. If still broken, try aligning the toolchain:
   ```
   npx expo install --fix
   ```
   and consider whether Node 22 vs the project's expected Node is the issue
   (Expo SDK 54 supports Node 20/22; try Node 20 LTS via nvm if it keeps failing).
5. Once `expo config --json` works, run the real build:
   ```
   npx eas build --platform android --profile production
   ```
   Answer prompts: create EAS project → **Yes**; generate Android keystore → **Yes**.
   (The Expo Go production warning is harmless; ignore it.)
6. Wait for cloud build (10–30 min, free tier queue). Download the `.aab` from the
   build details URL it prints.

## Then in Play Console
1. Create app (if needed): name **Chorely**, package `com.zad0k777.chorely`.
2. Testing → Internal testing → Create new release → upload the `.aab`.
3. Add yourself as a tester (email), save, review + roll out.
4. Install via the opt-in link on your phone to test.

## Notes
- eas-cli is v20.4.0; a newer one exists but current version builds fine. Skip upgrade for now.
- `preview` profile builds an APK if you ever want a sideloadable file instead of a Play upload.
