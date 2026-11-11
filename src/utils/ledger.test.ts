import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLedger, generateLedgerCsv, formatKg } from './ledger';
import { InventoryTransaction } from '../types';

const mockTransactions: InventoryTransaction[] = [
  // Before period (prior to 2026-10-10)
  {
    id: 'tx-1',
    kodeReferensi: 'TR-202610-001',
    tanggal: '2026-10-05',
    waktu: '09:00',
    jenisKopi: 'Robusta',
    tipe: 'MASUK',
    jumlahKg: 500,
    keterangan: 'Penerimaan Green Bean Robusta Temanggung',
    status: 'DIVERIFIKASI',
    petugasInput: 'Siti Operator',
  },
  {
    id: 'tx-2',
    kodeReferensi: 'TR-202610-002',
    tanggal: '2026-10-07',
    waktu: '14:00',
    jenisKopi: 'Robusta',
    tipe: 'KELUAR',
    jumlahKg: 200,
    keterangan: 'Batch Roasting Dark Roast Kopi Susu',
    status: 'DIVERIFIKASI',
    petugasInput: 'Joko Roaster',
  },
  // Pending and Rejected before period (MUST BE IGNORED)
  {
    id: 'tx-3',
    kodeReferensi: 'TR-202610-003',
    tanggal: '2026-10-08',
    waktu: '11:00',
    jenisKopi: 'Robusta',
    tipe: 'MASUK',
    jumlahKg: 1000,
    keterangan: 'Pengiriman pending belum lolos lab kadar air',
    status: 'MENUNGGU_VERIFIKASI',
    petugasInput: 'Siti Operator',
  },
  {
    id: 'tx-4',
    kodeReferensi: 'TR-202610-004',
    tanggal: '2026-10-09',
    waktu: '10:00',
    jenisKopi: 'Robusta',
    tipe: 'MASUK',
    jumlahKg: 300,
    keterangan: 'Biji pecah dan berkutu, ditolak QC',
    status: 'DITOLAK',
    petugasInput: 'Siti Operator',
  },

  // Within period (2026-10-10 to 2026-10-20)
  {
    id: 'tx-5',
    kodeReferensi: 'TR-202610-005',
    tanggal: '2026-10-10',
    waktu: '08:30',
    jenisKopi: 'Robusta',
    tipe: 'MASUK',
    jumlahKg: 400,
    keterangan: 'Penerimaan Biji Robusta Dampit Malang',
    status: 'DIVERIFIKASI',
    petugasInput: 'Siti Operator',
  },
  {
    id: 'tx-6',
    kodeReferensi: 'TR-202610-006',
    tanggal: '2026-10-12',
    waktu: '13:00',
    jenisKopi: 'Robusta',
    tipe: 'KELUAR',
    jumlahKg: 150,
    keterangan: 'Pengeluaran untuk kemasan Retail 250gr',
    status: 'DIVERIFIKASI',
    petugasInput: 'Joko Roaster',
  },
  {
    id: 'tx-7',
    kodeReferensi: 'TR-202610-007',
    tanggal: '2026-10-15',
    waktu: '10:15',
    jenisKopi: 'Robusta',
    tipe: 'RETUR',
    jumlahKg: 50,
    keterangan: 'Retur sisa batch roasting green bean bersih',
    status: 'DIVERIFIKASI',
    petugasInput: 'Joko Roaster',
  },
  // Pending inside period (MUST BE IGNORED)
  {
    id: 'tx-8',
    kodeReferensi: 'TR-202610-008',
    tanggal: '2026-10-16',
    waktu: '16:00',
    jenisKopi: 'Robusta',
    tipe: 'KELUAR',
    jumlahKg: 80,
    keterangan: 'Keluar belum disetujui verifikator',
    status: 'MENUNGGU_VERIFIKASI',
    petugasInput: 'Siti Operator',
  },
  // Arabica transaction inside period
  {
    id: 'tx-9',
    kodeReferensi: 'TR-202610-009',
    tanggal: '2026-10-14',
    waktu: '11:00',
    jenisKopi: 'Arabica',
    tipe: 'MASUK',
    jumlahKg: 300,
    keterangan: 'Penerimaan Arabica Kintamani Washed',
    status: 'DIVERIFIKASI',
    petugasInput: 'Siti Operator',
  },
];

const mockInitialStock = {
  Robusta: 1000,
  Arabica: 500,
  Excelsa: 200,
};

test('Ledger calculation correctly computes opening balance before start date', () => {
  // Robusta base: 1000 + 500 (tx-1) - 200 (tx-2) = 1300 kg
  const result = calculateLedger(
    mockTransactions,
    'Robusta',
    '2026-10-10',
    '2026-10-20',
    mockInitialStock
  );

  assert.equal(result.openingBalanceKg, 1300);
});

test('Ledger calculation excludes pending and rejected transactions', () => {
  const result = calculateLedger(
    mockTransactions,
    'Robusta',
    '2026-10-10',
    '2026-10-20',
    mockInitialStock
  );

  // tx-3 (pending 1000kg) and tx-4 (rejected 300kg) must not affect opening balance
  assert.equal(result.openingBalanceKg, 1300);

  // tx-8 (pending 80kg) must not appear in rows
  const hasPending = result.rows.some((r) => r.kodeReferensi === 'TR-202610-008');
  assert.equal(hasPending, false);
});

test('Ledger calculation computes running balances and final closing balance accurately', () => {
  const result = calculateLedger(
    mockTransactions,
    'Robusta',
    '2026-10-10',
    '2026-10-20',
    mockInitialStock
  );

  // Row 1: 1300 + 400 = 1700 kg
  assert.equal(result.rows[0].kodeReferensi, 'TR-202610-005');
  assert.equal(result.rows[0].saldoKg, 1700);

  // Row 2: 1700 - 150 = 1550 kg
  assert.equal(result.rows[1].kodeReferensi, 'TR-202610-006');
  assert.equal(result.rows[1].saldoKg, 1550);

  // Row 3: 1550 + 50 (retur) = 1600 kg
  assert.equal(result.rows[2].kodeReferensi, 'TR-202610-007');
  assert.equal(result.rows[2].saldoKg, 1600);

  // Totals:
  // Masuk: 400, Keluar: 150, Retur: 50
  assert.equal(result.totalMasukKg, 400);
  assert.equal(result.totalKeluarKg, 150);
  assert.equal(result.totalReturKg, 50);

  // Formula: Closing = Opening + Masuk - Keluar + Retur
  // 1300 + 400 - 150 + 50 = 1600 kg
  assert.equal(result.closingBalanceKg, 1600);
});

test('Aggregate ALL filter computes combined stock while preserving individual varieties', () => {
  const result = calculateLedger(
    mockTransactions,
    'ALL',
    '2026-10-10',
    '2026-10-20',
    mockInitialStock
  );

  // Base aggregate: 1000 + 500 + 200 = 1700
  // Before period Robusta: +500 - 200 = +300
  // Total opening = 1700 + 300 = 2000 kg
  assert.equal(result.openingBalanceKg, 2000);

  // In period: Robusta +400, Arabica +300, Robusta -150, Robusta retur +50
  // Total Masuk = 400 + 300 = 700
  // Total Keluar = 150
  // Total Retur = 50
  // Closing = 2000 + 700 - 150 + 50 = 2600 kg
  assert.equal(result.totalMasukKg, 700);
  assert.equal(result.totalKeluarKg, 150);
  assert.equal(result.totalReturKg, 50);
  assert.equal(result.closingBalanceKg, 2600);

  // Rows retain individual variety
  const varieties = result.rows.map((r) => r.jenisKopi);
  assert.ok(varieties.includes('Robusta'));
  assert.ok(varieties.includes('Arabica'));
});

test('CSV export generator produces valid headers, data rows and totals', () => {
  const result = calculateLedger(
    mockTransactions,
    'Robusta',
    '2026-10-10',
    '2026-10-20',
    mockInitialStock
  );

  const csv = generateLedgerCsv(result, '2026-10-25');
  assert.ok(csv.includes('KOPI MBEKAYU - LAPORAN PEMBUKUAN STOK KOPI'));
  assert.ok(csv.includes('Kartu Saldo Berjalan (Ledger)'));
  assert.ok(csv.includes('Filter Jenis Kopi,"Biji Kopi Robusta"'));
  assert.ok(csv.includes('SALDO AWAL PERIODE'));
  assert.ok(csv.includes('TR-202610-005'));
  assert.ok(csv.includes('TR-202610-007'));
  assert.ok(csv.includes('SALDO AKHIR (kg)'));
});

test('formatKg formats numbers according to Indonesian standards', () => {
  assert.equal(formatKg(1500), '1.500 kg');
  assert.equal(formatKg(25.5), '25,5 kg');
  assert.equal(formatKg(0), '0 kg');
});
