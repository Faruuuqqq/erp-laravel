<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExportController extends Controller
{
    public function products(Request $request)
    {
        $products = Product::query()
            ->with('category:id,name', 'warehouse:id,name')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->when($request->category, fn($q) => $q->whereHas('category', fn($q) => $q->where('name', $request->category)))
            ->get(['id', 'code', 'name', 'category_id', 'buy_price', 'sell_price', 'stock', 'min_stock', 'unit', 'warehouse_id']);

        return $this->generateCsv(
            $products,
            'products_' . now()->format('YmdHis'),
            ['Kode', 'Nama', 'Kategori', 'Harga Beli', 'Harga Jual', 'Stok', 'Stok Min', 'Unit', 'Gudang']
        );
    }

    public function customers(Request $request)
    {
        $customers = Customer::query()
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->get(['id', 'name', 'phone', 'email', 'address', 'city', 'credit_limit', 'is_verified']);

        return $this->generateCsv(
            $customers,
            'customers_' . now()->format('YmdHis'),
            ['ID', 'Nama', 'Telepon', 'Email', 'Alamat', 'Kota', 'Limit Kredit', 'Terverifikasi']
        );
    }

    public function suppliers(Request $request)
    {
        $suppliers = Supplier::query()
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->get(['id', 'name', 'phone', 'email', 'address', 'city']);

        return $this->generateCsv(
            $suppliers,
            'suppliers_' . now()->format('YmdHis'),
            ['ID', 'Nama', 'Telepon', 'Email', 'Alamat', 'Kota']
        );
    }

    public function transactions(Request $request)
    {
        $transactions = Transaction::query()
            ->with('customer:id,name', 'supplier:id,name')
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->from, fn($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('date', '<=', $request->to))
            ->orderByDesc('date')
            ->limit(10000)
            ->get(['id', 'invoice_number', 'date', 'type', 'customer_id', 'supplier_id', 'subtotal', 'discount', 'tax', 'total', 'paid', 'remaining', 'status']);

        return $this->generateCsv(
            $transactions,
            'transactions_' . now()->format('YmdHis'),
            ['No. Invoice', 'Tanggal', 'Tipe', 'Pelanggan', 'Supplier', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Dibayar', 'Sisa', 'Status']
        );
    }

    public function expenses(Request $request)
    {
        $expenses = Expense::query()
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->from, fn($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to, fn($q) => $q->whereDate('date', '<=', $request->to))
            ->orderByDesc('date')
            ->limit(10000)
            ->get(['id', 'code', 'date', 'category', 'amount', 'description', 'created_at']);

        return $this->generateCsv(
            $expenses,
            'expenses_' . now()->format('YmdHis'),
            ['Kode', 'Tanggal', 'Kategori', 'Jumlah', 'Deskripsi']
        );
    }

    private function generateCsv($data, string $filename, array $headers = []): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $headers = $headers ?: array_keys($data->first()?->toArray() ?: []);

        return response()->stream(function () use ($data, $headers) {
            $handle = fopen('php://output', 'w');
            
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, $headers);

            foreach ($data as $row) {
                $values = [];
                foreach ($headers as $i => $header) {
                    $key = strtolower(str_replace(' ', '_', $header));
                    $values[] = match ($key) {
                        'kategori' => $row->category?->name ?? ($row->category ?? ''),
                        'gudang' => $row->warehouse?->name ?? ($row->warehouse_id ?? ''),
                        'pelanggan' => $row->customer?->name ?? ($row->customer_id ?? ''),
                        'supplier' => $row->supplier?->name ?? ($row->supplier_id ?? ''),
                        'terverifikasi' => $row->is_verified ? 'Ya' : 'Tidak',
                        'limit_kredit' => $row->credit_limit ?? 0,
                        default => $row->{$key} ?? '',
                    };
                }
                fputcsv($handle, $values);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ]);
    }
}