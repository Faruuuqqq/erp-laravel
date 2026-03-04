#!/bin/bash

echo "🖥️  Testing Frontend.v2 Integration..."
echo "============================================"
echo ""

# Check if frontend is running
echo "Checking if frontend is running on http://localhost:5173..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null | grep -q "200\|404"; then
  echo "✅ Frontend is running"
  echo ""
else
  echo "❌ Frontend not running on http://localhost:5173"
  echo "Please start with: cd frontend.v2 && pnpm dev"
  exit 1
fi

echo "Checking build status..."
echo "Open browser and navigate to: http://localhost:5173"
echo ""
echo "Check for:"
echo "  ✓ Page loads without errors"
echo "  ✓ No console errors (press F12 → Console)"
echo "  ✓ No network errors (press F12 → Network)"
echo ""
echo "Test pages to visit:"
echo "  1. http://localhost:5173/dashboard"
echo "  2. http://localhost:5173/informasi/penjualan"
echo "  3. http://localhost:5173/informasi/pembelian"
echo "  4. http://localhost:5173/informasi/retur-penjualan"
echo "  5. http://localhost:5173/informasi/retur-pembelian"
echo "  6. http://localhost:5173/informasi/pembayaran-piutang"
echo "  7. http://localhost:5173/informasi/pembayaran-utang"
echo "  8. http://localhost:5173/informasi/saldo-stok"
echo ""
echo "============================================"
echo "✅ Frontend test setup complete"
