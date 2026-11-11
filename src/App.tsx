/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InventoryTransaction, UserRole } from './types';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { BookkeepingPage } from './components/BookkeepingPage';
import { WarehouseOverview } from './components/WarehouseOverview';
import { TransactionManager } from './components/TransactionManager';
import { AccessDenied } from './components/AccessDenied';

const STORAGE_KEY = 'kopi_mbekayu_transactions_v2';
const ROLE_STORAGE_KEY = 'kopi_mbekayu_role_v2';

export default function App() {
  // Current tab state
  const [currentTab, setCurrentTab] = useState<'bookkeeping' | 'warehouse' | 'mutations'>('bookkeeping');

  // Role state: defaults to PEMILIK (Owner) for immediate review of full capabilities
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY);
      if (saved === 'PEMILIK' || saved === 'VERIFIKATOR' || saved === 'OPERATOR') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'PEMILIK';
  });

  // Transactions state
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  // Sync role to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    } catch {
      // ignore
    }
  }, [currentRole]);

  // Sync transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  // Count pending transactions for navbar badge
  const pendingCount = transactions.filter(
    (tx) => tx.status === 'MENUNGGU_VERIFIKASI'
  ).length;

  // Add new transaction
  const handleAddTransaction = (newTx: InventoryTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Approve pending transaction
  const handleApproveTransaction = (id: string, verifierName: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          return {
            ...tx,
            status: 'DIVERIFIKASI',
            diverifikasiOleh: verifierName,
            tanggalVerifikasi: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
          };
        }
        return tx;
      })
    );
  };

  // Reject pending transaction
  const handleRejectTransaction = (id: string, reason: string, verifierName: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          return {
            ...tx,
            status: 'DITOLAK',
            catatanPenolakan: reason,
            diverifikasiOleh: verifierName,
            tanggalVerifikasi: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
          };
        }
        return tx;
      })
    );
  };

  // Reset to initial baseline dataset
  const handleResetData = () => {
    if (window.confirm('Kembalikan seluruh data transaksi ke setelan awal default Kopi Mbekayu?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#2D231C] flex flex-col font-sans selection:bg-[#D4A373]/30 selection:text-[#2A1810]">
      {/* Navbar & Role Controller */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        pendingCount={pendingCount}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'bookkeeping' && (
          currentRole === 'OPERATOR' ? (
            <AccessDenied
              currentRole={currentRole}
              onSwitchToMutations={() => setCurrentTab('mutations')}
              onSwitchRole={(role) => setCurrentRole(role)}
            />
          ) : (
            <BookkeepingPage
              transactions={transactions}
              currentRole={currentRole}
              onNavigateToMutations={() => setCurrentTab('mutations')}
            />
          )
        )}

        {currentTab === 'warehouse' && (
          <WarehouseOverview
            transactions={transactions}
            onOpenBookkeeping={(coffeeType) => {
              setCurrentTab('bookkeeping');
            }}
          />
        )}

        {currentTab === 'mutations' && (
          <TransactionManager
            transactions={transactions}
            currentRole={currentRole}
            onAddTransaction={handleAddTransaction}
            onApproveTransaction={handleApproveTransaction}
            onRejectTransaction={handleRejectTransaction}
            onNavigateToBookkeeping={() => setCurrentTab('bookkeeping')}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="no-print bg-[#2A1810] text-[#BBA594] border-t border-[#3D261C] py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-serif-brand font-bold text-[#FAF6EE] text-sm">
              KOPI MBEKAYU
            </span>
            <span>•</span>
            <span>Sistem Kartu Saldo Berjalan (Ledger) & Pembukuan Stok Otomatis</span>
          </div>
          <div className="text-[11px] text-[#A89280]">
            SOP Inventaris Gudang Terintegrasi • Versi Produksi Capstone Citta
          </div>
        </div>
      </footer>
    </div>
  );
}
