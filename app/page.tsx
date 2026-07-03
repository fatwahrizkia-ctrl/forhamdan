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

  const formatRupiah = (val: string) => {
    const number = val.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleProcess = () => {
    const p = parseFloat(pemasukan.replace(/\./g, "")) || 0;
    const o = parseFloat(ongkos.replace(/\./g, "")) || 0;
    const e = parseFloat(extra.replace(/\./g, "")) || 0;
    const date = new Date().toLocaleDateString("id-ID");

    if (data.some(item => item.date === date)) {
      alert("Hari ini sudah ada input! Silakan edit di daftar bawah.");
      return;
    }

    const saldoKotor = p - o;
    const tabungan = p * 0.2;
    const service = p * 0.05;
    const danaDarurat = p * 0.02;
    const totalDisisihkan = tabungan + service + danaDarurat + e;
    const saldoBersih = saldoKotor - totalDisisihkan;

    const entry = { id: Date.now(), date, p, o, e, saldoKotor, tabungan, service, danaDarurat, totalDisisihkan, saldoBersih };
    const newData = [entry, ...data];
    setData(newData);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(newData));
    setPemasukan(""); setOngkos(""); setExtra("");
  };

  const updateItem = (id: number, key: string, val: string) => {
    const numVal = parseFloat(val.replace(/\./g, "")) || 0;
    const updated = data.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [key]: numVal };
        newItem.saldoKotor = newItem.p - newItem.o;
        newItem.tabungan = newItem.p * 0.2;
        newItem.service = newItem.p * 0.05;
        newItem.danaDarurat = newItem.p * 0.02;
        newItem.totalDisisihkan = newItem.tabungan + newItem.service + newItem.danaDarurat + newItem.e;
        newItem.saldoBersih = newItem.saldoKotor - newItem.totalDisisihkan;
        return newItem;
      }
      return item;
    });
    setData(updated);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(updated));
  };

  const toggleDate = (date: string) => {
    setOpenDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const grouped = data.reduce((acc: any, curr) => {
    (acc[curr.date] = acc[curr.date] || []).push(curr);
    return acc;
  }, {});

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
        {Object.keys(grouped).map(date => (
          <div key={date} className="border rounded bg-white">
            <button className="w-full p-3 text-left font-bold bg-gray-100 flex justify-between" onClick={() => toggleDate(date)}>
              {date} <span>{openDates.includes(date) ? '▼' : '▶'}</span>
            </button>
            {openDates.includes(date) && grouped[date].map((item: any) => (
              <div key={item.id} className="p-4 border-t space-y-2 text-sm">
                <div className="flex justify-between"><span>Pemasukan:</span> <input className="border w-28 text-right px-1" defaultValue={item.p.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'p', e.target.value)} /></div>
                <div className="flex justify-between"><span>Ongkos:</span> <input className="border w-28 text-right px-1" defaultValue={item.o.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'o', e.target.value)} /></div>
                <div className="flex justify-between"><span>Saldo Kotor:</span> <b>Rp {item.saldoKotor.toLocaleString()}</b></div>
                <hr/>
                <div className="flex justify-between"><span>Tabungan (20%):</span> <b>Rp {item.tabungan.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>Service (5%):</span> <b>Rp {item.service.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>Dana Darurat (2%):</span> <b>Rp {item.danaDarurat.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>Tabungan Tambahan:</span> <input className="border w-28 text-right px-1" defaultValue={item.e.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'e', e.target.value)} /></div>
                <div className="flex justify-between text-blue-700 font-bold"><span>Total Disisihkan:</span> <b>Rp {item.totalDisisihkan.toLocaleString()}</b></div>
                <div className="flex justify-between text-green-700 font-bold"><span>Saldo Bersih:</span> <b>Rp {item.saldoBersih.toLocaleString()}</b></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}