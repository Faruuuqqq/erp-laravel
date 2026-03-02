<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $transaction->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
        .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header-left { flex: 1; }
        .header-right { flex: 1; text-align: right; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .store-info { color: #666; margin-bottom: 3px; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .invoice-number { color: #666; }
        .section-title { font-weight: bold; background: #f5f5f5; padding: 8px; margin: 20px 0 10px 0; border-bottom: 2px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f9f9f9; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-section { margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row.final { font-weight: bold; font-size: 14px; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
        .footer-info { display: flex; justify-content: space-between; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; font-size: 10px; }
        .status.completed { background: #d4edda; color: #155724; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.cancelled { background: #f8d7da; color: #721c24; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 10px; background: #007bff; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-left">
                <div class="store-name">{{ $storeSettings['name'] }}</div>
                @if($storeSettings['phone'])
                    <div class="store-info">Telp: {{ $storeSettings['phone'] }}</div>
                @endif
                @if($storeSettings['address'])
                    <div class="store-info">{{ $storeSettings['address'] }}</div>
                @endif
                @if($storeSettings['npwp'])
                    <div class="store-info">NPWP: {{ $storeSettings['npwp'] }}</div>
                @endif
                @if($storeSettings['siup'])
                    <div class="store-info">SIUP: {{ $storeSettings['siup'] }}</div>
                @endif
            </div>
            <div class="header-right">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">{{ $transaction->invoice_number }}</div>
                <div class="store-info">Tanggal: {{ date('d/m/Y', strtotime($transaction->date)) }}</div>
            </div>
        </div>

        <div class="section-title">Klien</div>
        @if($transaction->customer)
            <div><strong>{{ $transaction->customer->name }}</strong></div>
            @if($transaction->customer->phone)
                <div class="store-info">Telp: {{ $transaction->customer->phone }}</div>
            @endif
            @if($transaction->customer->address)
                <div class="store-info">{{ $transaction->customer->address }}</div>
            @endif
        @elseif($transaction->supplier)
            <div><strong>{{ $transaction->supplier->name }}</strong></div>
            @if($transaction->supplier->phone)
                <div class="store-info">Telp: {{ $transaction->supplier->phone }}</div>
            @endif
            @if($transaction->supplier->address)
                <div class="store-info">{{ $transaction->supplier->address }}</div>
            @endif
        @else
            <div><strong>Umum</strong></div>
        @endif

        <div class="section-title">Rincian Transaksi</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 45%;">Nama Produk</th>
                    <th style="width: 15%;">Qty</th>
                    <th style="width: 15%;">Harga</th>
                    <th style="width: 20%;" class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @php($no = 1)
                @foreach($transaction->items as $item)
                    <tr>
                        <td>{{ $no++ }}</td>
                        <td>{{ $item->productName }}</td>
                        <td>{{ number_format($item->quantity, 0, ',', '.') }}</td>
                        <td>{{ number_format($item->price, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal</span>
                <span>Rp {{ number_format($transaction->subtotal, 0, ',', '.') }}</span>
            </div>
            @if($transaction->discount > 0)
                <div class="total-row">
                    <span>Diskon</span>
                    <span>Rp {{ number_format($transaction->discount, 0, ',', '.') }}</span>
                </div>
            @endif
            @if($transaction->tax > 0)
                <div class="total-row">
                    <span>Pajak</span>
                    <span>Rp {{ number_format($transaction->tax, 0, ',', '.') }}</span>
                </div>
            @endif
            <div class="total-row final">
                <span>Total</span>
                <span>Rp {{ number_format($transaction->total, 0, ',', '.') }}</span>
            </div>
            <div class="total-row">
                <span>Dibayar</span>
                <span>Rp {{ number_format($transaction->paid, 0, ',', '.') }}</span>
            </div>
            @if($transaction->remaining > 0)
                <div class="total-row" style="color: #dc3545; font-weight: bold;">
                    <span>Sisa</span>
                    <span>Rp {{ number_format($transaction->remaining, 0, ',', '.') }}</span>
                </div>
            @endif
        </div>

        @if($transaction->notes)
            <div class="section-title">Catatan</div>
            <div>{{ $transaction->notes }}</div>
        @endif

        <div class="section-title">Status</div>
        <div>
            <span class="status {{ $transaction->status }}">{{ ucfirst($transaction->status) }}</span>
            @if($transaction->payment_status)
                <span class="badge" style="margin-left: 10px;">{{ strtoupper(str_replace('_', ' ', $transaction->payment_status)) }}</span>
            @endif
        </div>

        <div class="footer">
            <div class="footer-info">
                <div>
                    <div style="font-weight: bold;">Terima Kasih</div>
                    <div class="store-info">Terima kasih atas kepercayaan Anda</div>
                </div>
                <div class="text-right">
                    <div style="font-weight: bold;">{{ $storeSettings['name'] }}</div>
                    <div class="store-info">Dicetak: {{ date('d/m/Y H:i') }}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
