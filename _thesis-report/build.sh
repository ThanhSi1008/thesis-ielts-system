#!/bin/bash
# =============================================================
# build.sh — Full LaTeX build: xelatex → biber → xelatex × 2
# Usage: ./build.sh
# =============================================================

set -e  # Dừng ngay nếu bất kỳ bước nào lỗi

DIR="$(cd "$(dirname "$0")" && pwd)"
MAIN="main"
LOG="$DIR/$MAIN.log"

# ── Màu terminal ─────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo -e "\n${CYAN}${BOLD}[$1/4] $2${NC}"; }
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
fail() { echo -e "${RED}  ✗ $1${NC}"; }

echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  LaTeX Full Build — XeLaTeX + Biber${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$DIR"

# ── Kiểm tra công cụ ─────────────────────────────────────────
for tool in xelatex biber; do
  if ! command -v "$tool" &>/dev/null; then
    fail "$tool không tìm thấy. Kiểm tra lại TeX Live."
    exit 1
  fi
done

XELATEX_ARGS="-synctex=1 -interaction=nonstopmode -file-line-error"

run_xelatex() {
  xelatex $XELATEX_ARGS "$MAIN.tex" > /dev/null 2>&1
  local pages
  pages=$(grep "Output written" "$LOG" | grep -o '[0-9]* page' | head -1)
  ok "xelatex xong — $pages"
}

# ── [1/4] xelatex lần 1 ─────────────────────────────────────
step 1 "xelatex (tạo .bcf)"
if ! run_xelatex; then
  fail "xelatex lần 1 thất bại. Xem chi tiết:"
  grep -E "^.*:[0-9]+: |^! " "$LOG" | head -10
  exit 1
fi

# ── [2/4] biber ──────────────────────────────────────────────
step 2 "biber (xử lý bibliography)"
BIBER_OUT=$(biber "$MAIN" 2>&1)
if echo "$BIBER_OUT" | grep -q "^ERROR"; then
  fail "biber thất bại:"
  echo "$BIBER_OUT" | grep "^ERROR" | head -5
  exit 1
fi
BIB_COUNT=$(echo "$BIBER_OUT" | grep -c "Processing entry" || true)
ok "biber xong — $BIB_COUNT entries"

# ── [3/4] xelatex lần 2 ─────────────────────────────────────
step 3 "xelatex (resolve citations)"
if ! run_xelatex; then
  fail "xelatex lần 2 thất bại."
  exit 1
fi

# ── [4/4] xelatex lần 3 ─────────────────────────────────────
step 4 "xelatex (fix page numbers & TOC)"
if ! run_xelatex; then
  fail "xelatex lần 3 thất bại."
  exit 1
fi

# ── Kiểm tra kết quả ─────────────────────────────────────────
echo ""
UNDEF=$(grep -c "Citation.*undefined" "$LOG" 2>/dev/null || true)
if [ "$UNDEF" -gt 0 ]; then
  warn "$UNDEF citation vẫn undefined — kiểm tra references.bib"
else
  ok "Không có undefined citation"
fi

PAGES=$(grep "Output written" "$LOG" | tail -1 | grep -o '[0-9]* page' | head -1)
SIZE=$(du -sh "$MAIN.pdf" 2>/dev/null | cut -f1)

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}  ✅ Build hoàn tất!${NC}"
echo -e "  📄 $MAIN.pdf — $PAGES — $SIZE"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Mở PDF (macOS)
open "$MAIN.pdf" 2>/dev/null || true
