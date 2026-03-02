<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\StockMutation;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

/**
 * StockService – inti dari inventory engine.
 *
 * Setiap mutasi stok berjalan di dalam DB::transaction
 * dan menggunakan lockForUpdate() agar aman di LAN multi-PC.
 */
class StockService
{
    /**
     * Mutasi stok produk (IN atau OUT).
     *
     * @throws InsufficientStockException
     */
    public function mutate(
        Product      $product,
        string       $type,       // 'IN' | 'OUT' | 'ADJUSTMENT'
        int          $quantity,
        ?int         $transactionId = null,
        string       $reference = '',
        string       $notes = '',
    ): StockMutation {
        return DB::transaction(function () use ($product, $type, $quantity, $transactionId, $reference, $notes) {
            // Lock row agar tidak ada race condition dari PC lain
            $product = Product::lockForUpdate()->findOrFail($product->id);

            $stockBefore = $product->stock;

            if ($type === 'OUT') {
                if ($product->stock < $quantity) {
                    throw new InsufficientStockException(
                        "Stok {$product->name} tidak mencukupi (tersedia: {$product->stock} {$product->unit})."
                    );
                }
                $product->stock -= $quantity;
            } elseif ($type === 'IN') {
                $product->stock += $quantity;
            } else {
                // ADJUSTMENT – set langsung
                $product->stock = $quantity;
            }

            $product->save();

            return StockMutation::create([
                'product_id'     => $product->id,
                'transaction_id' => $transactionId,
                'type'           => $type,
                'quantity'       => $type === 'ADJUSTMENT' ? abs($quantity - $stockBefore) : $quantity,
                'stock_before'   => $stockBefore,
                'stock_after'    => $product->stock,
                'reference'      => $reference ?: 'Manual',
                'notes'          => $notes,
                'created_by'     => auth()->id() ?? 1,
            ]);
        });
    }

    /**
     * Update Harga Pokok Penjualan (HPP) menggunakan metode Average.
     * Dipanggil setiap kali ada transaksi Pembelian.
     */
    public function updateHPP(Product $product, int $newQty, float $newBuyPrice): void
    {
        // Hitung total nilai lama + total nilai baru
        $oldValue = $product->stock * (float) $product->buy_price;
        $newValue = $newQty * $newBuyPrice;
        $totalQty = $product->stock + $newQty;

        if ($totalQty > 0) {
            $averageHPP = ($oldValue + $newValue) / $totalQty;
            $product->buy_price = round($averageHPP, 2);
            $product->save();
        }
    }

    /**
     * Generate nomor faktur otomatis berdasarkan tipe transaksi + tanggal.
     */
    public function generateInvoiceNumber(string $type): string
    {
        $prefix = match ($type) {
            'pembelian'          => 'PB',
            'penjualan_tunai'    => 'PT',
            'penjualan_kredit'   => 'PK',
            'retur_pembelian'    => 'RPB',
            'retur_penjualan'    => 'RPJ',
            'pembayaran_utang'   => 'BU',
            'pembayaran_piutang' => 'BP',
            'surat_jalan'        => 'SJ',
            'kontra_bon'         => 'KB',
            default              => 'TX',
        };

        $date = now()->format('Ymd');
        $count = Transaction::whereDate('created_at', today())
            ->where('type', $type)
            ->count() + 1;

        return "{$prefix}-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Tentukan arah mutasi stok berdasarkan tipe transaksi.
     */
    public function getStockDirection(string $type): string
    {
        return match ($type) {
            'pembelian', 'retur_penjualan' => 'IN',
            'penjualan_tunai', 'penjualan_kredit',
            'retur_pembelian', 'surat_jalan' => 'OUT',
            default => 'NONE', // pembayaran_utang, dll. tidak merubah stok
        };
    }
}
