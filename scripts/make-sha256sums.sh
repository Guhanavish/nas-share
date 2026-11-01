#!/usr/bin/env bash
# scripts/make-sha256sums.sh
# Generates SHA256SUMS for release assets in a directory.
set -euo pipefail

TARGET_DIR="${1:-.}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Directory '$TARGET_DIR' does not exist." >&2
  exit 1
fi

cd "$TARGET_DIR"

if command -v sha256sum >/dev/null 2>&1; then
  HASH_CMD="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
  HASH_CMD="shasum -a 256"
else
  echo "Error: Neither sha256sum nor shasum found on PATH." >&2
  exit 1
fi

OUTPUT_FILE="SHA256SUMS"
rm -f "$OUTPUT_FILE"

FILES=()
for f in *.exe *.apk *.tar.gz *.zip; do
  [ -e "$f" ] && FILES+=("$f")
done

if [ ${#FILES[@]} -eq 0 ]; then
  echo "Warning: No release binaries (*.exe, *.apk, *.tar.gz, *.zip) found in $TARGET_DIR." >&2
  exit 0
fi

$HASH_CMD "${FILES[@]}" > "$OUTPUT_FILE"

echo "Generated $OUTPUT_FILE in $(pwd):"
echo "----------------------------------------"
cat "$OUTPUT_FILE"
echo "----------------------------------------"
echo "Done."
