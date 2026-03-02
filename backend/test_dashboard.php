
// Test basic route matching
echo "Testing route matching...\n";
echo PHP_EOL;

// Try to simulate Laravel routing
try {
    // This should match /api/dashboard/low-stock
    \$route = request()->path() . '/' . 'dashboard' . '/' . 'low-stock';
    echo "Path: " . \$route . PHP_EOL;
} catch (Exception \$e) {
    echo 'Error: ' . \$e->getMessage() . PHP_EOL;
}
EOF
2>&1
