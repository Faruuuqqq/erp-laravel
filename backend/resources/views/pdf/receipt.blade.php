<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Receipt {{ $transaction->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.3; color: #000; width: 80mm; }
        .container { padding: 5px; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .separator { border-top: 1px dashed #000; margin: 8px 0; }
        .separator-double { border-top: 2px dashed #000; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; margin: 3px 0; }
        .product-row { display: flex; justify-content: space-between; margin: 2px 0; }
        .product-name { flex: 2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .product-qty { flex: 0.5; text-align: center; }
        .product-total { flex: 1; text-align: right; }
        .total-row { display: flex; justify-content: space-between; margin: 3px 0; font-weight: bold; }
        .grand-total { font-size: 13px; font-weight: bold; }
        .status { display: inline-block; padding: 2px 5px; border: 1px solid #000; border-radius: 2px; font-size: 9px; }
        .status.lunas { background: #d4edda; }
        .status.belum { background: #fff3cd; }
        .thank-you { text-align: center; margin-top: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="center">
            <div class="bold" style="font-size: 14px; margin-bottom: 3px;">{{ $storeSettings['name'] }}</div>
            @if($storeSettings['address'])
                <div style="font-size: 9px;">{{ $storeSettings['address'] }}</div>
            @endif
            @if($storeSettings['phone'])
                <div style="font-size: 9px;">Telp: {{ $storeSettings['phone'] }}</div>
            @endif
        </div>

        <div class="separator"></div>

        <div class="row">
            <span>No:</span>
            <span class="bold">{{ $transaction->invoice_number }}</span>
        </div>
        <div class="row">
            <span>Tgl:</span>
            <span>{{ date('d/m/Y H:i', strtotime($transaction->date)) }}</span>
        </div>
        @if($transaction->customer)
            <div class="row">
                <span>Pelanggan:</span>
                <span>{{ $transaction->customer->name }}</span>
            </div>
        @endif

        <div class="separator"></div>

        <div style="margin-bottom: 5px;">
            <div class="product-row" style="font-weight: bold;">
                <span class="product-name">ITEM</span>
                <span class="product-qty">QTY</span>
                <span class="product-total">TOTAL</span>
            </div>
        </div>

        @foreach($transaction->items as $item)
            <div class="product-row">
                <span class="product-name">{{ $item->productName }}</span>
                <span class="product-qty">{{ $item->quantity }}</span>
                <span class="product-total">{{ number_format($item->subtotal, 0, ',', '.') }}</span>
            </div>
        @endforeach

        <div class="separator"></div>

        <div class="row">
            <span>Subtotal</span>
            <span>{{ number_format($transaction->subtotal, 0, ',', '.') }}</span>
        </div>
        @if($transaction->discount > 0)
            <div class="row">
                <span>Diskon</span>
                <span>-{{ number_format($transaction->discount, 0, ',', '.') }}</span>
            </div>
        @endif
        @if($transaction->tax > 0)
            <div class="row">
                <span>Pajak</span>
                <span>{{ number_format($transaction->tax, 0, ',', '.') }}</span>
            </div>
        @endif

        <div class="separator-double"></div>

        <div class="total-row grand-total">
            <span>TOTAL</span>
            <span>Rp {{ number_format($transaction->total, 0, ',', '.') }}</span>
        </div>

        <div class="row">
            <span>Tunai</span>
            <span>Rp {{ number_format($transaction->paid, 0, ',', '.') }}</span>
        </div>
        @if($transaction->remaining > 0)
            <div class="row">
                <span>Sisa</span>
                <span>Rp {{ number_format($transaction->remaining, 0, ',', '.') }}</span>
            </div>
        @endif

        <div class="separator"></div>

        <div class="center">
            @if($transaction->remaining <= 0)
                <span class="status lunas">LUNAS</span>
            @else
                <span class="status belum">BELUM LUNAS</span>
            @endif
        </div>

        @if($transaction->notes)
            <div style="margin-top: 8px; font-size: 9px;">
                <span class="bold">Catatan:</span> {{ $transaction->notes }}
            </div>
        @endif

        <div class="thank-you">
            TERIMA KASIH
        </div>
        <div class="center" style="font-size: 9px; margin-top: 5px;">
            {{ $storeSettings['name'] }}
        </div>
        <div class="center" style="font-size: 8px; margin-top: 3px;">
            {{ date('d/m/Y H:i') }}
        </div>
    </div>
</body>
</html>
