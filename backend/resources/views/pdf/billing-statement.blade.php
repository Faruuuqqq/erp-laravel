<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Kontra Bon {{ $data['billingNumber'] }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #111827; line-height: 1.45; }
        .page { padding: 22px; }
        .header { border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 14px; }
        .header-table { width: 100%; border-collapse: collapse; }
        .header-table td { vertical-align: top; }
        .company-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .muted { color: #4b5563; }
        .doc-title { text-align: right; }
        .doc-title .main { font-size: 19px; font-weight: 700; letter-spacing: 0.4px; }
        .doc-title .sub { font-size: 10px; color: #4b5563; }
        .block { margin-top: 12px; }
        .section-title { font-weight: 700; font-size: 11px; background: #f3f4f6; padding: 6px 8px; border: 1px solid #d1d5db; border-bottom: none; }
        .section-body { border: 1px solid #d1d5db; padding: 8px; }
        .meta-table { width: 100%; border-collapse: collapse; }
        .meta-table td { padding: 2px 0; vertical-align: top; }
        .meta-table .label { width: 120px; color: #4b5563; }
        .meta-table .label-wide { width: 180px; color: #4b5563; }
        .aging-table { width: 100%; border-collapse: collapse; }
        .aging-table th, .aging-table td { border: 1px solid #d1d5db; padding: 6px; text-align: center; }
        .aging-table th { background: #f9fafb; font-weight: 700; }
        .table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        .table th, .table td { border: 1px solid #d1d5db; padding: 6px 7px; }
        .table th { background: #f9fafb; font-weight: 700; }
        .right { text-align: right; white-space: nowrap; }
        .center { text-align: center; }
        .totals { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .totals td { padding: 3px 0; }
        .totals .label { text-align: right; color: #4b5563; }
        .totals .value { text-align: right; width: 220px; }
        .totals .grand td { border-top: 2px solid #111827; padding-top: 7px; font-size: 12px; font-weight: 700; }
        .terms { border: 1px solid #d1d5db; background: #f9fafb; padding: 8px; margin-top: 10px; }
        .terms p { margin-bottom: 4px; }
        .sign-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .sign-table td { width: 50%; vertical-align: top; text-align: center; }
        .sign-box-title { font-weight: 700; margin-bottom: 60px; }
        .sign-name { font-weight: 700; border-top: 1px solid #111827; display: inline-block; padding-top: 4px; min-width: 220px; }
        .sign-role { font-size: 10px; color: #4b5563; }
        .footer { margin-top: 12px; border-top: 1px solid #d1d5db; padding-top: 6px; font-size: 10px; color: #6b7280; }
    </style>
</head>
<body>
@php
    $aging = $data['aging'];
    $agingCurrent = (float) ($aging['current_0_30'] ?? $aging['current'] ?? 0);
    $aging31To60 = (float) ($aging['days_31_60'] ?? $aging['days_1_30'] ?? 0);
    $aging61To90 = (float) ($aging['days_61_90'] ?? $aging['days_31_60_legacy'] ?? 0);
    $aging90Plus = (float) ($aging['days_90_plus'] ?? $aging['days_60_plus'] ?? 0);
    $issuedDate = \Carbon\Carbon::parse($data['issuedAt'] ?? $data['date']);
    $dueDate = \Carbon\Carbon::parse($data['dueDate'] ?? $issuedDate->copy()->addDays((int) ($data['dueDays'] ?? 7)));
    $bankName = trim((string) ($storeSettings['bank_name'] ?? ''));
    $bankAccountNumber = trim((string) ($storeSettings['bank_account_number'] ?? ''));
    $bankAccountName = trim((string) ($storeSettings['bank_account_name'] ?? ''));
    $paymentTermsTemplate = (string) ($storeSettings['payment_terms'] ?? 'Pembayaran maksimal {due_days} hari sejak tanggal terbit dokumen.');
    $paymentTerms = str_replace('{due_days}', (string) ($data['dueDays'] ?? 7), $paymentTermsTemplate);
@endphp
<div class="page">
    <div class="header">
        <table class="header-table">
            <tr>
                <td>
                    <div class="company-name">{{ $storeSettings['name'] }}</div>
                    @if(!empty($storeSettings['address']))
                        <div class="muted">{{ $storeSettings['address'] }}</div>
                    @endif
                    @if(!empty($storeSettings['phone']) || !empty($storeSettings['email']))
                        <div class="muted">
                            @if(!empty($storeSettings['phone']))Telp: {{ $storeSettings['phone'] }}@endif
                            @if(!empty($storeSettings['phone']) && !empty($storeSettings['email'])) · @endif
                            @if(!empty($storeSettings['email']))Email: {{ $storeSettings['email'] }}@endif
                        </div>
                    @endif
                    @if(!empty($storeSettings['npwp']))
                        <div class="muted">NPWP: {{ $storeSettings['npwp'] }}</div>
                    @endif
                </td>
                <td class="doc-title">
                    <div class="main">KONTRA BON</div>
                    <div class="sub">No. Dokumen: {{ $data['billingNumber'] }}</div>
                    <div class="sub">Tanggal Terbit: {{ $issuedDate->format('d/m/Y') }}</div>
                    <div class="sub">Jatuh Tempo: {{ $dueDate->format('d/m/Y') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="block">
        <div class="section-title">Data Debitur</div>
        <div class="section-body">
            <table class="meta-table">
                <tr>
                    <td class="label">Nama Customer</td>
                    <td>: {{ $data['customer']->name }}</td>
                </tr>
                @if(!empty($data['customer']->phone))
                    <tr>
                        <td class="label">Telepon</td>
                        <td>: {{ $data['customer']->phone }}</td>
                    </tr>
                @endif
                @if(!empty($data['customer']->address))
                    <tr>
                        <td class="label">Alamat</td>
                        <td>: {{ $data['customer']->address }}</td>
                    </tr>
                @endif
                <tr>
                    <td class="label">Referensi</td>
                    <td>: {{ $data['billingNumber'] }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="block">
        <div class="section-title">Aging Piutang</div>
        <div class="section-body" style="padding: 0; border-top: none;">
            <table class="aging-table">
                <thead>
                    <tr>
                        <th>0 - 30 Hari</th>
                        <th>31 - 60 Hari</th>
                        <th>61 - 90 Hari</th>
                        <th>> 90 Hari</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Rp {{ number_format($agingCurrent, 0, ',', '.') }}</td>
                        <td>Rp {{ number_format($aging31To60, 0, ',', '.') }}</td>
                        <td>Rp {{ number_format($aging61To90, 0, ',', '.') }}</td>
                        <td>Rp {{ number_format($aging90Plus, 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="block">
        <div class="section-title">Rincian Faktur Outstanding</div>
        <div class="section-body" style="padding: 0; border-top: none;">
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 36px;" class="center">No</th>
                        <th style="width: 84px;" class="center">Tgl Faktur</th>
                        <th style="width: 170px;">No. Faktur</th>
                        <th>Uraian</th>
                        <th style="width: 66px;" class="center">Umur</th>
                        <th style="width: 130px;" class="right">Sisa Piutang</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['transactions'] as $index => $transaction)
                        @php
                            $trxDate = \Carbon\Carbon::parse($transaction->date);
                            $agingDays = $trxDate->diffInDays($issuedDate);
                            $typeLabel = strtoupper(str_replace('_', ' ', $transaction->type));
                            $itemCount = $transaction->details ? $transaction->details->count() : 0;
                        @endphp
                        <tr>
                            <td class="center">{{ $index + 1 }}</td>
                            <td class="center">{{ $trxDate->format('d/m/Y') }}</td>
                            <td>{{ $transaction->invoice_number }}</td>
                            <td>{{ $typeLabel }} @if($itemCount > 0)({{ $itemCount }} item)@endif</td>
                            <td class="center">{{ $agingDays }} hr</td>
                            <td class="right">Rp {{ number_format((float) $transaction->remaining, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <table class="totals">
        <tr>
            <td class="label">Total Piutang Outstanding</td>
            <td class="value">Rp {{ number_format((float) $data['totalAmount'], 0, ',', '.') }}</td>
        </tr>
        @if((float) $data['interestRate'] > 0)
            <tr>
                <td class="label">Bunga / Denda ({{ number_format((float) $data['interestRate'], 2, ',', '.') }}%)</td>
                <td class="value">Rp {{ number_format((float) $data['interestAmount'], 0, ',', '.') }}</td>
            </tr>
        @endif
        <tr class="grand">
            <td class="label">Total Tagihan Kontra Bon</td>
            <td class="value">Rp {{ number_format((float) $data['grandTotal'], 0, ',', '.') }}</td>
        </tr>
    </table>

    <div class="terms">
        <p><strong>Ketentuan Pembayaran:</strong> {{ $paymentTerms }}</p>
        @if($bankName !== '' || $bankAccountNumber !== '' || $bankAccountName !== '')
            <p><strong>Rekening Pembayaran:</strong>
                {{ $bankName !== '' ? $bankName : '-' }}
                @if($bankAccountNumber !== '') / {{ $bankAccountNumber }} @endif
                @if($bankAccountName !== '') a.n {{ $bankAccountName }} @endif
            </p>
        @endif
        <p><strong>Catatan:</strong> Mohon cantumkan nomor referensi {{ $data['billingNumber'] }} saat melakukan pembayaran.</p>
    </div>

    <table class="sign-table">
        <tr>
            <td>
                <div class="sign-box-title">Pihak Customer</div>
                <div class="sign-name">&nbsp;</div>
                <div class="sign-role">Nama & Tanda Tangan</div>
            </td>
            <td>
                <div class="sign-box-title">{{ $storeSettings['name'] }}</div>
                <div class="sign-name">{{ $storeSettings['approver_name'] ?? 'Finance' }}</div>
                <div class="sign-role">{{ $storeSettings['approver_title'] ?? 'AR Officer' }}</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Dokumen ini dicetak otomatis pada {{ now()->format('d/m/Y H:i:s') }}. Valid tanpa stempel basah selama dapat diverifikasi di sistem ERP.
    </div>
</div>
</body>
</html>
