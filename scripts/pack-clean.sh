#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_ZIP="$PROJECT_DIR/schoolos-deploy-clean.zip"

echo "🧹 Cleaning temporary build artifacts..."
rm -rf "$PROJECT_DIR/.next" "$PROJECT_DIR/.netlify" "$PROJECT_DIR/.wrangler" "$PROJECT_DIR/.vinext" "$PROJECT_DIR/dist" "$PROJECT_DIR/tsconfig.tsbuildinfo" "$OUTPUT_ZIP"

echo "📦 Creating clean deploy archive: schoolos-deploy-clean.zip ..."
cd "$PROJECT_DIR"
zip -r "$OUTPUT_ZIP" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".next/*" \
  -x ".netlify/*" \
  -x ".wrangler/*" \
  -x ".vinext/*" \
  -x "dist/*" \
  -x "*.tsbuildinfo" \
  -x ".DS_Store" \
  -x "*.zip"

echo "✅ Clean package created at: $OUTPUT_ZIP"
echo "ℹ️  You can now upload $OUTPUT_ZIP directly or push this clean folder to GitHub/GitLab."
