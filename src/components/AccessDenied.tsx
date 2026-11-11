import React from 'react';
import { ShieldAlert, ArrowRight, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface AccessDeniedProps {
  currentRole: UserRole;
  onSwitchToMutations: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  currentRole,
  onSwitchToMutations,
  onSwitchRole,
}) => {
  return (
    <div className="max-w-3xl mx-auto my-12 px-4">
      <div className="bg-[#FAF7F2] border border-[#E4D9CE] rounded-2xl p-8 sm:p-10 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#F0E5D8] border border-[#D5C1AE] flex items-center justify-center text-[#7C4A27]">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8D7C7] text-[#5C3215] mb-3">
          Akses Dibatasi Sistem RBAC
        </span>

        <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2E1A11] mb-3">
          Akses Modul Pembukuan Stok Terkunci
        </h2>

        <p className="text-[#695446] text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
          Sesuai SOP inventarisasi roastery <strong>KOPI MBEKAYU</strong>, modul <em>Pembukuan Stok Kopi & Kartu Saldo Berjalan</em> hanya dapat diakses oleh jabatan <strong>Verifikator</strong> dan <strong>Pemilik</strong>.
        </p>

        <div className="bg-[#F2ECE4] border border-[#DDD0C2] rounded-xl p-4 max-w-lg mx-auto text-left mb-8">
          <div className="text-xs font-semibold text-[#4A3022] uppercase tracking-wider mb-2">
            Matriks Wewenang Pengguna:
          </div>
          <ul className="text-xs text-[#5D4638] space-y-1.5">
            <li className="flex items-center space-x-2">
              <span className="text-amber-700 font-bold">👑 Pemilik:</span>
              <span>Akses penuh, review pembukuan, filter data, cetak resmi & export CSV.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-blue-700 font-bold">🛡️ Verifikator:</span>
              <span>Review mutasi buku stok, verifikasi fisik, validasi saldo berjalan.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-stone-700 font-bold">📋 Operator (Anda):</span>
              <span className="text-red-700 font-medium">Hanya berwenang menginput transaksi masuk/keluar/retur di gudang.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onSwitchToMutations}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#6B3E26] hover:bg-[#522E1B] text-[#FFF7EE] font-semibold text-sm transition-colors shadow-sm"
          >
            <span>Buka Modul Input Mutasi Gudang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSwitchRole('PEMILIK')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#E8DDD1] hover:bg-[#DDD0C2] text-[#4A3022] font-semibold text-sm transition-colors border border-[#CDBEAF]"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Simulasikan Peran Pemilik</span>
          </button>
        </div>
      </div>
    </div>
  );
};
