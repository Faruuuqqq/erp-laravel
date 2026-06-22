<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Setting;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

    public function printBilling(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'transaction_ids' => ['required', 'array'],
            'transaction_ids.*' => ['exists:transactions,id'],
            'interest_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'download' => ['nullable', 'boolean'],
            'filename' => ['nullable', 'string', 'max:180'],
        ]);

        try {
            $customer = Customer::find($validated['customer_id']);
            $transactions = Transaction::whereIn('id', $validated['transaction_ids'])
                ->where('customer_id', $customer->id)
                ->where('remaining', '>', 0)
                ->with('details')
                ->orderBy('date')
                ->get();

            if ($transactions->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada transaksi piutang valid untuk customer ini.',
                ], 422);
            }

            $totalAmount = $transactions->sum('remaining');
            $interestRate = $validated['interest_rate'] ?? 0;
            $interestAmount = $totalAmount * ($interestRate / 100);
            $grandTotal = $totalAmount + $interestAmount;

            $aging = $this->calculateAgingBuckets($transactions);
            $dueDays = max(1, min(90, (int) Setting::get('billing_due_days', 7)));
            $issuedDate = now();

            $data = [
                'billingNumber' => 'KB-' . $issuedDate->format('Ymd-His'),
                'date' => $issuedDate->toDateString(),
                'issuedAt' => $issuedDate->toDateString(),
                'dueDate' => $issuedDate->copy()->addDays($dueDays)->toDateString(),
                'dueDays' => $dueDays,
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
                'phone' => Setting::get('phone') ?? Setting::get('store_phone', ''),
                'address' => Setting::get('address') ?? Setting::get('store_address', ''),
                'email' => Setting::get('email') ?? Setting::get('store_email', ''),
                'npwp' => Setting::get('npwp') ?? Setting::get('store_npwp', ''),
                'siup' => Setting::get('siup') ?? '',
                'bank_name' => Setting::get('bank_name', ''),
                'bank_account_name' => Setting::get('bank_account_name', ''),
                'bank_account_number' => Setting::get('bank_account_number', ''),
                'payment_terms' => Setting::get('billing_payment_terms', 'Pembayaran maksimal {due_days} hari sejak tanggal terbit dokumen.'),
                'approver_name' => Setting::get('billing_approver_name', 'Finance'),
                'approver_title' => Setting::get('billing_approver_title', 'AR Officer'),
            ];

            $pdf = PDF::loadView('pdf.billing-statement', compact('data', 'storeSettings'))
                ->setPaper('a4')
                ->setOption('isHtml5ParserEnabled', true);

            $filename = "billing-statement-{$customer->id}-" . date('Ymd') . ".pdf";

            if ($request->boolean('download')) {
                $requestedFilename = (string) ($validated['filename'] ?? $filename);

                return $pdf->download($this->sanitizePdfFilename($requestedFilename));
            }

            Storage::disk('public')->put("billing-statements/{$filename}", $pdf->output());

            return response()->json([
                'url' => asset("storage/billing-statements/{$filename}"),
                'filename' => $filename,
                'billing_number' => $data['billingNumber'],
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to generate billing PDF: ' . $e->getMessage(), ['customer_id' => $validated['customer_id']]);
            return response()->json(['message' => 'Gagal membuat file PDF Kontra Bon. Silakan coba lagi.'], 500);
        }
    }

    public function calculateAging(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
        ]);

        $customer = Customer::find($validated['customer_id']);
        
        $transactions = Transaction::with('details')
            ->where('customer_id', $customer->id)
            ->where('remaining', '>', 0)
            ->orderBy('date')
            ->get();

        $aging = $this->calculateAgingBuckets($transactions);
        $aging['total'] = $transactions->sum('remaining');

        return response()->json([
            'data' => [
                'customer' => $customer,
                'transactions' => $transactions,
                'aging' => $aging,
            ],
        ]);
    }

    private function sanitizePdfFilename(string $filename): string
    {
        $cleaned = preg_replace('/[^A-Za-z0-9._-]/', '-', trim($filename)) ?? '';
        $cleaned = trim($cleaned, '-.');

        if ($cleaned === '') {
            $cleaned = 'billing-statement';
        }

        if (!str_ends_with(strtolower($cleaned), '.pdf')) {
            $cleaned .= '.pdf';
        }

        return $cleaned;
    }

    private function calculateAgingBuckets(Collection $transactions): array
    {
        $now = now();

        $current0To30 = $transactions
            ->filter(fn (Transaction $trx) => $now->diffInDays($trx->date) <= 30)
            ->sum('remaining');

        $days31To60 = $transactions
            ->filter(function (Transaction $trx) use ($now) {
                $days = $now->diffInDays($trx->date);

                return $days >= 31 && $days <= 60;
            })
            ->sum('remaining');

        $days61To90 = $transactions
            ->filter(function (Transaction $trx) use ($now) {
                $days = $now->diffInDays($trx->date);

                return $days >= 61 && $days <= 90;
            })
            ->sum('remaining');

        $days90Plus = $transactions
            ->filter(fn (Transaction $trx) => $now->diffInDays($trx->date) > 90)
            ->sum('remaining');

        return [
            'current_0_30' => $current0To30,
            'days_31_60' => $days31To60,
            'days_61_90' => $days61To90,
            'days_90_plus' => $days90Plus,
            // Backward-compatibility keys for existing clients
            'current' => $current0To30,
            'days_1_30' => $days31To60,
            'days_31_60_legacy' => $days61To90,
            'days_31_60_old' => $days61To90,
            'days_60_plus' => $days90Plus,
            'days_31_60_old_bucket' => $days61To90,
        ];
    }
}
