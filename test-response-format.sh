#!/bin/bash

BASE_URL="http://localhost:8000/api"

echo "🔍 Testing Response Format..."
echo "============================================"
echo ""

# Test pagination structure
echo "Testing Pagination Structure:"
echo "Endpoint: /reports/history/penjualan?page=1&perPage=50"
echo ""
curl -s "$BASE_URL/reports/history/penjualan?page=1&perPage=50" | python -m json.tool 2>/dev/null || echo "JSON parsing failed or no data"
echo ""
echo "--------------------------------------------"
echo ""

echo "Testing Dashboard Top Products:"
echo "Endpoint: /dashboard/top-products?range=week"
echo ""
curl -s "$BASE_URL/dashboard/top-products?range=week" | python -m json.tool 2>/dev/null || echo "JSON parsing failed or no data"
echo ""
echo "--------------------------------------------"
echo ""

echo "Testing Category Distribution:"
echo "Endpoint: /dashboard/category-distribution"
echo ""
curl -s "$BASE_URL/dashboard/category-distribution" | python -m json.tool 2>/dev/null || echo "JSON parsing failed or no data"
echo ""
echo "--------------------------------------------"
echo ""

echo "Testing Dashboard Stats:"
echo "Endpoint: /dashboard/stats?range=week"
echo ""
curl -s "$BASE_URL/dashboard/stats?range=week" | python -m json.tool 2>/dev/null || echo "JSON parsing failed or no data"
echo ""
echo "============================================"
echo "✅ Response format tests complete"
