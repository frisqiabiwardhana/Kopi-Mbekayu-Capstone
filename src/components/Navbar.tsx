import React from 'react';
import { UserRole, UserProfile } from '../types';
import { USER_PROFILES } from '../data/initialData';
import { Coffee, ShieldCheck, UserCheck, Wrench, BookOpen, Layers, RefreshCw, FileCheck2 } from 'lucide-react';

interface NavbarProps {
  currentTab: 'bookkeeping' | 'warehouse' | 'mutations';
  setCurrentTab: (tab: 'bookkeeping' | 'warehouse' | 'mutations') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  pendingCount: number;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  setCurrentRole,
  pendingCount,
  onResetData,
}) => {
  const user: UserProfile = USER_PROFILES[currentRole];

  return (
    <header className="no-print bg-[#2A1810] text-[#FDFBF7] border-b border-[#3D261C] sticky top-0 z-30 shadow-md">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-16 py-2 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A06B45] to-[#784728] flex items-center justify-center shadow-inner text-white border border-[#D4A373]/30 shrink-0">
              <Coffee className="w-5 h-5 text-[#FFF1DC]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif-brand text-lg sm:text-2xl font-bold tracking-wide text-[#F8F1E5]">
                  KOPI MBEKAYU
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#8C5835]/40 text-[#ECC8AF] border border-[#8C5835]">
                  Roastery
                </span>
              </div>
              <p className="text-[11px] text-[#BBA594] hidden sm:block">
                Sistem Manajemen Stok & Kartu Saldo Berjalan (Ledger Resmi)
              </p>
            </div>
          </div>

          {/* User Role Switcher & Profile */}
          <div className="flex items-center space-x-2 ml-auto">
            <div className="bg-[#1D100A] px-2.5 py-1 rounded-xl border border-[#4A3225] flex items-center space-x-2">
              <div className="text-right hidden lg:block">
                <div className="text-xs font-semibold text-[#F2E8DC]">{user.nama}</div>
                <div className="text-[10px] text-[#A89280]">{user.jabatan}</div>
              </div>
              
              {/* Role Selector */}
              <div className="flex items-center space-x-1 pl-0.5 lg:pl-1 lg:border-l border-[#3D281E]">
                <label htmlFor="role-select" className="sr-only">Pilih Peran Pengguna</label>
                <select
                  id="role-select"
                  aria-label="Pilih Peran Pengguna"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="bg-[#3D251A] text-xs font-semibold text-[#F7EFE6] px-2 py-1 rounded-lg border border-[#6E4733] focus:outline-none focus:ring-2 focus:ring-[#C07C4A] cursor-pointer"
                >
                  <option value="PEMILIK">👑 Pemilik</option>
                  <option value="VERIFIKATOR">🛡️ Verifikator</option>
                  <option value="OPERATOR">📋 Operator</option>
                </select>
              </div>

              {/* Role badge indicator */}
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase hidden md:inline-block ${
                currentRole === 'PEMILIK'
                  ? 'bg-amber-900/60 text-amber-200 border border-amber-600/50'
                  : currentRole === 'VERIFIKATOR'
                  ? 'bg-blue-900/60 text-blue-200 border border-blue-600/50'
                  : 'bg-stone-800 text-stone-300 border border-stone-600'
              }`}>
                {currentRole}
              </span>
            </div>

            {/* Quick Reset Data */}
            <button
              onClick={onResetData}
              title="Reset data demo ke awal"
              className="p-1.5 text-[#A89280] hover:text-[#F8F1E5] hover:bg-[#3D251A] rounded-lg transition-colors border border-transparent hover:border-[#523727]"
              aria-label="Reset Data Demo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-[#3D261C] pt-1">
          <button
            onClick={() => setCurrentTab('bookkeeping')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              currentTab === 'bookkeeping'
                ? 'bg-[#3D251A] text-[#FBF6EE] border-[#D4A373]'
                : 'text-[#BBA594] hover:text-[#F8F1E5] hover:bg-[#331E15] border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D4A373]" />
            <span>Pembukuan Stok Kopi</span>
            {currentRole === 'OPERATOR' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-mono">
                Terkunci
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('warehouse')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              currentTab === 'warehouse'
                ? 'bg-[#3D251A] text-[#FBF6EE] border-[#D4A373]'
                : 'text-[#BBA594] hover:text-[#F8F1E5] hover:bg-[#331E15] border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C99A75]" />
            <span>Ringkasan Stok Fisik</span>
          </button>

          <button
            onClick={() => setCurrentTab('mutations')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
              currentTab === 'mutations'
                ? 'bg-[#3D251A] text-[#FBF6EE] border-[#D4A373]'
                : 'text-[#BBA594] hover:text-[#F8F1E5] hover:bg-[#331E15] border-transparent'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-[#B87A4F]" />
            <span>Input & Verifikasi Mutasi</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
