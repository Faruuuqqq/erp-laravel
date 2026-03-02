<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Billing Statement {{ $data['billingNumber'] }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
        .container { padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .header-left { flex: 1; }
        .header-right { flex: 1; text-align: right; }
        .store-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .store-info { color: #666; margin-bottom: 3px; }
        .title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .subtitle { color: #666; font-size: 10px; }
        .section-title { font-weight: bold; background: #f5f5f5; padding: 8px; margin: 20px 0 10px 0; border-bottom: 2px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f9f9f9; font-weight: bold; }
        .text-right { text-align: right; }
        .aging-box { display: flex; gap: 15px; margin: 20px 0; }
        .aging-item { flex: 1; background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
        .aging-label { color: #666; font-size: 10px; margin-bottom: 5px; }
        .aging-value { font-size: 16px; font-weight: bold; }
        .summary-box { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
        .summary-row:last-child { border-bottom: none; }
        .summary-row.final { font-size: 14px; font-weight: bold; margin-top: 10px; padding-top: 15px; border-top: 2px solid #333; border-bottom: none; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
        .footer-info { display: flex; justify-content: space-between; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 9px; background: #007bff; color: white; }
        .overdue { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-left">
                <div class="store-name">{{ $storeSettings['name'] }}</div>
                @if($storeSettings['address'])
                    <div class="store-info">{{ $storeSettings['address'] }}</div>
                @endif
                @if($storeSettings['phone'])
                    <div class="store-info">Telp: {{ $storeSettings['phone'] }}</div>
                @endif
                @if($storeSettings['npwp'])
                    <div class="store-info">NPWP: {{ $storeSettings['npwp'] }}</div>
                @endif
            </div>
            <div class="header-right">
                <div class="title">BILLING STATEMENT</div>
                <div class="subtitle">{{ $data['billingNumber'] }}</div>
                <div class="subtitle">Tanggal: {{ date('d/m/Y', strtotime($data['date'])) }}</div>
            </div>
        </div>

        <div class="section-title">Klien</div>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <div><strong>{{ $data['customer']->name }}</strong></div>
            @if($data['customer']->phone)
                <div class="store-info">Telp: {{ $data['customer']->phone }}</div>
            @endif
            @if($data['customer']->address)
                <div class="store-info">{{ $data['customer']->address }}</div>
            @endif
        </div>

        <div class="section-title">Piutang Berdasarkan Umur (Aging)</div>
        <div class="aging-box">
            <div class="aging-item">
                <div class="aging-label">0-30 Hari</div>
                <div class="aging-value">Rp {{ number_format($data['aging']['current'], 0, ',', '.') }}</div>
            </div>
            <div class="aging-item">
                <div class="aging-label">31-60 Hari</div>
                <div class="aging-value">Rp {{ number_format($data['aging']['days_1_30'], 0, ',', '.') }}</div>
            </div>
            <div class="aging-item">
                <div class="aging-label">61-90 Hari</div>
                <div class="aging-value">Rp {{ number_format($data['aging']['days_31_60'], 0, ',', '.') }}</div>
            </div>
            <div class="aging-item">
                <div class="aging-label">> 90 Hari</div>
                <div class="aging-value" style="color: #dc3545;">Rp {{ number_format($data['aging']['days_60_plus'], 0, ',', '.') }}</div>
            </div>
        </div>

        <div class="section-title">Rincian Faktur</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 15%;">Tanggal</th>
                    <th style="width: 25%;">No. Faktur</th>
                    <th style="width: 35%;">Keterangan</th>
                    <th style="width: 20%;" class="text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @php($no = 1)
                @foreach($data['transactions'] as $transaction)
                    <tr>
                        <td>{{ $no++ }}</td>
                        <td>{{ date('d/m/Y', strtotime($transaction->date)) }}</td>
                        <td>{{ $transaction->invoice_number }}</td>
                        <td>
                            {{ ucfirst(str_replace('_', ' ', $transaction->type)) }}
                            @if($transaction->items)
                                ({{ $transaction->items->count() }} item)
                            @endif
                        </td>
                        <td class="text-right">Rp {{ number_format($transaction->remaining, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="summary-box">
            <div class="summary-row">
                <span>Total Piutang</span>
                <span>Rp {{ number_format($data['totalAmount'], 0, ',', '.') }}</span>
            </div>
            @if($data['interestRate'] > 0)
                <div class="summary-row">
                    <span>Bunga ({{ $data['interestRate'] }}%)</span>
                    <span>Rp {{ number_format($data['interestAmount'], 0, ',', '.') }}</span>
                </div>
            @endif
            <div class="summary-row final">
                <span>Total Tagihan</span>
                <span style="color: #dc3545;">Rp {{ number_format($data['grandTotal'], 0, ',', '.') }}</span>
            </div>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin-top: 20px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Catatan Pembayaran</div>
            <div style="color: #666;">
                Silakan lakukan pembayaran paling lambat 7 hari setelah tanggal billing. 
                Pembayaran dapat ditransfer ke rekening bank kami atau dibayarkan langsung di toko.
            </div>
            <div style="margin-top: 10px; font-size: 10px; color: #666;">
                No. Referensi: {{ $data['billingNumber'] }}
            </div>
        </div>

        <div class="footer">
            <div class="footer-info">
                <div>
                    <div style="font-weight: bold;">Terima Kasih</div>
                    <div class="store-info">Terima kasih atas kerjasama Anda</div>
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
