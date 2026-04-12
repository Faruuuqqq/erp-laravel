<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::where('email', 'owner@tokosync.local')->first();
if (!$user) {
    echo "User not found\n";
    exit;
}
echo "User exists.\n";
echo "Password match: " . (\Illuminate\Support\Facades\Hash::check('password123', $user->password) ? 'YES' : 'NO') . "\n";
echo "Is active: " . ($user->is_active ? 'YES' : 'NO') . "\n";

$req = \Illuminate\Http\Request::create('/api/login', 'POST', ['email' => 'owner@tokosync.local', 'password' => 'password123']);
$res = app()->handle($req);

echo "Status Code: " . $res->getStatusCode() . "\n";
echo "Response: " . $res->getContent() . "\n";
