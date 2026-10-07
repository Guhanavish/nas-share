# NAS Share — Test Checklist

## Prerequisites
- Two devices on same WiFi (phone + PC, or two PCs)
- Android APK installed / Windows app installed
- Cloudflare Worker deployed (`wrangler deploy`)

---

## Test 1: LAN Pairing + Browse + Download (P1)

### Setup
- [ ] Both devices connected to same WiFi
- [ ] Airplane mode OK (no internet needed for LAN)
- [ ] Both apps running with at least 1 shared folder each

### Pairing
- [ ] Device A: Tap Share → Generate Code → shows XXXX-XXXX
- [ ] Device A: QR code displays correctly (encodes `nas://join?room=CODE&v=1`)
- [ ] Device A: 5-minute countdown visible
- [ ] Device B: Tap Share → Enter Code → type code (auto-uppercase, auto-dash)
- [ ] Both: Connection status shows "Verified ✓"
- [ ] Both: Device appears in Devices screen with LAN badge (green)
- [ ] Verify: Code is burned (cannot reuse)

### Browse
- [ ] Device A: Tap on Device B in Devices list → Files screen opens
- [ ] Files screen shows breadcrumb path navigation
- [ ] Directories are clickable, navigate deeper
- [ ] Files show name, size, modified time
- [ ] Grid/list view toggle works
- [ ] Navigate back via breadcrumb or back button

### Download
- [ ] Tap a file → download starts
- [ ] Progress bar shows percentage
- [ ] Small file (1KB): instant download
- [ ] Medium file (10MB): progress visible
- [ ] Large file (100MB): progress bar, completes without error
- [ ] Downloaded file matches original (compare hash)

### Upload
- [ ] Tap upload/FAB button → file picker opens
- [ ] Select file → upload starts with progress
- [ ] File appears on remote device's shared folder
- [ ] Verify file integrity

---

## Test 2: WAN Transfer via WebRTC (P2)

### Setup
- [ ] Phone on mobile data (WiFi OFF)
- [ ] PC on home WiFi
- [ ] Worker deployed and URL configured in both apps

### Pairing (via Worker)
- [ ] PC: Generate code → WebSocket connects to Worker
- [ ] Phone: Enter code → joins Worker room
- [ ] ICE exchange happens via Worker relay
- [ ] WebRTC DataChannel established (check logs: direct|relay|fail)

### Transfer
- [ ] Phone → PC: Upload 50MB file, verify integrity
- [ ] PC → Phone: Download 50MB file, verify integrity
- [ ] Kill app mid-transfer → restart → resume works
- [ ] wrangler tail: shows only signaling messages, zero file bytes

---

## Test 3: Video Streaming with Seek (P3)

- [ ] Share folder containing 500MB video file
- [ ] Remote device: tap video → player opens
- [ ] Playback starts within 2 seconds
- [ ] Seek to middle → playback resumes instantly (Range request)
- [ ] Seek to end → playback resumes
- [ ] Thumbnail visible in file browser before opening

---

## Test 4: Trusted Device Reconnection

- [ ] Pair two devices via code
- [ ] Close both apps completely
- [ ] Restart both apps
- [ ] Devices auto-appear in trusted list (no code needed)
- [ ] Can browse files immediately (LAN) or after DataChannel setup (WAN)
- [ ] Revoke trust on Device A → Device B can no longer connect
- [ ] Device B shows "Access Denied" or similar

---

## Test 5: Worker Isolation

- [ ] Run `wrangler tail` during any file transfer
- [ ] Verify: only signaling messages logged (join, offer, answer, ice, leave)
- [ ] Verify: NO file content, NO filenames, NO paths in logs
- [ ] Verify: SDP content is NOT logged (only metadata)

---

## Test 6: Security

- [ ] Path traversal: request `../../etc/passwd` → returns DENIED or NOT_FOUND
- [ ] Path traversal: request `..\\..\\Windows\\System32` → returns DENIED
- [ ] Unpaired device: direct HTTP to server → returns DENIED (or server not discoverable)
- [ ] Brute force: rapidly try wrong codes → rate limited after 5 attempts
- [ ] ACL: shared folder with READ → upload attempt fails
- [ ] ACL: shared folder with READWRITE → upload succeeds

---

## Test 7: Edge Cases

- [ ] Share folder with unicode filenames → displays correctly
- [ ] Share folder with deeply nested structure (10+ levels) → browse works
- [ ] Share empty folder → shows "No files" message
- [ ] Very large filename (255 chars) → handled gracefully
- [ ] Simultaneous download of 3 files → all complete
- [ ] Kill sender mid-transfer → receiver shows error, can retry
- [ ] Network switch (WiFi → mobile) → reconnects via WAN

---

## Test 8: Android-Specific

- [ ] ForegroundService notification shows "Sharing N folders - tap to stop"
- [ ] App survives background kill → service restarts
- [ ] Tap notification → opens app
- [ ] "Stop" in notification → stops sharing
- [ ] Permission requests shown on first launch
- [ ] Works on Android 10 (API 29) through Android 14 (API 34)

---

## Test 9: Windows-Specific

- [ ] System tray icon appears
- [ ] Tray menu: Show/Hide/Stop Sharing/Quit all work
- [ ] Minimize to tray (window hides, tray stays)
- [ ] Autostart option works (app starts on login)
- [ ] Single instance: launching second instance focuses first
- [ ] Windows Firewall prompt appears on first run
- [ ] Settings: port change requires restart
- [ ] Settings: bandwidth limit applies to transfers
