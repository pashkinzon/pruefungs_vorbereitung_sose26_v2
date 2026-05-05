#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "======================================"
echo "📚 Starting PDF Update Process..."
echo "======================================"

echo "[1/4] Running PDF generator script..."
python3 tools/generate_pdf_index.py

echo "[2/4] Staging changes..."
git add .

echo "[3/4] Committing changes..."
# Will continue even if there are no changes to commit (using || true)
git commit -m "Automated PDF update - $(date +'%Y-%m-%d %H:%M')" || {
  echo "No changes to commit. Everything is up to date!"
  exit 0
}

echo "[4/4] Pushing changes to GitHub..."
git push origin main

echo "======================================"
echo "✅ Update complete!"
echo "Your website will reflect the changes in a few minutes."
echo "======================================"
