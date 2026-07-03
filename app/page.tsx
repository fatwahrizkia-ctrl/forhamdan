"use client";
import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  date: string;
  label: string;
  amount: number;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pemasukan, setPemasukan] = useState("");
  const [ongkos, setOngkos] = useState("");
  const [extraTabungan, setExtraTabungan] = useState("");

  const targetBulanan = 3000000;

  useEffect(() => {
    const saved = localStorage.getItem("data-driver");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("data-driver", JSON.stringify(transactions));
  }, [transactions]);

  const handleProcess = () => {
    const p = parseFloat(pemasukan);
    const o = parseFloat(ongkos);
    if (isNaN(p)) return;
    
    const bersih = p - (isNaN(o) ? 0 : o);
    const date = new Date().toLocaleDateString("id-ID");

    const newEntries = [
      { id: Date.now(), date, label: "Pemasukan Bersih", amount: bersih },
      { id: Date.now() + 1, date, label: "Service (5%)", amount: bersih * 0.05 },
      { id: Date.now() + 2, date, label: "Tabungan (20%)", amount: bersih * 0.2 },
      ...(parseFloat(extraTabungan) > 0 ? [{ id: Date.now() + 3, date, label: "Tabungan Tambahan", amount: parseFloat(extraTabungan) }] : [])
    ];

    setTransactions([...newEntries, ...transactions]);
    setPemasukan(""); setOngkos(""); setExtraTabungan("");
  };

  const totalTabungan = transactions
    .filter(t => t.label.includes("Tabungan"))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <main className="p-4 max-w-lg mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Manajer Keuangan Driver</h1>
      
      {/* Panel Target */}
      <div className="bg-blue-600 text-white p-4 rounded-lg mb-4">
        <p className="text-sm">Sisa Target Tabungan Bulan Ini:</p>
        <h2 className="text-2xl font-bold">Rp {(targetBulanan - totalTabungan).toLocaleString()}</h2>
      </div>

      <div className="space-y-2 mb-6">
        <input className="border p-2 w-full rounded" placeholder="Pemasukan..." value={pemasukan} onChange={(e) => setPemasukan(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Ongkos Keluar..." value={ongkos} onChange={(e) => setOngkos(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Tabungan Tambahan (Opsional)..." value={extraTabungan} onChange={(e) => setExtraTabungan(e.target.value)} />
        <button className="w-full bg-green-600 text-white p-2 rounded font-bold" onClick={handleProcess}>Proses Hari Ini</button>
      </div>

      <div className="space-y-2">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white p-3 rounded border flex justify-between text-sm">
            <div><p className="text-gray-500 text-[10px]">{t.date}</p><p>{t.label}</p></div>
            <span className="font-bold">Rp {t.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </main>
  );
}