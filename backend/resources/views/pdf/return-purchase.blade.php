<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retur Pembelian {{ $returnPurchase->return_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
        .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header-left { flex: 1; }
        .header-right { flex: 1; text-align: right; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .store-info { color: #666; margin-bottom: 3px; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #dc3545; margin-bottom: 10px; }
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
        .status.processed { background: #d4edda; color: #155724; }
        .status.draft { background: #fff3cd; color: #856404; }
        .status.cancelled { background: #f8d7da; color: #721c24; }
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
                <div class="invoice-title">RETUR PEMBELIAN</div>
                <div class="invoice-number">{{ $returnPurchase->return_number }}</div>
                <div class="store-info">Tanggal: {{ date('d/m/Y', strtotime($returnPurchase->date)) }}</div>
            </div>
        </div>

        <div class="section-title">Supplier</div>
        @if($returnPurchase->supplier)
            <div><strong>{{ $returnPurchase->supplier->name }}</strong></div>
            @if($returnPurchase->supplier->phone)
                <div class="store-info">Telp: {{ $returnPurchase->supplier->phone }}</div>
            @endif
            @if($returnPurchase->supplier->address)
                <div class="store-info">{{ $returnPurchase->supplier->address }}</div>
            @endif
        @else
            <div><strong>-</strong></div>
        @endif

        @if($returnPurchase->transaction)
            <div class="section-title">Referensi Transaksi</div>
            <div>Invoice: <strong>{{ $returnPurchase->transaction->invoice_number }}</strong></div>
        @endif

        @if($returnPurchase->reason)
            <div class="section-title">Alasan Retur</div>
            <div>{{ $returnPurchase->reason }}</div>
        @endif

        <div class="section-title">Rincian Item</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 40%;">Nama Produk</th>
                    <th style="width: 15%;">Qty</th>
                    <th style="width: 15%;">Harga</th>
                    <th style="width: 10%;">Diskon</th>
                    <th style="width: 15%;" class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @php($no = 1)
                @php($total = 0)
                @foreach($returnPurchase->items as $item)
                    @php($total += $item->subtotal)
                    <tr>
                        <td>{{ $no++ }}</td>
                        <td>{{ $item->product_name }}</td>
                        <td>{{ number_format($item->quantity, 0, ',', '.') }}</td>
                        <td>{{ number_format($item->price, 0, ',', '.') }}</td>
                        <td>{{ $item->discount }}%</td>
                        <td class="text-right">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row final">
                <span>Total Retur</span>
                <span>Rp {{ number_format($total, 0, ',', '.') }}</span>
            </div>
        </div>

        @if($returnPurchase->notes)
            <div class="section-title">Catatan</div>
            <div>{{ $returnPurchase->notes }}</div>
        @endif

        <div class="section-title">Status</div>
        <div>
            <span class="status {{ $returnPurchase->status }}">{{ ucfirst($returnPurchase->status) }}</span>
        </div>

        <div class="footer">
            <div class="footer-info">
                <div>
                    <div style="font-weight: bold;">Catatan</div>
                    <div class="store-info">Barang sudah diterima kembali oleh supplier</div>
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
