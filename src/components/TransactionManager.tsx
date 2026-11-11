import React, { useState } from 'react';
import {
  CoffeeType,
  InventoryTransaction,
  TransactionStatus,
  TransactionType,
  UserRole,
} from '../types';
import { USER_PROFILES } from '../data/initialData';
import { formatKg } from '../utils/ledger';
import {
  FilePlus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Filter,
  Check,
  X,
  PlusCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface TransactionManagerProps {
  transactions: InventoryTransaction[];
  currentRole: UserRole;
  onAddTransaction: (tx: InventoryTransaction) => void;
  onApproveTransaction: (id: string, verifierName: string) => void;
  onRejectTransaction: (id: string, reason: string, verifierName: string) => void;
  onNavigateToBookkeeping: () => void;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  transactions,
  currentRole,
  onAddTransaction,
  onApproveTransaction,
  onRejectTransaction,
  onNavigateToBookkeeping,
}) => {
  const user = USER_PROFILES[currentRole];
  const canVerify = currentRole === 'PEMILIK' || currentRole === 'VERIFIKATOR';

  // Form State
  const [jenisKopi, setJenisKopi] = useState<CoffeeType>('Robusta');
  const [tipe, setTipe] = useState<TransactionType>('MASUK');
  const [jumlahKg, setJumlahKg] = useState<string>('100');
  const [tanggal, setTanggal] = useState<string>('2026-11-11');
  const [keterangan, setKeterangan] = useState<string>('');
  const [asalSupplier, setAsalSupplier] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TransactionStatus>('ALL');

  // Reject Modal State
  const [rejectModalTxId, setRejectModalTxId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(jumlahKg);
    if (isNaN(qty) || qty <= 0) return;
    if (!keterangan.trim()) return;

    const prefix = tipe === 'MASUK' ? 'MBK-IN' : tipe === 'KELUAR' ? 'MBK-OUT' : 'MBK-RET';
    const dateFormatted = tanggal.replace(/-/g, '').slice(0, 6);
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const kodeReferensi = `${prefix}-${dateFormatted}-${randomSeq}`;

    // If submitted by Verifikator or Owner, can auto-verify or default to verified
    const isDirectSupervisor = currentRole === 'PEMILIK' || currentRole === 'VERIFIKATOR';

    const newTx: InventoryTransaction = {
      id: `tx-custom-${Date.now()}`,
      kodeReferensi,
      tanggal,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      jenisKopi,
      tipe,
      jumlahKg: qty,
      keterangan: keterangan.trim(),
      status: isDirectSupervisor ? 'DIVERIFIKASI' : 'MENUNGGU_VERIFIKASI',
      petugasInput: user.nama,
      asalGudangAtauSupplier: asalSupplier.trim() || undefined,
      diverifikasiOleh: isDirectSupervisor ? user.nama : undefined,
      tanggalVerifikasi: isDirectSupervisor
        ? `${tanggal} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
        : undefined,
    };

    onAddTransaction(newTx);
    setKeterangan('');
    setAsalSupplier('');
    setShowAddForm(false);
  };

  const handleConfirmReject = () => {
    if (rejectModalTxId && rejectionReason.trim()) {
      onRejectTransaction(rejectModalTxId, rejectionReason.trim(), user.nama);
      setRejectModalTxId(null);
      setRejectionReason('');
    }
  };

  const filteredTx = transactions.filter((tx) => {
    if (statusFilter === 'ALL') return true;
    return tx.status === statusFilter;
  });

  const pendingCount = transactions.filter((tx) => tx.status === 'MENUNGGU_VERIFIKASI').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-[#FAF7F2] border border-[#E7DDD3] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#8C5835] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Manajemen Mutasi & Verifikasi Transaksi Gudang</span>
          </div>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2A1810]">
            Input & Verifikasi Mutasi Kopi
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5A4D] mt-1">
            Setiap mutasi wajib diverifikasi sebelum tercatat resmi pada Kartu Saldo Berjalan (Ledger).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#6B3E26] hover:bg-[#522E1B] text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Formulir' : 'Catat Mutasi Baru'}</span>
          </button>
        </div>
      </div>

      {/* Add Transaction Form Modal / Drawer */}
      {showAddForm && (
        <div className="bg-white border-2 border-[#D5C2B1] rounded-2xl p-6 shadow-md transition-all">
          <div className="flex justify-between items-center pb-3 border-b border-[#E8DCD0] mb-4">
            <div className="flex items-center space-x-2">
              <FilePlus className="w-5 h-5 text-[#8C5835]" />
              <h2 className="font-bold text-base text-[#2E1B11]">
                Formulir Pencatatan Mutasi Fisik Kopi
              </h2>
            </div>
            <span className="text-xs text-[#8C7565]">
              Petugas: <strong>{user.nama}</strong> ({currentRole})
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Jenis Kopi */}
              <div>
                <label className="block text-xs font-bold text-[#5C4537] mb-1">Jenis Biji Kopi</label>
                <select
                  value={jenisKopi}
                  onChange={(e) => setJenisKopi(e.target.value as CoffeeType)}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8C5835]"
                >
                  <option value="Robusta">Biji Kopi Robusta</option>
                  <option value="Arabica">Biji Kopi Arabica</option>
                  <option value="Excelsa">Biji Kopi Excelsa</option>
                </select>
              </div>

              {/* Tipe Transaksi */}
              <div>
                <label className="block text-xs font-bold text-[#5C4537] mb-1">Arah Mutasi</label>
                <select
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value as TransactionType)}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8C5835]"
                >
                  <option value="MASUK">Penerimaan Masuk (+ kg)</option>
                  <option value="KELUAR">Pengeluaran Roasting / Jual (- kg)</option>
                  <option value="RETUR">Retur Stok / Penyesuaian (+ kg)</option>
                </select>
              </div>

              {/* Jumlah Kg */}
              <div>
                <label className="block text-xs font-bold text-[#5C4537] mb-1">Jumlah Berat (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={jumlahKg}
                  onChange={(e) => setJumlahKg(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8C5835]"
                  required
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-[#5C4537] mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#8C5835]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5C4537] mb-1">Keterangan Transaksi / Catatan Batch</label>
                <input
                  type="text"
                  placeholder="Contoh: Penerimaan Robusta Dampit karung goni lot B-2026..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C5835]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C4537] mb-1">Asal Supplier / Mitra / Divisi</label>
                <input
                  type="text"
                  placeholder="Contoh: Gapoktan Temanggung Makmur / Roastery Lab"
                  value={asalSupplier}
                  onChange={(e) => setAsalSupplier(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#D5C2B1] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8C5835]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#7C6354]">
                {canVerify
                  ? 'Sebagai Verifikator/Pemilik, transaksi ini akan otomatis tercatat sebagai DIVERIFIKASI.'
                  : 'Sebagai Operator, transaksi akan berstatus MENUNGGU VERIFIKASI sebelum masuk kartu saldo.'}
              </span>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#4A2D1D] hover:bg-[#382013] text-white text-xs font-semibold shadow-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Verification Queue & History */}
      <div className="bg-white border border-[#E7DDD3] rounded-2xl shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E7DDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-[#2D1B12]">
              Daftar Catatan Mutasi Fisik & Status Verifikasi
            </h2>
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                {pendingCount} Butuh Approval
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#8C7565]">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-[#D5C2B1] rounded-lg px-2.5 py-1 text-xs font-medium text-[#2E1B11] focus:outline-none"
            >
              <option value="ALL">Semua Status ({transactions.length})</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi ({pendingCount})</option>
              <option value="DIVERIFIKASI">Diverifikasi (Masuk Saldo)</option>
              <option value="DITOLAK">Ditolak QC (Tidak Masuk Saldo)</option>
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F2ECE3] text-[#4A3224] border-b border-[#DFD3C6] font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Kode Ref</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Jenis Kopi</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-4">Keterangan & Sumber</th>
                <th className="py-2.5 px-3 text-right">Berat (kg)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE7DE]">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8C7565]">
                    Tidak ada catatan transaksi dengan filter ini.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-[#4A3224] whitespace-nowrap">
                      {tx.kodeReferensi}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-[#2D1B12]">{tx.tanggal}</span>
                      {tx.waktu && <span className="text-[10px] text-[#8C7565] block">{tx.waktu}</span>}
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {tx.jenisKopi}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.tipe === 'MASUK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.tipe === 'KELUAR'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {tx.tipe}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#2E1B11]">{tx.keterangan}</div>
                      <div className="text-[10px] text-[#8C7565] mt-0.5">
                        {tx.asalGudangAtauSupplier && <span>Asal: {tx.asalGudangAtauSupplier} • </span>}
                        <span>Input: {tx.petugasInput}</span>
                        {tx.diverifikasiOleh && (
                          <span className="text-emerald-700 ml-1">
                            • Diverifikasi: {tx.diverifikasiOleh}
                          </span>
                        )}
                        {tx.catatanPenolakan && (
                          <span className="text-red-700 ml-1 font-semibold block">
                            Catatan Tolak: {tx.catatanPenolakan}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                      {formatKg(tx.jumlahKg)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {tx.status === 'DIVERIFIKASI' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Diverifikasi
                        </span>
                      ) : tx.status === 'MENUNGGU_VERIFIKASI' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          <Clock className="w-3 h-3 mr-1" /> Menunggu QC
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3 h-3 mr-1" /> Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {tx.status === 'MENUNGGU_VERIFIKASI' ? (
                        canVerify ? (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => onApproveTransaction(tx.id, user.nama)}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold inline-flex items-center transition-colors shadow-xs"
                              title="Setujui dan masukkan ke Saldo Resmi"
                            >
                              <Check className="w-3 h-3 mr-1" /> Setujui
                            </button>
                            <button
                              onClick={() => setRejectModalTxId(tx.id)}
                              className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold inline-flex items-center transition-colors shadow-xs"
                              title="Tolak mutasi karena cacat/rusak"
                            >
                              <X className="w-3 h-3 mr-1" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-400 italic">
                            Menunggu Supervisor
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-stone-500 font-mono">
                          {tx.status === 'DIVERIFIKASI' ? 'Tercatat di Ledger' : 'Arsip Ditolak'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalTxId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-300">
            <div className="flex items-center space-x-2 text-rose-800 font-bold text-base mb-2">
              <AlertCircle className="w-5 h-5" />
              <span>Konfirmasi Penolakan Mutasi Stok</span>
            </div>
            <p className="text-xs text-[#5D4638] mb-4">
              Transaksi yang ditolak tidak akan dimasukkan ke dalam Kartu Saldo Berjalan (Ledger) resmi Kopi Mbekayu. Berikan alasan penolakan untuk arsip audit:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Kadar air biji kopi > 14%, terdapat kutu atau bau apek..."
              className="w-full border border-stone-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-600 focus:outline-none mb-4"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalTxId(null);
                  setRejectionReason('');
                }}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold disabled:opacity-50"
              >
                Tolak Mutasi Resmi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
