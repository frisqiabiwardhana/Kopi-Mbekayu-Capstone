import React from 'react';
import { CoffeeType, InventoryTransaction } from '../types';
import { INITIAL_STOCK_DATA } from '../data/initialData';
import { formatKg } from '../utils/ledger';
import { Layers, MapPin, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Coffee } from 'lucide-react';

interface WarehouseOverviewProps {
  transactions: InventoryTransaction[];
  onOpenBookkeeping: (coffeeType: CoffeeType) => void;
}

export const WarehouseOverview: React.FC<WarehouseOverviewProps> = ({
  transactions,
  onOpenBookkeeping,
}) => {
  const verifiedTx = transactions.filter((tx) => tx.status === 'DIVERIFIKASI');

  // Calculate live physical stocks dynamically
  const calculateCurrentStock = (type: CoffeeType) => {
    const base = 1200; // base default
    const robustaBase = 1200;
    const arabicaBase = 850;
    const excelsaBase = 350;
    const initial = type === 'Robusta' ? robustaBase : type === 'Arabica' ? arabicaBase : excelsaBase;

    let stock = initial;
    verifiedTx.forEach((tx) => {
      if (tx.jenisKopi === type) {
        if (tx.tipe === 'MASUK') stock += tx.jumlahKg;
        else if (tx.tipe === 'KELUAR') stock -= tx.jumlahKg;
        else if (tx.tipe === 'RETUR') stock += tx.jumlahKg;
      }
    });
    return stock;
  };

  const coffeeList: CoffeeType[] = ['Robusta', 'Arabica', 'Excelsa'];
  const totalPhysicalStock = coffeeList.reduce((acc, type) => acc + calculateCurrentStock(type), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-[#FAF7F2] border border-[#E7DDD3] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#8C5835] mb-1">
              <Layers className="w-4 h-4" />
              <span>Gudang Penyimpanan Biji Kopi (Green Bean Storage)</span>
            </div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2A1810]">
              Ringkasan Stok Fisik Gudang
            </h1>
            <p className="text-xs sm:text-sm text-[#6E5A4D] mt-1">
              Monitoring ketersediaan green beans mentah siap roasting per varietas dan lokasi pallet.
            </p>
          </div>

          <div className="bg-white border border-[#D5C2B1] rounded-xl px-5 py-3 text-right">
            <span className="text-xs text-[#8C7565] uppercase font-bold block">Total Fisik Biji Terverifikasi</span>
            <span className="text-2xl font-extrabold text-[#2E1B11] font-mono">{formatKg(totalPhysicalStock)}</span>
          </div>
        </div>
      </div>

      {/* Cards per coffee type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coffeeList.map((type) => {
          const info = INITIAL_STOCK_DATA[type];
          const stock = calculateCurrentStock(type);
          const isLow = stock <= info.minimumThresholdKg;

          return (
            <div
              key={type}
              className="bg-white border border-[#E7DDD3] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#C4A48A] transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFE8DE] text-[#6E4B33] border border-[#D5C2B1]">
                      {info.species}
                    </span>
                    <h3 className="text-lg font-bold text-[#2A1810] font-serif-brand mt-1.5">
                      Biji Kopi {type}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E0D2C3] flex items-center justify-center text-[#7C4A27]">
                    <Coffee className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-[#7A6455] mb-4">
                  {info.origin} • {info.process}
                </p>

                {/* Stock Level */}
                <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E8DCD0] mb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-[#8C7565] uppercase font-bold block">Stok Aktif</span>
                      <span className="text-2xl font-extrabold font-mono text-[#2E1B11]">{formatKg(stock)}</span>
                    </div>
                    {isLow ? (
                      <span className="text-xs font-bold text-amber-700 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Di bawah ambang
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aman
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs */}
                <div className="text-xs space-y-2 text-[#5C4537] mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#8C7565]">Lokasi Rak/Pallet:</span>
                    <span className="font-semibold flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-[#8C5835]" /> {info.shelfLocation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7565]">Standar Mutu:</span>
                    <span className="font-semibold">{info.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7565]">Ambang Minimum:</span>
                    <span className="font-mono font-medium">{formatKg(info.minimumThresholdKg)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenBookkeeping(type)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE8DE] text-[#4A2D1D] font-bold text-xs border border-[#D5C2B1] transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Buka Kartu Stok {type}</span>
                <span>→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
