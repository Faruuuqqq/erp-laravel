<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Saldo Utang</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; line-height: 1.4; color: #333; }
        .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .store-info { color: #666; margin-bottom: 3px; }
        .report-title { font-size: 20px; font-weight: bold; color: #333; margin: 20px 0 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f9f9f9; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row { display: flex; justify-content: space-between; padding: 15px; margin-top: 20px; background: #f5f5f5; font-weight: bold; font-size: 14px; border: 2px solid #ddd; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; }
        .footer-info { color: #666; }
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

        <div class="report-title text-center">LAPORAN SALDO UTANG</div>
        <div class="text-center store-info">Per Tanggal: {{ date('d/m/Y') }}</div>

        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 30%;">Nama Supplier</th>
                    <th style="width: 20%;">Telepon</th>
                    <th style="width: 30%;">Alamat</th>
                    <th style="width: 15%;" class="text-right">Saldo Utang</th>
                </tr>
            </thead>
            <tbody>
                @php($no = 1)
                @php($totalUtang = 0)
                @foreach($suppliers as $supplier)
                    @if($supplier->balance > 0)
                        @php($totalUtang += $supplier->balance)
                        <tr>
                            <td>{{ $no++ }}</td>
                            <td><strong>{{ $supplier->name }}</strong></td>
                            <td>{{ $supplier->phone ?? '-' }}</td>
                            <td>{{ $supplier->address ?? '-' }}</td>
                            <td class="text-right">Rp {{ number_format($supplier->balance, 0, ',', '.') }}</td>
                        </tr>
                    @endif
                @endforeach
                @if($no === 1)
                    <tr>
                        <td colspan="5" class="text-center" style="padding: 20px; color: #666;">Tidak ada saldo utang</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <div class="total-row">
            <span>Total Saldo Utang</span>
            <span>Rp {{ number_format($totalUtang, 0, ',', '.') }}</span>
        </div>

        <div class="footer">
            <div class="footer-info">{{ $storeSettings['name'] }} - Dicetak: {{ date('d/m/Y H:i') }}</div>
        </div>
    </div>
</body>
</html>
