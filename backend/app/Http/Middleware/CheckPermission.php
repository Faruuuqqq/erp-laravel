<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $module, string $action = 'view'): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->isOwner()) {
            return $next($request);
        }

        if (!$user->hasPermission($module, $action)) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.',
            ], 403);
        }

        return $next($request);
    }
}
