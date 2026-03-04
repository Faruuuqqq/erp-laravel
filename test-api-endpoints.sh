#!/bin/bash

BASE_URL="http://localhost:8000/api"
RESULTS=()

echo "🧪 Testing Backend API Endpoints..."
echo "============================================"
echo ""

# Function to test endpoint
test_endpoint() {
  local name=$1
  local url=$2

  echo "Testing: $name"
  echo "URL: $url"

  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

  if [ "$response" = "200" ] || [ "$response" = "302" ]; then
    echo "✅ PASS - Status: $response"
    RESULTS+=("✅ $name")
  else
    echo "❌ FAIL - Status: $response"
    RESULTS+=("❌ $name - HTTP $response")
  fi
  echo ""
}

# Dashboard Endpoints
echo "--- Dashboard Endpoints ---"
test_endpoint "Dashboard Stats (today)" "$BASE_URL/dashboard/stats?range=today"
test_endpoint "Dashboard Stats (week)" "$BASE_URL/dashboard/stats?range=week"
test_endpoint "Dashboard Top Products" "$BASE_URL/dashboard/top-products?range=week"
test_endpoint "Dashboard Category Distribution" "$BASE_URL/dashboard/category-distribution"
test_endpoint "Dashboard Recent Transactions" "$BASE_URL/dashboard/recent-transactions"
test_endpoint "Dashboard Low Stock" "$BASE_URL/dashboard/low-stock"

# Report Endpoints
echo "--- Report Endpoints ---"
test_endpoint "History Penjualan" "$BASE_URL/reports/history/penjualan?page=1&perPage=50"
test_endpoint "History Pembelian" "$BASE_URL/reports/history/pembelian?page=1&perPage=50"
test_endpoint "History Retur Penjualan" "$BASE_URL/reports/history/retur-penjualan?page=1&perPage=50"
test_endpoint "History Retur Pembelian" "$BASE_URL/reports/history/retur-pembelian?page=1&perPage=50"
test_endpoint "History Pembayaran Piutang" "$BASE_URL/reports/history/pembayaran-piutang?page=1&perPage=50"
test_endpoint "History Pembayaran Utang" "$BASE_URL/reports/history/pembayaran-utang?page=1&perPage=50"

# Info Endpoints
echo "--- Info Endpoints ---"
test_endpoint "Saldo Piutang" "$BASE_URL/info/saldo-piutang"
test_endpoint "Saldo Utang" "$BASE_URL/info/saldo-utang"
test_endpoint "Saldo Stok (paginated)" "$BASE_URL/info/saldo-stok?page=1&perPage=50"
test_endpoint "Kartu Stok" "$BASE_URL/info/kartu-stok?product_id=1"
test_endpoint "Laporan Harian" "$BASE_URL/info/laporan-harian"

# Summary
echo ""
echo "============================================"
echo "📊 Test Summary"
echo "============================================"
for result in "${RESULTS[@]}"; do
  echo "$result"
done

echo ""
echo "Total Tests: ${#RESULTS[@]}"
echo ""

# Count passes and failures
passes=$(echo "${RESULTS[@]}" | grep -c "✅")
failures=$(echo "${RESULTS[@]}" | grep -c "❌")

echo "Passed: $passes"
echo "Failed: $failures"
echo ""

if [ "$failures" -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed. Check the results above."
  exit 1
fi
