<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Setting;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KontraBonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['customer'])
            ->whereIn('type', ['penjualan_tunai', 'penjualan_kredit'])
            ->where('remaining', '>', 0)
            ->orderBy('date');

        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->from) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->to) {
            $query->whereDate('date', '<=', $request->to);
        }

        $transactions = $query->paginate($request->perPage ?? 25);

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function printBilling(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'transaction_ids' => ['required', 'array'],
            'transaction_ids.*' => ['exists:transactions,id'],
            'interest_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $customer = Customer::find($validated['customer_id']);
        $transactions = Transaction::whereIn('id', $validated['transaction_ids'])
            ->with('items')
            ->get();

        $totalAmount = $transactions->sum('remaining');
        $interestRate = $validated['interest_rate'] ?? 0;
        $interestAmount = $totalAmount * ($interestRate / 100);
        $grandTotal = $totalAmount + $interestAmount;

        $aging = [
            'current' => $transactions->whereBetween('date', [now()->subDays(30), now()])->sum('remaining'),
            'days_1_30' => $transactions->whereBetween('date', [now()->subDays(60), now()->subDays(31)])->sum('remaining'),
            'days_31_60' => $transactions->whereBetween('date', [now()->subDays(90), now()->subDays(61)])->sum('remaining'),
            'days_60_plus' => $transactions->where('date', '<', now()->subDays(90))->sum('remaining'),
        ];

        $data = [
            'billingNumber' => 'KB-' . now()->format('Ymd-His'),
            'date' => now()->toDateString(),
            'customer' => $customer,
            'transactions' => $transactions,
            'totalAmount' => $totalAmount,
            'interestRate' => $interestRate,
            'interestAmount' => $interestAmount,
            'grandTotal' => $grandTotal,
            'aging' => $aging,
        ];

        $storeSettings = [
            'name' => Setting::get('store_name') ?? 'Toko Sejahtera',
            'phone' => Setting::get('phone') ?? '',
            'address' => Setting::get('address') ?? '',
            'npwp' => Setting::get('npwp') ?? '',
            'siup' => Setting::get('siup') ?? '',
        ];

        $pdf = PDF::loadView('pdf.billing-statement', compact('data', 'storeSettings'))
            ->setPaper('a4')
            ->setOption('isHtml5ParserEnabled', true);

        $filename = "billing-statement-{$customer->id}-" . date('Ymd') . ".pdf";
        Storage::disk('public')->put("billing-statements/{$filename}", $pdf->output());

        return response()->json([
            'url' => asset("storage/billing-statements/{$filename}"),
            'filename' => $filename,
            'billing_number' => $data['billingNumber'],
        ]);
    }

    public function calculateAging(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
        ]);

        $customer = Customer::find($validated['customer_id']);
        
        $transactions = Transaction::with('items')
            ->where('customer_id', $customer->id)
            ->where('remaining', '>', 0)
            ->orderBy('date')
            ->get();

        $aging = [
            'current' => $transactions->whereBetween('date', [now()->subDays(30), now()])->sum('remaining'),
            'days_1_30' => $transactions->whereBetween('date', [now()->subDays(60), now()->subDays(31)])->sum('remaining'),
            'days_31_60' => $transactions->whereBetween('date', [now()->subDays(90), now()->subDays(61)])->sum('remaining'),
            'days_60_plus' => $transactions->where('date', '<', now()->subDays(90))->sum('remaining'),
            'total' => $transactions->sum('remaining'),
        ];

        return response()->json([
            'data' => [
                'customer' => $customer,
                'transactions' => $transactions,
                'aging' => $aging,
            ],
        ]);
    }
}
