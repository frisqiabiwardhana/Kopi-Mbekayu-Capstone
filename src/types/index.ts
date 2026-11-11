export type CoffeeType = 'Robusta' | 'Arabica' | 'Excelsa';

export type CoffeeFilter = 'ALL' | CoffeeType;

export type TransactionType = 'MASUK' | 'KELUAR' | 'RETUR';

export type TransactionStatus = 'DIVERIFIKASI' | 'MENUNGGU_VERIFIKASI' | 'DITOLAK';

export type UserRole = 'PEMILIK' | 'VERIFIKATOR' | 'OPERATOR';

export interface InventoryTransaction {
  id: string;
  kodeReferensi: string; // e.g. TR-202610-001
  tanggal: string; // ISO YYYY-MM-DD
  waktu?: string; // HH:mm
  jenisKopi: CoffeeType;
  tipe: TransactionType;
  jumlahKg: number;
  keterangan: string;
  status: TransactionStatus;
  petugasInput: string;
  diverifikasiOleh?: string;
  tanggalVerifikasi?: string;
  asalGudangAtauSupplier?: string;
  catatanPenolakan?: string;
}

export interface LedgerRow {
  no: number;
  id: string;
  kodeReferensi: string;
  tanggal: string;
  waktu?: string;
  jenisKopi: CoffeeType;
  keterangan: string;
  masukKg: number;
  keluarKg: number;
  returKg: number;
  saldoKg: number;
  tipe: TransactionType;
  petugas: string;
}

export interface LedgerCalculationResult {
  coffeeFilter: CoffeeFilter;
  startDate: string;
  endDate: string;
  openingBalanceKg: number;
  rows: LedgerRow[];
  totalMasukKg: number;
  totalKeluarKg: number;
  totalReturKg: number;
  closingBalanceKg: number;
  materialBreakdown?: Record<CoffeeType, {
    opening: number;
    masuk: number;
    keluar: number;
    retur: number;
    closing: number;
  }>;
}

export interface UserProfile {
  id: string;
  nama: string;
  role: UserRole;
  jabatan: string;
  avatar: string;
}
