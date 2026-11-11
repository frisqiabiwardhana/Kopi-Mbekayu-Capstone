import React, { useState, useMemo } from 'react';
import {
  CoffeeFilter,
  InventoryTransaction,
  UserRole,
} from '../types';
import {
  calculateLedger,
  COFFEE_LABELS,
  downloadCsvFile,
  formatDateId,
  formatKg,
  formatNumberId,
  generateLedgerCsv,
} from '../utils/ledger';
import { PrintableLedger } from './PrintableLedger';
import {
  Printer,
  FileSpreadsheet,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Scale,
  ShieldCheck,
  Lock,
  Eye,
  Info,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface BookkeepingPageProps {
  transactions: InventoryTransaction[];
  currentRole: UserRole;
  onNavigateToMutations?: () => void;
}

export const BookkeepingPage: React.FC<BookkeepingPageProps> = ({
  transactions,
  currentRole,
  onNavigateToMutations,
}) => {
  // 1. Filter States
  const [coffeeFilter, setCoffeeFilter] = useState<CoffeeFilter>('ALL');
  // Default date window: 2026-10-01 to 2026-11-30 (covers current season & operations)
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-11-30');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // 2. Permission Flags
  const canExportCsv = currentRole === 'PEMILIK';
  const canPrintReport = currentRole === 'PEMILIK';

  // 3. Dynamic Calculation of Ledger (Kartu Saldo Berjalan)
  const calculation = useMemo(() => {
    return calculateLedger(transactions, coffeeFilter, startDate, endDate);
  }, [transactions, coffeeFilter, startDate, endDate]);

  // Count pending transactions to show operational alert
  const pendingCount = useMemo(() => {
    return transactions.filter(
      (tx) =>
        tx.status === 'MENUNGGU_VERIFIKASI' &&
        (coffeeFilter === 'ALL' || tx.jenisKopi === coffeeFilter) &&
        tx.tanggal >= startDate &&
        tx.tanggal <= endDate
    ).length;
  }, [transactions, coffeeFilter, startDate, endDate]);

  // Handle Export CSV
  const handleExportCsv = () => {
    if (!canExportCsv) return;
    const today = new Date().toISOString().split('T')[0];
    const csvContent = generateLedgerCsv(calculation, today);
    const filename = `Laporan_Stok_Kopi_Mbekayu_${today}.csv`;
    downloadCsvFile(csvContent, filename);
  };

  // Handle Print Report
  const handlePrint = () => {
    if (!canPrintReport) return;
    window.print();
  };

  // Quick Preset Handlers
  const handlePresetChange = (preset: 'month' | 'today' | 'oct' | 'all') => {
    if (preset === 'today') {
      const today = '2026-11-11';
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'month') {
      setStartDate('2026-11-01');
      setEndDate('2026-11-30');
    } else if (preset === 'oct') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (preset === 'all') {
      setStartDate('2026-09-01');
      setEndDate('2026-11-30');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header Section */}
      <div className="no-print bg-[#FAF7F2] border border-[#E7DDD3] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4A373]/15 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C5835]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C5835]">
                Modul Akuntansi & Inventaris Roastery
              </span>
            </div>

            <h1 className="font-serif-brand text-3xl sm:text-4xl font-extrabold text-[#2A1810] tracking-tight">
              Pembukuan Stok Kopi
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#6E5A4D] max-w-3xl leading-relaxed">
              Laporan mutasi pergerakan kartu stok otomatis dan cetak resmi untuk arsip produksi gudang.
            </p>
          </div>

          {/* Action Buttons: Cetak Laporan & Export CSV */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Cetak Laporan Button */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (canPrintReport) {
                    setShowPrintModal(true);
                  }
                }}
                disabled={!canPrintReport}
                className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
                  canPrintReport
                    ? 'bg-[#4A2D1D] hover:bg-[#382013] text-[#FAF5ED] active:scale-[0.98]'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                }`}
                title={canPrintReport ? 'Cetak Laporan Resmi A4 Landscape' : 'Akses Cetak Khusus Pemilik'}
              >
                {canPrintReport ? (
                  <Printer className="w-4 h-4 text-[#E2BA96]" />
                ) : (
                  <Lock className="w-4 h-4 text-stone-400" />
                )}
                <span>Cetak Laporan</span>
              </button>

              {!canPrintReport && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-[#23150F] text-[#EDE0D4] text-[11px] rounded-lg shadow-lg text-center z-20">
                  Akses cetak fisik laporan dibatasi khusus <strong>Pemilik</strong>.
                </div>
              )}
            </div>

            {/* Direct Instant Print */}
            {canPrintReport && (
              <button
                onClick={handlePrint}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-[#EFE7DE] hover:bg-[#E5DACE] text-[#4A2D1D] font-medium text-xs border border-[#D5C2B1] transition-colors"
                title="Buka dialog printer browser langsung"
              >
                <Printer className="w-3.5 h-3.5 text-[#8C5835]" />
                <span>Print Dialog</span>
              </button>
            )}

            {/* Export CSV Button */}
            <div className="relative group">
              <button
                onClick={handleExportCsv}
                disabled={!canExportCsv}
                className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
                  canExportCsv
                    ? 'bg-[#F2EAE0] hover:bg-[#E7DDCE] text-[#3D251A] border border-[#CDBCAB] active:scale-[0.98]'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                }`}
                title={canExportCsv ? 'Download format CSV: Laporan_Stok_Kopi_Mbekayu_YYYY-MM-DD.csv' : 'Akses Export CSV Khusus Pemilik'}
              >
                {canExportCsv ? (
                  <FileSpreadsheet className="w-4 h-4 text-[#8C5835]" />
                ) : (
                  <Lock className="w-4 h-4 text-stone-400" />
                )}
                <span>Export CSV</span>
              </button>

              {!canExportCsv && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-[#23150F] text-[#EDE0D4] text-[11px] rounded-lg shadow-lg text-center z-20">
                  Export file CSV hanya dapat dilakukan oleh <strong>Pemilik</strong>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verifier status badge note */}
        {currentRole === 'VERIFIKATOR' && (
          <div className="mt-4 pt-3 border-t border-[#E8DCD0] flex items-center space-x-2 text-xs text-[#7B5B47]">
            <Eye className="w-4 h-4 text-blue-700" />
            <span>
              Anda login sebagai <strong>Verifikator</strong>: Anda dapat meninjau buku stok dan kartu saldo berjalan. Wewenang ekspor CSV & pencetakan resmi dipegang oleh Pemilik.
            </span>
          </div>
        )}
      </div>

      {/* 2. Filter Buku Stok */}
      <div className="no-print bg-white border border-[#E7DDD3] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-[#3D251A]">
            <Filter className="w-4 h-4 text-[#8C5835]" />
            <span>FILTER BUKU STOK</span>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#8C7565] font-medium mr-1 hidden sm:inline">Pilihan Cepat:</span>
            <button
              type="button"
              onClick={() => handlePresetChange('oct')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                startDate === '2026-10-01' && endDate === '2026-10-31'
                  ? 'bg-[#4A2D1D] text-white border-[#4A2D1D]'
                  : 'bg-[#F9F6F0] text-[#5A4537] border-[#E2D5C7] hover:bg-[#EFE8DE]'
              }`}
            >
              Oktober 2026
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('month')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                startDate === '2026-11-01' && endDate === '2026-11-30'
                  ? 'bg-[#4A2D1D] text-white border-[#4A2D1D]'
                  : 'bg-[#F9F6F0] text-[#5A4537] border-[#E2D5C7] hover:bg-[#EFE8DE]'
              }`}
            >
              November 2026
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('all')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                startDate === '2026-09-01' && endDate === '2026-11-30'
                  ? 'bg-[#4A2D1D] text-white border-[#4A2D1D]'
                  : 'bg-[#F9F6F0] text-[#5A4537] border-[#E2D5C7] hover:bg-[#EFE8DE]'
              }`}
            >
              Semua Periode Aktif
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* A. Jenis Biji Kopi */}
          <div>
            <label htmlFor="coffee-type-filter" className="block text-xs font-bold uppercase tracking-wider text-[#695446] mb-1.5">
              A. Jenis Biji Kopi
            </label>
            <select
              id="coffee-type-filter"
              aria-label="Jenis Biji Kopi"
              value={coffeeFilter}
              onChange={(e) => setCoffeeFilter(e.target.value as CoffeeFilter)}
              className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#2D1B12] focus:outline-none focus:ring-2 focus:ring-[#8C5835] focus:border-transparent transition-all"
            >
              <option value="ALL">Semua Jenis Kopi (Akumulasi)</option>
              <option value="Robusta">Biji Kopi Robusta</option>
              <option value="Arabica">Biji Kopi Arabica</option>
              <option value="Excelsa">Biji Kopi Excelsa</option>
            </select>
            <span className="text-[11px] text-[#8C7565] mt-1 block">
              {coffeeFilter === 'ALL'
                ? 'Akumulasi total kg seluruh varietas dengan saldo berjalan konsolidasi.'
                : `Menampilkan saldo berjalan khusus bahan baku ${coffeeFilter}.`}
            </span>
          </div>

          {/* B1. Tanggal Awal */}
          <div>
            <label htmlFor="start-date-input" className="block text-xs font-bold uppercase tracking-wider text-[#695446] mb-1.5">
              B. Periode — Tanggal Awal
            </label>
            <div className="relative">
              <input
                id="start-date-input"
                aria-label="Tanggal Awal Periode"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2D1B12] focus:outline-none focus:ring-2 focus:ring-[#8C5835] focus:border-transparent transition-all"
              />
            </div>
            <span className="text-[11px] text-[#8C7565] mt-1 block">
              Transaksi sebelum tanggal ini diakumulasikan ke Saldo Awal.
            </span>
          </div>

          {/* B2. Tanggal Akhir */}
          <div>
            <label htmlFor="end-date-input" className="block text-xs font-bold uppercase tracking-wider text-[#695446] mb-1.5">
              B. Periode — Tanggal Akhir
            </label>
            <div className="relative">
              <input
                id="end-date-input"
                aria-label="Tanggal Akhir Periode"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#2D1B12] focus:outline-none focus:ring-2 focus:ring-[#8C5835] focus:border-transparent transition-all"
              />
            </div>
            <span className="text-[11px] text-[#8C7565] mt-1 block">
              Batas akhir transaksi yang masuk dalam perhitungan periode berjalan.
            </span>
          </div>
        </div>
      </div>

      {/* Pending Transactions Notice (if any within active range) */}
      {pendingCount > 0 && (
        <div className="no-print bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Terdapat <strong>{pendingCount} transaksi</strong> dengan status <em>Menunggu Verifikasi</em> pada periode ini. Sesuai aturan akuntansi, transaksi tersebut <strong>dikecualikan</strong> dari saldo resmi hingga disetujui Verifikator.
            </span>
          </div>
          {onNavigateToMutations && (
            <button
              onClick={onNavigateToMutations}
              className="underline font-bold text-amber-950 hover:text-amber-800 shrink-0 ml-3"
            >
              Tinjau Antrean Verifikasi →
            </button>
          )}
        </div>
      )}

      {/* 3. Mathematical Balances Summary Cards (Opening, In, Out, Return, Closing) */}
      <div className="no-print grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Saldo Awal */}
        <div className="bg-[#FAF7F2] border border-[#E7DDD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7E695A] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Awal</span>
            <Scale className="w-4 h-4 text-[#8C5835]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#2E1B11] font-mono">
              {formatKg(calculation.openingBalanceKg)}
            </div>
            <p className="text-[11px] text-[#8C7565] mt-1">
              Posisi per {formatDateId(calculation.startDate)}
            </p>
          </div>
        </div>

        {/* Card 2: Total Masuk */}
        <div className="bg-[#F4FAF5] border border-[#CDE5D4] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#2D6A4F] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Masuk</span>
            <ArrowDownRight className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1B4332] font-mono">
              +{formatKg(calculation.totalMasukKg)}
            </div>
            <p className="text-[11px] text-[#407B5E] mt-1">
              Penerimaan green bean verified
            </p>
          </div>
        </div>

        {/* Card 3: Total Keluar */}
        <div className="bg-[#FFF8F7] border border-[#F5D5CF] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#A84232] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Keluar</span>
            <ArrowUpRight className="w-4 h-4 text-[#A84232]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#7D2417] font-mono">
              -{formatKg(calculation.totalKeluarKg)}
            </div>
            <p className="text-[11px] text-[#A84232] mt-1">
              Roasting & distribusi resmi
            </p>
          </div>
        </div>

        {/* Card 4: Total Retur */}
        <div className="bg-[#F7FAFD] border border-[#D0E2F3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#205A8E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Retur</span>
            <RotateCcw className="w-4 h-4 text-[#205A8E]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#133A5E] font-mono">
              +{formatKg(calculation.totalReturKg)}
            </div>
            <p className="text-[11px] text-[#2968A3] mt-1">
              Adjustment sisa cupping / roasting
            </p>
          </div>
        </div>

        {/* Card 5: Saldo Akhir (Closing Balance) */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#3D251A] to-[#26150D] text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#ECC8AF] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Akhir</span>
            <ShieldCheck className="w-4 h-4 text-[#E2BA96]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {formatKg(calculation.closingBalanceKg)}
            </div>
            <p className="text-[11px] text-[#D5B8A2] mt-1">
              Hasil akumulasi buku stok resmi
            </p>
          </div>
        </div>
      </div>

      {/* 4. Kartu Saldo Berjalan (Ledger Table) */}
      <div className="no-print bg-white border border-[#E7DDD3] rounded-2xl shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E7DDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-[#2D1B12] font-serif-brand">
                Kartu Saldo Berjalan (Stock Card Ledger)
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EFE8DE] text-[#6E4B33] border border-[#D5C2B1]">
                {COFFEE_LABELS[calculation.coffeeFilter]}
              </span>
            </div>
            <p className="text-xs text-[#7E695A] mt-0.5">
              Rentang: <strong>{formatDateId(calculation.startDate)}</strong> sampai dengan <strong>{formatDateId(calculation.endDate)}</strong>
            </p>
          </div>

          <div className="text-xs text-[#8C7565] flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Formula: Saldo Akhir = Saldo Awal + Masuk - Keluar + Retur</span>
          </div>
        </div>

        {/* Ledger Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F2ECE3] text-[#4A3224] border-b border-[#DFD3C6] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 w-28">Tanggal</th>
                <th className="py-3 px-3 w-32">Jenis Kopi</th>
                <th className="py-3 px-4">Keterangan Transaksi</th>
                <th className="py-3 px-3 text-right w-28 bg-[#EBF4ED] text-[#22573F]">Masuk (kg)</th>
                <th className="py-3 px-3 text-right w-28 bg-[#FBF0EE] text-[#8C2C1F]">Keluar (kg)</th>
                <th className="py-3 px-3 text-right w-28 bg-[#EEF4FB] text-[#1B4B79]">Retur (kg)</th>
                <th className="py-3 px-4 text-right w-32 bg-[#EFE8DE] text-[#2D1A10]">Saldo (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE7DE]">
              {/* Row 0: Opening Balance */}
              <tr className="bg-[#FAF7F2] font-semibold text-[#5A4333]">
                <td className="py-3 px-3 text-center font-mono text-[#8C7565]">0</td>
                <td className="py-3 px-3 font-mono text-stone-600">{calculation.startDate}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8DDD0] text-[#543826]">
                    {calculation.coffeeFilter === 'ALL' ? 'Akumulasi' : calculation.coffeeFilter}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-[#3D251A]">
                  SALDO AWAL (Posisi stok sebelum periode {formatDateId(calculation.startDate)})
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#8C7565]">-</td>
                <td className="py-3 px-3 text-right font-mono text-[#8C7565]">-</td>
                <td className="py-3 px-3 text-right font-mono text-[#8C7565]">-</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-sm bg-[#F5ECE1] text-[#2E1B11]">
                  {formatKg(calculation.openingBalanceKg)}
                </td>
              </tr>

              {/* Transaction rows */}
              {calculation.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#8C7565] bg-[#FCFBF8]">
                    <p className="font-semibold text-sm">Tidak ada mutasi transaksi terverifikasi pada rentang periode ini.</p>
                    <p className="text-xs text-[#A89280] mt-1">Saldo tetap konstan sebesar Saldo Awal ({formatKg(calculation.openingBalanceKg)}).</p>
                  </td>
                </tr>
              ) : (
                calculation.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-[#7D6656]">{row.no}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-[#2D1B12]">{row.tanggal}</span>
                      {row.waktu && <span className="text-[10px] text-[#8C7565] block">{row.waktu} WIB</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        row.jenisKopi === 'Robusta'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : row.jenisKopi === 'Arabica'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {row.jenisKopi}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#2E1B11]">{row.keterangan}</div>
                      <div className="text-[10px] text-[#8C7565] flex items-center space-x-2 mt-0.5">
                        <span className="font-mono">{row.kodeReferensi}</span>
                        <span>•</span>
                        <span>Petugas: {row.petugas}</span>
                        <span className="inline-flex items-center text-emerald-700 font-semibold ml-1">
                          <CheckCircle className="w-3 h-3 mr-0.5" /> Terverifikasi
                        </span>
                      </div>
                    </td>
                    {/* Masuk */}
                    <td className="py-3 px-3 text-right font-mono bg-[#F7FBF8]">
                      {row.masukKg > 0 ? (
                        <span className="font-bold text-emerald-700">+{formatKg(row.masukKg)}</span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    {/* Keluar */}
                    <td className="py-3 px-3 text-right font-mono bg-[#FDF9F8]">
                      {row.keluarKg > 0 ? (
                        <span className="font-bold text-rose-700">-{formatKg(row.keluarKg)}</span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    {/* Retur */}
                    <td className="py-3 px-3 text-right font-mono bg-[#F8FAFD]">
                      {row.returKg > 0 ? (
                        <span className="font-bold text-sky-700">+{formatKg(row.returKg)}</span>
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    {/* Saldo Berjalan */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#2D1A10] bg-[#FAF5EE]">
                      {formatKg(row.saldoKg)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              {/* Totals Row */}
              <tr className="bg-[#F0E8DC] font-bold text-[#3D251A] border-t-2 border-[#D5C2B1]">
                <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs">
                  TOTAL MUTASI DIVERIFIKASI
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 text-sm bg-[#E4EFE6]">
                  +{formatKg(calculation.totalMasukKg)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-rose-800 text-sm bg-[#F8E3E0]">
                  -{formatKg(calculation.totalKeluarKg)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-sky-800 text-sm bg-[#E1EDF8]">
                  +{formatKg(calculation.totalReturKg)}
                </td>
                <td className="py-3 px-4 text-right font-mono bg-[#E8DDD0] text-stone-500">
                  -
                </td>
              </tr>

              {/* Final Closing Balance Row */}
              <tr className="bg-[#2D1B12] text-white font-extrabold text-sm border-t border-[#4A2E20]">
                <td colSpan={4} className="py-4 px-4 text-right uppercase tracking-wider font-serif-brand">
                  SALDO AKHIR (CLOSING BALANCE) PERIODE
                </td>
                <td colSpan={4} className="py-4 px-4 text-right font-mono text-base text-[#F7EFE6]">
                  {formatKg(calculation.closingBalanceKg)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer Audit Guarantee Notice */}
        <div className="px-6 py-3.5 bg-[#FAF7F2] border-t border-[#E7DDD3] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#7E695A] gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#8C5835] shrink-0" />
            <span>
              Saldo dihitung otomatis secara berantai berdasarkan catatan transaksi yang diverifikasi. Data siap dicetak dan diekspor untuk audit inventaris fisik gudang.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#A89280] shrink-0">
            Arsip Kopi Mbekayu
          </span>
        </div>
      </div>

      {/* 5. Printable Ledger Component (Rendered hidden for direct print + modal preview) */}
      <PrintableLedger calculation={calculation} />

      {/* Modal Preview when Cetak Laporan button is clicked */}
      {showPrintModal && (
        <PrintableLedger
          calculation={calculation}
          isModalPreview={true}
          onClosePreview={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
