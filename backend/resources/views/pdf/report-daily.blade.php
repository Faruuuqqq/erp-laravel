<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Harian {{ $data['date'] }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
        .container { padding: 15px 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .header-left { flex: 1; }
        .header-right { flex: 1; text-align: right; }
        .store-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
        .store-info { color: #666; margin-bottom: 3px; }
        .report-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .report-date { color: #666; }
        .summary { display: flex; justify-content: space-around; background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .summary-item { text-align: center; }
        .summary-label { color: #666; font-size: 10px; margin-bottom: 5px; }
        .summary-value { font-size: 18px; font-weight: bold; }
        .summary-value.positive { color: #28a745; }
        .summary-value.negative { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f9f9f9; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .type-badge { display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
        .type-penjualan { background: #d4edda; color: #155724; }
        .type-pembelian { background: #fff3cd; color: #856404; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 10px; }
        .page-number { position: fixed; bottom: 10px; right: 20px; font-size: 10px; }
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
            </div>
            <div class="header-right">
                <div class="report-title">LAPORAN HARIAN</div>
                <div class="report-date">{{ date('d/m/Y', strtotime($data['date'])) }}</div>
                <div class="store-info" style="margin-top: 5px;">Dicetak: {{ date('d/m/Y H:i') }}</div>
            </div>
        </div>

        <div class="summary">
            <div class="summary-item">
                <div class="summary-label">Total Penjualan</div>
                <div class="summary-value positive">Rp {{ number_format($data['totalSales'], 0, ',', '.') }}</div>
                <div style="color: #666; font-size: 9px;">{{ $data['salesCount'] }} transaksi</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Pembelian</div>
                <div class="summary-value negative">Rp {{ number_format($data['totalPurchases'], 0, ',', '.') }}</div>
                <div style="color: #666; font-size: 9px;">{{ $data['purchasesCount'] }} transaksi</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Laba Kotor</div>
                <div class="summary-value {{ $data['grossProfit'] >= 0 ? 'positive' : 'negative' }}">
                    Rp {{ number_format($data['grossProfit'], 0, ',', '.') }}
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 12%;">Waktu</th>
                    <th style="width: 10%;">Tipe</th>
                    <th style="width: 13%;">No. Invoice</th>
                    <th style="width: 25%;">Klien</th>
                    <th style="width: 10%;">Qty</th>
                    <th style="width: 15%;" class="text-right">Total</th>
                    <th style="width: 10%;">Status</th>
                </tr>
            </thead>
            <tbody>
                @php($no = 1)
                @foreach($data['transactions'] as $transaction)
                    <tr>
                        <td>{{ $no++ }}</td>
                        <td>{{ date('H:i', strtotime($transaction->date)) }}</td>
                        <td>
                            @if(str_contains($transaction->type, 'penjualan'))
                                <span class="type-badge type-penjualan">Penjualan</span>
                            @else
                                <span class="type-badge type-pembelian">Pembelian</span>
                            @endif
                        </td>
                        <td>{{ $transaction->invoice_number }}</td>
                        <td>
                            @if($transaction->customer)
                                {{ $transaction->customer->name }}
                            @elseif($transaction->supplier)
                                {{ $transaction->supplier->name }}
                            @else
                                Umum
                            @endif
                        </td>
                        <td>{{ $transaction->items?->sum('quantity') ?? 0 }}</td>
                        <td class="text-right">Rp {{ number_format($transaction->total, 0, ',', '.') }}</td>
                        <td>
                            <span class="type-badge {{ $transaction->status === 'completed' ? 'type-penjualan' : 'type-pembelian' }}">
                                {{ ucfirst($transaction->status) }}
                            </span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="footer">
            <div>Generated by TokoSync ERP</div>
            <div>{{ $storeSettings['name'] }} - {{ date('d/m/Y H:i') }}</div>
        </div>
    </div>

    <div class="page-number">Halaman {PAGE_NUM} dari {PAGE_COUNT}</div>
</body>
</html>
