import React from 'react';
import { LedgerCalculationResult } from '../types';
import { COFFEE_LABELS, formatDateId, formatKg, formatNumberId } from '../utils/ledger';
import { Coffee, Printer, X, Download } from 'lucide-react';

interface PrintableLedgerProps {
  calculation: LedgerCalculationResult;
  onClosePreview?: () => void;
  isModalPreview?: boolean;
}

export const PrintableLedger: React.FC<PrintableLedgerProps> = ({
  calculation,
  onClosePreview,
  isModalPreview = false,
}) => {
  const printTimestamp = new Date();
  const printDateStr = formatDateId(printTimestamp.toISOString().split('T')[0]);
  const printTimeStr = printTimestamp.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = (
    <div className="bg-white text-black p-4 sm:p-8 font-sans max-w-[1200px] mx-auto text-[11px] leading-tight">
      {/* Printable Header */}
      <div className="border-b-2 border-black pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 border-2 border-black rounded-lg flex items-center justify-center font-bold text-lg font-serif">
              KM
            </div>
            <div>
              <div className="text-xl font-bold tracking-wider font-serif uppercase">
                KOPI MBEKAYU
              </div>
              <div className="text-[10px] tracking-wide uppercase text-neutral-800">
                Roastery, Coffee Lab & Logistik Gudang Bahan Baku
              </div>
              <div className="text-[9px] text-neutral-600">
                Jl. Perkebunan Kopi No. 18 • Telp: (0286) 321-450 • Arsip Produksi Resmi
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold uppercase tracking-wider bg-black text-white px-3 py-1 inline-block mb-1">
              DOKUMEN KARTU STOK RESMI
            </div>
            <div className="text-[9px] text-neutral-700">
              No. Dok: <strong>KM-BKK/{calculation.startDate.replace(/-/g, '')}/{calculation.coffeeFilter}</strong>
            </div>
            <div className="text-[9px] text-neutral-600">
              Dicetak: {printDateStr}, pukul {printTimeStr} WIB
            </div>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="mt-4 pt-3 border-t border-neutral-300 text-center">
          <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
            LAPORAN PEMBUKUAN STOK KOPI
          </h1>
          <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
            Kartu Saldo Berjalan (Ledger Mutasi Fisik)
          </p>
        </div>

        {/* Parameters Meta Grid */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-100 p-2.5 rounded border border-neutral-300 text-[10px]">
          <div>
            <span className="text-neutral-500 block uppercase text-[9px] font-bold">Jenis Biji Kopi:</span>
            <span className="font-bold text-black">{COFFEE_LABELS[calculation.coffeeFilter]}</span>
          </div>
          <div>
            <span className="text-neutral-500 block uppercase text-[9px] font-bold">Periode Buku:</span>
            <span className="font-bold text-black">{formatDateId(calculation.startDate)} s/d {formatDateId(calculation.endDate)}</span>
          </div>
          <div>
            <span className="text-neutral-500 block uppercase text-[9px] font-bold">Status Mutasi:</span>
            <span className="font-bold text-black">Hanya Diverifikasi / Approved</span>
          </div>
          <div className="text-right sm:text-left">
            <span className="text-neutral-500 block uppercase text-[9px] font-bold">Klasifikasi Arsip:</span>
            <span className="font-bold text-black">Laporan Audit Inventaris</span>
          </div>
        </div>
      </div>

      {/* Opening Balance Callout */}
      <div className="flex justify-between items-center bg-neutral-50 border border-black px-4 py-2 mb-3 rounded-sm">
        <div>
          <span className="font-bold text-xs uppercase tracking-wide">Saldo Awal (Opening Balance)</span>
          <span className="text-[10px] text-neutral-600 block">
            Posisi akumulasi stok terverifikasi sebelum tanggal {formatDateId(calculation.startDate)}
          </span>
        </div>
        <div className="text-right">
          <span className="font-mono font-extrabold text-sm">{formatKg(calculation.openingBalanceKg)}</span>
        </div>
      </div>

      {/* Ledger Table */}
      <table className="w-full border-collapse border border-black text-[10px] mb-4">
        <thead>
          <tr className="bg-neutral-200 text-black border-b-2 border-black font-bold">
            <th className="border border-black py-2 px-1 text-center w-8">No</th>
            <th className="border border-black py-2 px-2 text-left w-22">Tanggal</th>
            <th className="border border-black py-2 px-2 text-left w-24">Jenis Kopi</th>
            <th className="border border-black py-2 px-2 text-left">Keterangan Transaksi</th>
            <th className="border border-black py-2 px-2 text-right w-20 bg-neutral-100">Masuk (kg)</th>
            <th className="border border-black py-2 px-2 text-right w-20 bg-neutral-100">Keluar (kg)</th>
            <th className="border border-black py-2 px-2 text-right w-20 bg-neutral-100">Retur (kg)</th>
            <th className="border border-black py-2 px-2 text-right w-24 bg-neutral-200">Saldo (kg)</th>
          </tr>
        </thead>
        <tbody>
          {/* Baseline Row */}
          <tr className="bg-neutral-50 italic border-b border-neutral-400">
            <td className="border border-black py-1.5 px-1 text-center font-mono">0</td>
            <td className="border border-black py-1.5 px-2 text-neutral-600">{calculation.startDate}</td>
            <td className="border border-black py-1.5 px-2 text-neutral-600">{calculation.coffeeFilter}</td>
            <td className="border border-black py-1.5 px-2 text-neutral-700 font-medium">
              SALDO AWAL PERIODE (Posisi Sebelum Periode Transaksi)
            </td>
            <td className="border border-black py-1.5 px-2 text-right font-mono text-neutral-400">-</td>
            <td className="border border-black py-1.5 px-2 text-right font-mono text-neutral-400">-</td>
            <td className="border border-black py-1.5 px-2 text-right font-mono text-neutral-400">-</td>
            <td className="border border-black py-1.5 px-2 text-right font-mono font-bold bg-neutral-100">
              {formatNumberId(calculation.openingBalanceKg)}
            </td>
          </tr>

          {calculation.rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="border border-black py-6 text-center text-neutral-500 italic">
                Tidak ada mutasi transaksi terverifikasi pada rentang periode ini. Saldo tetap sama dengan saldo awal.
              </td>
            </tr>
          ) : (
            calculation.rows.map((row) => (
              <tr key={row.id} className="border-b border-neutral-300 hover:bg-neutral-50">
                <td className="border border-black py-1.5 px-1 text-center font-mono">{row.no}</td>
                <td className="border border-black py-1.5 px-2 whitespace-nowrap">
                  <span className="font-semibold">{row.tanggal}</span>
                  {row.waktu && <span className="text-[9px] text-neutral-500 block">{row.waktu}</span>}
                </td>
                <td className="border border-black py-1.5 px-2 font-medium">
                  Biji {row.jenisKopi}
                </td>
                <td className="border border-black py-1.5 px-2">
                  <div className="font-medium text-neutral-900">{row.keterangan}</div>
                  <div className="text-[9px] text-neutral-500 flex space-x-2">
                    <span>Ref: {row.kodeReferensi}</span>
                    <span>•</span>
                    <span>Petugas: {row.petugas}</span>
                  </div>
                </td>
                <td className="border border-black py-1.5 px-2 text-right font-mono">
                  {row.masukKg > 0 ? (
                    <span className="font-semibold text-black">+{formatNumberId(row.masukKg)}</span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                <td className="border border-black py-1.5 px-2 text-right font-mono">
                  {row.keluarKg > 0 ? (
                    <span className="font-semibold text-black">-{formatNumberId(row.keluarKg)}</span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                <td className="border border-black py-1.5 px-2 text-right font-mono">
                  {row.returKg > 0 ? (
                    <span className="font-semibold text-black">+{formatNumberId(row.returKg)}</span>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                <td className="border border-black py-1.5 px-2 text-right font-mono font-bold bg-neutral-100">
                  {formatNumberId(row.saldoKg)}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          {/* Subtotals */}
          <tr className="bg-neutral-100 font-bold border-t-2 border-black">
            <td colSpan={4} className="border border-black py-2 px-2 text-right uppercase tracking-wider">
              TOTAL MUTASI PERIODE DIVERIFIKASI
            </td>
            <td className="border border-black py-2 px-2 text-right font-mono">
              +{formatNumberId(calculation.totalMasukKg)}
            </td>
            <td className="border border-black py-2 px-2 text-right font-mono">
              -{formatNumberId(calculation.totalKeluarKg)}
            </td>
            <td className="border border-black py-2 px-2 text-right font-mono">
              +{formatNumberId(calculation.totalReturKg)}
            </td>
            <td className="border border-black py-2 px-2 text-right font-mono bg-neutral-200">
              -
            </td>
          </tr>

          {/* Final Closing Balance */}
          <tr className="bg-neutral-900 text-white font-extrabold text-xs">
            <td colSpan={4} className="border border-black py-2.5 px-2 text-right uppercase tracking-wider">
              SALDO AKHIR (CLOSING BALANCE) PERIODE
            </td>
            <td colSpan={4} className="border border-black py-2.5 px-3 text-right font-mono text-sm">
              {formatKg(calculation.closingBalanceKg)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Formula verification note */}
      <div className="text-[9px] text-neutral-600 bg-neutral-50 p-2 border border-neutral-300 rounded mb-6">
        <strong>Ketentuan Perhitungan Saldo:</strong> Saldo Akhir = Saldo Awal ({formatNumberId(calculation.openingBalanceKg)} kg) + Masuk Terverifikasi ({formatNumberId(calculation.totalMasukKg)} kg) - Keluar Terverifikasi ({formatNumberId(calculation.totalKeluarKg)} kg) + Retur/Adjustment Disetujui ({formatNumberId(calculation.totalReturKg)} kg) = <strong>{formatKg(calculation.closingBalanceKg)}</strong>. Transaksi status "Menunggu Verifikasi" dan "Ditolak" tidak diakui dalam saldo resmi.
      </div>

      {/* Signature area (Tanda Tangan Fisik Dokumen Gudang) */}
      <div className="signature-block border-t border-black pt-4">
        <div className="grid grid-cols-3 gap-6 text-center text-[10px]">
          {/* Column 1: Prepared By */}
          <div>
            <div className="text-neutral-600 uppercase text-[9px] font-semibold mb-1">
              Dibuat Oleh (Staff Gudang)
            </div>
            <div className="h-16 flex items-end justify-center pb-1">
              <span className="text-[9px] text-neutral-400 italic">(Tanda Tangan)</span>
            </div>
            <div className="font-bold border-b border-black inline-block px-4 pb-0.5">
              Siti Nurhaliza
            </div>
            <div className="text-[9px] text-neutral-600 mt-0.5">Admin & Operator Gudang</div>
            <div className="text-[8px] text-neutral-400">Tgl: ........................................</div>
          </div>

          {/* Column 2: Verified By */}
          <div>
            <div className="text-neutral-600 uppercase text-[9px] font-semibold mb-1">
              Diverifikasi Oleh (QC / Supervisor)
            </div>
            <div className="h-16 flex items-end justify-center pb-1">
              <span className="text-[9px] text-neutral-400 italic">(Tanda Tangan & Cap)</span>
            </div>
            <div className="font-bold border-b border-black inline-block px-4 pb-0.5">
              Bayu Prasetyo, S.TP
            </div>
            <div className="text-[9px] text-neutral-600 mt-0.5">Supervisor QC & Mutasi</div>
            <div className="text-[8px] text-neutral-400">Tgl: ........................................</div>
          </div>

          {/* Column 3: Owner Approval */}
          <div>
            <div className="text-neutral-600 uppercase text-[9px] font-semibold mb-1">
              Disetujui Oleh (Owner / Pemilik)
            </div>
            <div className="h-16 flex items-end justify-center pb-1">
              <span className="text-[9px] text-neutral-400 italic">(Tanda Tangan Basah)</span>
            </div>
            <div className="font-bold border-b border-black inline-block px-4 pb-0.5">
              Bambang Mbekayu
            </div>
            <div className="text-[9px] text-neutral-600 mt-0.5">Pemilik Roastery Kopi Mbekayu</div>
            <div className="text-[8px] text-neutral-400">Tgl: ........................................</div>
          </div>
        </div>

        {/* Footer info & Page numbering */}
        <div className="mt-6 pt-2 border-t border-neutral-300 flex justify-between items-center text-[8px] text-neutral-500">
          <span>KOPI MBEKAYU INVENTORY MANAGEMENT SYSTEM • SISTEM BUKU STOK BERJALAN</span>
          <span>Dokumen Sah Internal • Halaman 1 dari 1</span>
        </div>
      </div>
    </div>
  );

  // If rendered as a screen modal preview
  if (isModalPreview) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-[#EFE9DF] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#D5C2B0]">
          {/* Preview Modal Header */}
          <div className="no-print bg-[#2A1810] text-[#FDFBF7] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Printer className="w-5 h-5 text-[#D4A373]" />
              <span className="font-semibold text-sm">Pratinjau Cetak Arsip (A4 Landscape)</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#8C5835] hover:bg-[#A06B45] text-white text-xs font-semibold shadow transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sekarang (Dialog Browser / PDF)</span>
              </button>
              <button
                onClick={onClosePreview}
                className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                aria-label="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Sheet */}
          <div className="p-4 sm:p-8 overflow-y-auto bg-[#D8D0C5] flex justify-center">
            <div className="shadow-xl rounded bg-white w-full">
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendered in DOM with print-only class for direct window.print()
  return (
    <div className="print-only">
      {content}
    </div>
  );
};
