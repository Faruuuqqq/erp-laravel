<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Jalan - {{ $deliveryNote->delivery_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
        }
        .info {
            margin: 15px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            width: 120px;
        }
        .info-value {
            flex: 1;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table th, .table td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
        }
        .table th {
            background: #f9faf9;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 11px;
            color: #666;
        }
        .status {
            padding: 4px 12px;
            border-radius: 4px;
            display: inline-block;
            font-weight: bold;
        }
        .status.pending { background: #fff3cd; color: #d97706; }
        .status.delivered { background: #22c55e; color: #fff; }
        .status.cancelled { background: #ef4444; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">SURAT JALAN</div>
            <div class="subtitle">{{ $deliveryNote->delivery_number }}</div>
        </div>

        <div class="info">
            <div class="info-row">
                <div class="info-label">Tanggal:</div>
                <div class="info-value">{{ $deliveryNote->date }}</div>
            </div>
            @if($customer = $deliveryNote->customer)
            <div class="info-row">
                <div class="info-label">Customer:</div>
                <div class="info-value">{{ $customer->name }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">No. Faktur:</div>
                <div class="info-value">{{ $transaction->invoice_number }}</div>
            </div>
            @if($deliveryNote->driver)
            <div class="info-row">
                <div class="info-label">Driver:</div>
                <div class="info-value">{{ $deliveryNote->driver }}</div>
            </div>
            @endif
            @if($deliveryNote->vehicle_plate)
            <div class="info-row">
                <div class="info-label">Plat Nomor:</div>
                <div class="info-value">{{ $deliveryNote->vehicle_plate }}</div>
            </div>
            @endif
            @if($deliveryNote->notes)
            <div class="info-row">
                <div class="info-label">Catatan:</div>
                <div class="info-value">{{ $deliveryNote->notes }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value">
                    @if($deliveryNote->status == 'delivered')
                        <span class="status delivered">TERKIRIM</span>
                    @elseif($deliveryNote->status == 'pending')
                        <span class="status pending">PENDING</span>
                    @else
                        <span class="status cancelled">DIBATALKAN</span>
                    @endif
                </div>
            </div>
        </div>

        @if($transaction && count($transaction->items) > 0)
        <div class="section">
            <div class="section-title">DETAIL BARANG</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Produk</th>
                        <th>Jumlah</th>
                        <th>Harga</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($transaction->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item->product_name }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>{{ number_format($item->price, 0, ',', '.') }}</td>
                        <td>{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-right"><strong>Total:</strong></td>
                            <td class="text-right"><strong>{{ number_format($transaction->total, 0, ',', '.') }}</strong></td>
                        </tr>
                    </tfoot>
                </tbody>
            </table>
        </div>
        @endif

        <div class="footer">
            <p>Surat jalan ini dibuat pada {{ date('d M Y', strtotime($deliveryNote->created_at)) }}</p>
            <p>Generated by TokoSync ERP</p>
        </div>
    </div>
</body>
</html>
