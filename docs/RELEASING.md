# NASend Release Guide

This document describes how to build, verify, and publish a release for **NASend** (`Guhanavish/nas-share`).

---

## 1. Prerequisites

- **Windows Build**:
  - Rust stable toolchain (`rustup default stable`)
  - Node.js 20+
  - Tauri CLI dependencies (C++ build tools / MSVC)
- **Android Build**:
  - JDK 17+
  - Android SDK with command-line tools & NDK
- **Release Tooling**:
  - `bash` with `sha256sum` or `shasum -a 256`
  - GitHub CLI (`gh`) or access to GitHub web interface

---

## 2. Building Release Binaries

### A. Windows (Portable EXE & NSIS Setup)
```bash
cd apps/windows
npm ci
npm run tauri build
```
Build outputs:
- **Portable Standalone**: `apps/windows/src-tauri/target/release/nas-share-desktop.exe`
- **NSIS Setup Installer**: `apps/windows/src-tauri/target/release/bundle/nsis/NAS-Share-setup.exe`

### B. Android (Universal APK)
```bash
cd apps/android
./gradlew assembleRelease
```
Build output:
- **Universal Package**: `apps/android/app/build/outputs/apk/release/app-release.apk`

---

## 3. Generating Checksums

Place the three generated binaries in a staging directory:
- `NAS-Share-setup.exe`
- `nas-share-desktop.exe`
- `app-release.apk`

Run the checksum generation script:
```bash
bash scripts/make-sha256sums.sh <path-to-binaries>
```

This generates `SHA256SUMS` containing:
```
<sha256-hash>  NAS-Share-setup.exe
<sha256-hash>  nas-share-desktop.exe
<sha256-hash>  app-release.apk
```

---

## 4. Creating and Publishing the GitHub Release

### Using GitHub CLI:
```bash
# 1. Create and push tag
git tag v0.1.0
git push origin v0.1.0

# 2. Publish release with binaries and checksum file
gh release create v0.1.0 \
  NAS-Share-setup.exe \
  nas-share-desktop.exe \
  app-release.apk \
  SHA256SUMS \
  --title "NASend v0.1.0" \
  --notes-file SHA256SUMS
```

### Or Using GitHub Web UI:
1. Navigate to `https://github.com/Guhanavish/nas-share/releases/new`.
2. Choose tag: `v0.1.0` (create new tag on publish).
3. Set release title: `NASend v0.1.0`.
4. Attach the four files:
   - `NAS-Share-setup.exe`
   - `nas-share-desktop.exe`
   - `app-release.apk`
   - `SHA256SUMS`
5. Paste the contents of `SHA256SUMS` into the release description body.
6. Click **Publish release**.

---

## 5. Automated Site Binding

Once the release is published, the site at `https://nasend.vercel.app` automatically:
1. Fetches `api.github.com/repos/Guhanavish/nas-share/releases/latest`.
2. Binds the download buttons directly to the real assets.
3. Extracts and displays the real file sizes and SHA-256 hashes.
4. Renders the local verification instructions (`Get-FileHash` / `shasum`).

---

## 6. Repository Maintenance (Optional)

The repo previously had test binaries committed in `release-assets/`.
To permanently clean Git history after releasing:
```bash
# Optional: remove large committed binaries from repository history
git filter-repo --path release-assets --invert-paths
```
Future builds are strictly excluded via `.gitignore`.
