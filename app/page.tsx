"use client";
import { useState, useEffect } from "react";

// Struktur data (Interface)
interface Transaction {
  id: number;
  label: string;
  amount: number;
  category: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inputAmount, setInputAmount] = useState("");

  // Mengambil data dari memori browser (LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem("my-keuangan");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  // Menyimpan data ke memori browser setiap ada perubahan
  useEffect(() => {
    localStorage.setItem("my-keuangan", JSON.stringify(transactions));
  }, [transactions]);

  const handleProcess = () => {
    const total = parseFloat(inputAmount);
    if (isNaN(total) || total <= 0) return;

    const newEntries = [
      { id: Date.now(), label: "Pemasukan Utama", amount: total, category: "Pemasukan" },
      { id: Date.now() + 1, label: "Service Motor (10%)", amount: total * 0.1, category: "Service" },
      { id: Date.now() + 2, label: "Ongkos (15%)", amount: total * 0.15, category: "Ongkos" },
      { id: Date.now() + 3, label: "Tabungan (20%)", amount: total * 0.2, category: "Tabungan" },
    ];

    setTransactions([...newEntries, ...transactions]);
    setInputAmount("");
  };

  return (
    <main className="p-6 max-w-lg mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Manajer Keuangan</h1>
      <div className="flex gap-2 mb-6">
        <input 
          className="border p-2 rounded w-full"
          placeholder="Input nominal pemasukan..."
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleProcess}>Proses</button>
      </div>
      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded shadow flex justify-between">
            <span>{t.label}</span>
            <span className="font-bold">Rp {t.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </main>
  );
}