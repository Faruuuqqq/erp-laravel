<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order {{ $transaction->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
        .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header-left { flex: 1; }
        .header-right { flex: 1; text-align: right; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .store-info { color: #666; margin-bottom: 3px; }
        .po-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .po-number { color: #666; }
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
                <div class="po-title">PURCHASE ORDER</div>
                <div class="po-number">{{ $transaction->invoice_number }}</div>
                <div class="store-info">Tanggal: {{ date('d/m/Y', strtotime($transaction->date)) }}</div>
            </div>
        </div>

        <div class="section-title">INFORMASI SUPPLIER</div>
        <table>
            <tr>
                <td style="width: 20%;">Nama Supplier</td>
                <td style="width: 5%;">:</td>
                <td><strong>{{ $transaction->supplier?->name ?? '-' }}</strong></td>
            </tr>
            <tr>
                <td>Alamat</td>
                <td>:</td>
                <td>{{ $transaction->supplier?->address ?? '-' }}</td>
            </tr>
            <tr>
                <td>Telepon</td>
                <td>:</td>
                <td>{{ $transaction->supplier?->phone ?? '-' }}</td>
            </tr>
        </table>

        <div class="section-title">INFORMASI PEMESANAN</div>
        <table>
            <tr>
                <td style="width: 20%;">No. Pesanan</td>
                <td style="width: 5%;">:</td>
                <td>{{ $transaction->invoice_number }}</td>
            </tr>
            <tr>
                <td>Tanggal Pesanan</td>
                <td>:</td>
                <td>{{ date('d/m/Y', strtotime($transaction->date)) }}</td>
            </tr>
            @if($transaction->due_date)
            <tr>
                <td>Tanggal Jatuh Tempo</td>
                <td>:</td>
                <td>{{ date('d/m/Y', strtotime($transaction->due_date)) }}</td>
            </tr>
            @endif
            @if($transaction->warehouse)
            <tr>
                <td>Gudang Tujuan</td>
                <td>:</td>
                <td>{{ $transaction->warehouse->name }}</td>
            </tr>
            @endif
        </table>

        <div class="section-title">DAFTAR BARANG</div>
        <table>
            <thead>
                <tr>
                    <th class="text-center" style="width: 5%;">No.</th>
                    <th style="width: 40%;">Nama Barang</th>
                    <th class="text-center" style="width: 10%;">Qty</th>
                    <th style="width: 10%;">Satuan</th>
                    <th class="text-right" style="width: 15%;">Harga</th>
                    <th class="text-right" style="width: 10%;">Disc %</th>
                    <th class="text-right" style="width: 15%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @php $no = 1; @endphp
                @foreach($transaction->details as $detail)
                <tr>
                    <td class="text-center">{{ $no++ }}</td>
                    <td>{{ $detail->product_name }}</td>
                    <td class="text-center">{{ number_format($detail->quantity) }}</td>
                    <td>{{ $detail->satuan }}</td>
                    <td class="text-right">{{ number_format($detail->price, 0, ',', '.') }}</td>
                    <td class="text-right">{{ $detail->discount ?? 0 }}%</td>
                    <td class="text-right">{{ number_format($detail->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal</span>
                <span>{{ number_format($transaction->subtotal, 0, ',', '.') }}</span>
            </div>
            @if($transaction->discount > 0)
            <div class="total-row">
                <span>Diskon ({{ $transaction->discount }}%)</span>
                <span>- {{ number_format($transaction->subtotal * $transaction->discount / 100, 0, ',', '.') }}</span>
            </div>
            @endif
            @if($transaction->tax > 0)
            <div class="total-row">
                <span>PPN ({{ $transaction->tax }}%)</span>
                <span>{{ number_format($transaction->subtotal * $transaction->tax / 100, 0, ',', '.') }}</span>
            </div>
            @endif
            <div class="total-row final">
                <span>TOTAL</span>
                <span>{{ number_format($transaction->grand_total, 0, ',', '.') }}</span>
            </div>
        </div>

        @if($transaction->notes)
        <div class="section-title">CATATAN</div>
        <div>{{ $transaction->notes }}</div>
        @endif

        <div class="footer">
            <div class="footer-info">
                <div style="width: 30%;">
                    <div style="border-top: 1px solid #333; padding-top: 30px; text-align: center;">
                        <div>Dibuat Oleh</div>
                    </div>
                </div>
                <div style="width: 30%;">
                    <div style="border-top: 1px solid #333; padding-top: 30px; text-align: center;">
                        <div>Disetujui</div>
                    </div>
                </div>
                <div style="width: 30%;">
                    <div style="border-top: 1px solid #333; padding-top: 30px; text-align: center;">
                        <div>Supplier</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>