<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu Stok - {{ $product->name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
        .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .store-info { color: #666; margin-bottom: 3px; font-size: 10px; }
        .report-title { font-size: 18px; font-weight: bold; color: #333; margin: 15px 0 10px 0; }
        .product-info { background: #f5f5f5; padding: 12px; margin: 15px 0; border-left: 4px solid #007bff; }
        .product-info div { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
        th, td { padding: 8px 5px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f9f9f9; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .type-in { color: #28a745; font-weight: bold; }
        .type-out { color: #dc3545; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; }
        .footer-info { color: #666; font-size: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="store-name">{{ $storeSettings['name'] }}</div>
            @if($storeSettings['phone'])
                <div class="store-info">Telp: {{ $storeSettings['phone'] }}</div>
            @endif
            @if($storeSettings['address'])
                <div class="store-info">{{ $storeSettings['address'] }}</div>
            @endif
        </div>

        <div class="report-title text-center">KARTU STOK</div>

        <div class="product-info">
            <div><strong>Kode Produk:</strong> {{ $product->code }}</div>
            <div><strong>Nama Produk:</strong> {{ $product->name }}</div>
            <div><strong>Satuan:</strong> {{ $product->unit }}</div>
            <div><strong>Stok Saat Ini:</strong> {{ number_format($product->stock, 0, ',', '.') }}</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 12%;">Tanggal</th>
                    <th style="width: 8%;">Tipe</th>
                    <th style="width: 15%;">Referensi</th>
                    <th style="width: 28%;">Keterangan</th>
                    <th style="width: 8%;" class="text-right">Masuk</th>
                    <th style="width: 8%;" class="text-right">Keluar</th>
                    <th style="width: 10%;" class="text-right">Saldo</th>
                    <th style="width: 11%;" class="text-right">Nilai (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @php($runningBalance = 0)
                @if($mutations->count() > 0)
                    @foreach($mutations as $mutation)
                        @php($runningBalance = $mutation->stock_after)
                        <tr>
                            <td>{{ date('d/m/Y H:i', strtotime($mutation->created_at)) }}</td>
                            <td class="text-center">
                                <span class="type-{{ strtolower($mutation->type) }}">{{ $mutation->type }}</span>
                            </td>
                            <td>{{ $mutation->reference ?? '-' }}</td>
                            <td>{{ $mutation->description ?? '-' }}</td>
                            <td class="text-right">
                                @if($mutation->type === 'IN')
                                    {{ number_format($mutation->quantity, 0, ',', '.') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-right">
                                @if($mutation->type === 'OUT')
                                    {{ number_format($mutation->quantity, 0, ',', '.') }}
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-right"><strong>{{ number_format($mutation->stock_after, 0, ',', '.') }}</strong></td>
                            <td class="text-right">{{ number_format($mutation->stock_after * $product->buy_price, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                @else
                    <tr>
                        <td colspan="8" class="text-center" style="padding: 30px; color: #666;">Tidak ada mutasi stok</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <div class="footer">
            <div class="footer-info">{{ $storeSettings['name'] }} - Dicetak: {{ date('d/m/Y H:i') }}</div>
        </div>
    </div>
</body>
</html>
