"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [pemasukan, setPemasukan] = useState("");
  const [ongkos, setOngkos] = useState("");
  const [extra, setExtra] = useState("");
  const [openDates, setOpenDates] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("keuangan-hamdan");
    if (saved) setData(JSON.parse(saved));
  }, []);

  // Format angka ke string dengan titik
  const formatRupiah = (val: string) => {
    const number = val.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleProcess = () => {
    const p = parseFloat(pemasukan.replace(/\./g, "")) || 0;
    const o = parseFloat(ongkos.replace(/\./g, "")) || 0;
    const e = parseFloat(extra.replace(/\./g, "")) || 0;
    const date = new Date().toLocaleDateString("id-ID");

    // Validasi 1 input per hari
    if (data.some(item => item.date === date)) {
      alert("Hari ini sudah ada input! Silakan edit data yang ada.");
      return;
    }

    const tabungan = p * 0.2;
    const service = p * 0.05;
    const danaDarurat = p * 0.02;
    const totalDisisihkan = tabungan + service + danaDarurat + e;
    const saldoAkhir = p - o - totalDisisihkan;

    const entry = { id: Date.now(), date, p, o, tabungan, service, danaDarurat, e, totalDisisihkan, saldoAkhir };
    const newData = [entry, ...data];
    setData(newData);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(newData));
    setPemasukan(""); setOngkos(""); setExtra(""); // Bersihkan input
  };

  const updateItem = (id: number, key: string, val: string) => {
    const numVal = parseFloat(val.replace(/\./g, "")) || 0;
    const updated = data.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [key]: numVal };
        // Hitung ulang otomatis
        newItem.tabungan = newItem.p * 0.2;
        newItem.service = newItem.p * 0.05;
        newItem.danaDarurat = newItem.p * 0.02;
        newItem.totalDisisihkan = newItem.tabungan + newItem.service + newItem.danaDarurat + newItem.e;
        newItem.saldoAkhir = newItem.p - newItem.o - newItem.totalDisisihkan;
        return newItem;
      }
      return item;
    });
    setData(updated);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(updated));
  };

  return (
    <main className="p-4 max-w-lg mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Manajer Keuangan For Hamdan</h1>
      <div className="space-y-2 mb-6">
        <input className="border p-2 w-full rounded" placeholder="Pemasukan..." value={pemasukan} onChange={(e) => setPemasukan(formatRupiah(e.target.value))} />
        <input className="border p-2 w-full rounded" placeholder="Ongkos Keluar..." value={ongkos} onChange={(e) => setOngkos(formatRupiah(e.target.value))} />
        <input className="border p-2 w-full rounded" placeholder="Tabungan Tambahan..." value={extra} onChange={(e) => setExtra(formatRupiah(e.target.value))} />
        <button className="w-full bg-green-600 text-white p-2 rounded font-bold" onClick={handleProcess}>Proses Hari Ini</button>
      </div>

      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.id} className="border rounded bg-white p-4">
            <p className="font-bold border-b pb-2 mb-2">{item.date}</p>
            <div className="space-y-2 text-sm">
              {['p', 'o', 'e'].map(k => (
                <div key={k} className="flex justify-between items-center">
                  <span>{k === 'p' ? 'Pemasukan' : k === 'o' ? 'Ongkos' : 'Tabungan Tambahan'}:</span>
                  <input className="border w-28 text-right px-1" defaultValue={item[k].toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, k, e.target.value)} />
                </div>
              ))}
              <hr />
              <div className="flex justify-between"><span>Tabungan (20%):</span> <b>{item.tabungan.toLocaleString()}</b></div>
              <div className="flex justify-between"><span>Service (5%):</span> <b>{item.service.toLocaleString()}</b></div>
              <div className="flex justify-between"><span>Dana Darurat (2%):</span> <b>{item.danaDarurat.toLocaleString()}</b></div>
              <div className="flex justify-between text-blue-700 font-bold"><span>Total Disisihkan:</span> <b>{item.totalDisisihkan.toLocaleString()}</b></div>
              <div className="flex justify-between text-green-700 font-bold"><span>Saldo Akhir:</span> <b>{item.saldoAkhir.toLocaleString()}</b></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}