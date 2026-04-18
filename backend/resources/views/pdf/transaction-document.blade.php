<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} {{ $transaction->invoice_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #111827; line-height: 1.45; }
        .container { padding: 24px; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 14px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }
        .title { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .store-name { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
        .muted { color: #4b5563; }
        .right { text-align: right; }
        .meta { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .meta td { padding: 3px 0; }
        .meta .label { width: 170px; color: #4b5563; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.items th, table.items td { border: 1px solid #d1d5db; padding: 6px 8px; }
        table.items th { background: #f3f4f6; font-weight: 700; }
        .num { text-align: right; white-space: nowrap; }
        .center { text-align: center; }
        .totals { margin-top: 14px; width: 100%; border-collapse: collapse; }
        .totals td { padding: 4px 0; }
        .totals .label { text-align: right; color: #4b5563; }
        .totals .value { text-align: right; width: 180px; }
        .totals .grand td { border-top: 2px solid #111827; padding-top: 8px; font-size: 12px; font-weight: 700; }
        .section { margin-top: 14px; }
        .section-title { font-size: 11px; font-weight: 700; margin-bottom: 4px; }
        .footer { margin-top: 26px; border-top: 1px solid #d1d5db; padding-top: 10px; font-size: 10px; color: #6b7280; }
    </style>
</head>
<body>
@php
    $counterpartyLabel = $transaction->type === 'pembelian' || $transaction->type === 'pembayaran_utang' || $transaction->type === 'retur_pembelian'
        ? 'Supplier'
        : 'Customer';
    $counterpartyName = $transaction->supplier->name ?? $transaction->customer->name ?? '-';
    $paymentStatus = (float) $transaction->remaining <= 0 ? 'LUNAS' : 'BELUM LUNAS';
@endphp
<div class="container">
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="store-name">{{ $storeSettings['name'] }}</div>
                    @if(!empty($storeSettings['address']))
                        <div class="muted">{{ $storeSettings['address'] }}</div>
                    @endif
                    @if(!empty($storeSettings['phone']))
                        <div class="muted">Telp: {{ $storeSettings['phone'] }}</div>
                    @endif
                    @if(!empty($storeSettings['npwp']))
                        <div class="muted">NPWP: {{ $storeSettings['npwp'] }}</div>
                    @endif
                </td>
                <td class="right">
                    <div class="title">{{ strtoupper($title) }}</div>
                    <div>No. Dokumen: {{ $transaction->invoice_number }}</div>
                    <div class="muted">Tanggal: {{ \Carbon\Carbon::parse($transaction->date)->format('d/m/Y') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="meta">
        <tr>
            <td class="label">Jenis Transaksi</td>
            <td>: {{ strtoupper(str_replace('_', ' ', $transaction->type)) }}</td>
        </tr>
        <tr>
            <td class="label">{{ $counterpartyLabel }}</td>
            <td>: {{ $counterpartyName }}</td>
        </tr>
        @if(!empty($transaction->salesRep?->name))
            <tr>
                <td class="label">Sales</td>
                <td>: {{ $transaction->salesRep->name }}</td>
            </tr>
        @endif
        <tr>
            <td class="label">Status Pembayaran</td>
            <td>: {{ $paymentStatus }}</td>
        </tr>
    </table>

    <table class="items">
        <thead>
        <tr>
            <th style="width: 36px;">No</th>
            <th>Item</th>
            <th style="width: 70px;" class="center">Qty</th>
            <th style="width: 110px;" class="num">Harga</th>
            <th style="width: 85px;" class="num">Disc</th>
            <th style="width: 125px;" class="num">Subtotal</th>
        </tr>
        </thead>
        <tbody>
        @forelse($transaction->details as $index => $item)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td>{{ $item->product_name }}</td>
                <td class="center">{{ number_format((float) $item->quantity, 0, ',', '.') }}</td>
                <td class="num">Rp {{ number_format((float) $item->price, 0, ',', '.') }}</td>
                <td class="num">{{ (float) $item->discount > 0 ? number_format((float) $item->discount, 2, ',', '.') . '%' : '-' }}</td>
                <td class="num">Rp {{ number_format((float) $item->subtotal, 0, ',', '.') }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="6" class="center">Tidak ada item detail.</td>
            </tr>
        @endforelse
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="label">Subtotal</td>
            <td class="value">Rp {{ number_format((float) $transaction->subtotal, 0, ',', '.') }}</td>
        </tr>
        @if((float) $transaction->discount > 0)
            <tr>
                <td class="label">Diskon</td>
                <td class="value">- Rp {{ number_format((float) $transaction->discount, 0, ',', '.') }}</td>
            </tr>
        @endif
        @if((float) $transaction->tax > 0)
            <tr>
                <td class="label">Pajak</td>
                <td class="value">Rp {{ number_format((float) $transaction->tax, 0, ',', '.') }}</td>
            </tr>
        @endif
        <tr class="grand">
            <td class="label">Total</td>
            <td class="value">Rp {{ number_format((float) $transaction->total, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Dibayar</td>
            <td class="value">Rp {{ number_format((float) $transaction->paid, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Sisa</td>
            <td class="value">Rp {{ number_format((float) $transaction->remaining, 0, ',', '.') }}</td>
        </tr>
    </table>

    @if(!empty($transaction->notes))
        <div class="section">
            <div class="section-title">Catatan</div>
            <div>{{ $transaction->notes }}</div>
        </div>
    @endif

    <div class="footer">
        Dicetak pada {{ now()->format('d/m/Y H:i:s') }}
    </div>
</div>
</body>
</html>
