import {
  CoffeeFilter,
  CoffeeType,
  InventoryTransaction,
  LedgerCalculationResult,
  LedgerRow,
} from '../types';

/**
 * Baseline initial stock prior to historical transaction logging (in kg).
 * Set as foundational warehouse stock baseline for Kopi Mbekayu roastery.
 */
export const DEFAULT_INITIAL_STOCK: Record<CoffeeType, number> = {
  Robusta: 1200, // 1,200 kg Robusta Dampit & Temanggung
  Arabica: 850,  // 850 kg Arabica Kintamani & Gayo
  Excelsa: 350,  // 350 kg Excelsa Wonosobo
};

export const COFFEE_LABELS: Record<CoffeeFilter, string> = {
  ALL: 'Semua Jenis Kopi (Akumulasi)',
  Robusta: 'Biji Kopi Robusta',
  Arabica: 'Biji Kopi Arabica',
  Excelsa: 'Biji Kopi Excelsa',
};

/**
 * Format kilograms with Indonesian number formatting.
 * Rounds cleanly and avoids floating point artifacts.
 */
export function formatKg(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 kg';
  const rounded = Math.round(amount * 100) / 100;
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded)} kg`;
}

export function formatNumberId(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  const rounded = Math.round(amount * 100) / 100;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function formatDateId(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const monthIdx = parseInt(month, 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${parseInt(day, 10)} ${monthNames[monthIdx]} ${year}`;
    }
  }
  return dateStr;
}

/**
 * Decoupled calculation of stock ledger (Kartu Saldo Berjalan).
 * Only VERIFIED transactions affect balances.
 * Correctly accounts for Opening Balance prior to startDate.
 */
export function calculateLedger(
  transactions: InventoryTransaction[],
  coffeeFilter: CoffeeFilter,
  startDate: string,
  endDate: string,
  initialStock: Record<CoffeeType, number> = DEFAULT_INITIAL_STOCK
): LedgerCalculationResult {
  // 1. Only verified transactions can affect official inventory balances
  const verifiedTx = transactions.filter((tx) => tx.status === 'DIVERIFIKASI');

  // 2. Sort chronologically ascending
  const sortedTx = [...verifiedTx].sort((a, b) => {
    if (a.tanggal !== b.tanggal) {
      return a.tanggal.localeCompare(b.tanggal);
    }
    const timeA = a.waktu || '00:00';
    const timeB = b.waktu || '00:00';
    if (timeA !== timeB) {
      return timeA.localeCompare(timeB);
    }
    return a.kodeReferensi.localeCompare(b.kodeReferensi);
  });

  // 3. Compute baseline opening stock before transactions
  const activeCoffeeTypes: CoffeeType[] =
    coffeeFilter === 'ALL'
      ? ['Robusta', 'Arabica', 'Excelsa']
      : [coffeeFilter];

  let openingBalanceKg = activeCoffeeTypes.reduce(
    (sum, type) => sum + (initialStock[type] || 0),
    0
  );

  // 4. Adjust opening balance for transactions strictly before startDate
  for (const tx of sortedTx) {
    if (tx.tanggal < startDate) {
      if (coffeeFilter === 'ALL' || tx.jenisKopi === coffeeFilter) {
        if (tx.tipe === 'MASUK') {
          openingBalanceKg += tx.jumlahKg;
        } else if (tx.tipe === 'KELUAR') {
          openingBalanceKg -= tx.jumlahKg;
        } else if (tx.tipe === 'RETUR') {
          openingBalanceKg += tx.jumlahKg;
        }
      }
    }
  }

  // 5. Filter transactions within the selected date range and coffee filter
  const inRangeTx = sortedTx.filter((tx) => {
    const inDateRange = tx.tanggal >= startDate && tx.tanggal <= endDate;
    const matchesCoffee =
      coffeeFilter === 'ALL' || tx.jenisKopi === coffeeFilter;
    return inDateRange && matchesCoffee;
  });

  // 6. Build chronological ledger rows with running balances
  let runningBalance = openingBalanceKg;
  let totalMasukKg = 0;
  let totalKeluarKg = 0;
  let totalReturKg = 0;

  const rows: LedgerRow[] = inRangeTx.map((tx, index) => {
    let masuk = 0;
    let keluar = 0;
    let retur = 0;

    if (tx.tipe === 'MASUK') {
      masuk = tx.jumlahKg;
      runningBalance += masuk;
      totalMasukKg += masuk;
    } else if (tx.tipe === 'KELUAR') {
      keluar = tx.jumlahKg;
      runningBalance -= keluar;
      totalKeluarKg += keluar;
    } else if (tx.tipe === 'RETUR') {
      retur = tx.jumlahKg;
      runningBalance += retur;
      totalReturKg += retur;
    }

    return {
      no: index + 1,
      id: tx.id,
      kodeReferensi: tx.kodeReferensi,
      tanggal: tx.tanggal,
      waktu: tx.waktu,
      jenisKopi: tx.jenisKopi,
      keterangan: tx.keterangan,
      masukKg: masuk,
      keluarKg: keluar,
      returKg: retur,
      saldoKg: Math.round(runningBalance * 100) / 100,
      tipe: tx.tipe,
      petugas: tx.petugasInput,
    };
  });

  // 7. Calculate closing balance according to formula:
  // Closing Balance = Opening Balance + Verified Incoming - Verified Outgoing + Approved Return Stock Adjustments
  const closingBalanceKg =
    Math.round(
      (openingBalanceKg + totalMasukKg - totalKeluarKg + totalReturKg) * 100
    ) / 100;

  // Material breakdown for ALL filter insight
  const materialBreakdown: Record<CoffeeType, {
    opening: number;
    masuk: number;
    keluar: number;
    retur: number;
    closing: number;
  }> = {
    Robusta: { opening: 0, masuk: 0, keluar: 0, retur: 0, closing: 0 },
    Arabica: { opening: 0, masuk: 0, keluar: 0, retur: 0, closing: 0 },
    Excelsa: { opening: 0, masuk: 0, keluar: 0, retur: 0, closing: 0 },
  };

  const types: CoffeeType[] = ['Robusta', 'Arabica', 'Excelsa'];
  types.forEach((type) => {
    let typeOpening = initialStock[type] || 0;
    for (const tx of sortedTx) {
      if (tx.jenisKopi === type && tx.tanggal < startDate) {
        if (tx.tipe === 'MASUK') typeOpening += tx.jumlahKg;
        else if (tx.tipe === 'KELUAR') typeOpening -= tx.jumlahKg;
        else if (tx.tipe === 'RETUR') typeOpening += tx.jumlahKg;
      }
    }
    let typeMasuk = 0;
    let typeKeluar = 0;
    let typeRetur = 0;
    for (const tx of inRangeTx) {
      if (tx.jenisKopi === type) {
        if (tx.tipe === 'MASUK') typeMasuk += tx.jumlahKg;
        else if (tx.tipe === 'KELUAR') typeKeluar += tx.jumlahKg;
        else if (tx.tipe === 'RETUR') typeRetur += tx.jumlahKg;
      }
    }
    materialBreakdown[type] = {
      opening: Math.round(typeOpening * 100) / 100,
      masuk: Math.round(typeMasuk * 100) / 100,
      keluar: Math.round(typeKeluar * 100) / 100,
      retur: Math.round(typeRetur * 100) / 100,
      closing: Math.round((typeOpening + typeMasuk - typeKeluar + typeRetur) * 100) / 100,
    };
  });

  return {
    coffeeFilter,
    startDate,
    endDate,
    openingBalanceKg: Math.round(openingBalanceKg * 100) / 100,
    rows,
    totalMasukKg: Math.round(totalMasukKg * 100) / 100,
    totalKeluarKg: Math.round(totalKeluarKg * 100) / 100,
    totalReturKg: Math.round(totalReturKg * 100) / 100,
    closingBalanceKg,
    materialBreakdown,
  };
}

/**
 * Generate CSV string matching exact export specifications.
 * Filename format: Laporan_Stok_Kopi_Mbekayu_YYYY-MM-DD.csv
 */
export function generateLedgerCsv(
  result: LedgerCalculationResult,
  generatedDateStr: string = new Date().toISOString().split('T')[0]
): string {
  const lines: string[] = [];

  // Metadata headers
  lines.push('KOPI MBEKAYU - LAPORAN PEMBUKUAN STOK KOPI');
  lines.push('Kartu Saldo Berjalan (Ledger)');
  lines.push(`Filter Jenis Kopi,"${COFFEE_LABELS[result.coffeeFilter]}"`);
  lines.push(`Periode,"${result.startDate} s/d ${result.endDate}"`);
  lines.push(`Tanggal Export,"${generatedDateStr}"`);
  lines.push(`Saldo Awal (kg),"${result.openingBalanceKg}"`);
  lines.push('');

  // Column headers
  lines.push(
    'No,Tanggal,Waktu,Kode Referensi,Jenis Kopi,Keterangan Transaksi,Masuk (kg),Keluar (kg),Retur (kg),Saldo (kg),Petugas'
  );

  // Opening balance row in ledger
  lines.push(
    `0,${result.startDate},00:00,-,"${COFFEE_LABELS[result.coffeeFilter]}","SALDO AWAL PERIODE",0,0,0,${result.openingBalanceKg},System`
  );

  // Transaction rows
  result.rows.forEach((row) => {
    const escapedDesc = `"${row.keterangan.replace(/"/g, '""')}"`;
    lines.push(
      [
        row.no,
        row.tanggal,
        row.waktu || '00:00',
        row.kodeReferensi,
        `"Biji Kopi ${row.jenisKopi}"`,
        escapedDesc,
        row.masukKg,
        row.keluarKg,
        row.returKg,
        row.saldoKg,
        `"${row.petugas}"`,
      ].join(',')
    );
  });

  // Totals & Closing row
  lines.push('');
  lines.push(
    `TOTAL DIVERIFIKASI,,,,,"Akumulasi Mutasi Periode",${result.totalMasukKg},${result.totalKeluarKg},${result.totalReturKg},${result.closingBalanceKg},`
  );
  lines.push(`SALDO AKHIR (kg),,,,,,"${result.closingBalanceKg}",,,,`);

  return lines.join('\r\n');
}

/**
 * Trigger download of CSV file in browser
 */
export function downloadCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
