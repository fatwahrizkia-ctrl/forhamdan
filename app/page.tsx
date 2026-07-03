"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [pemasukan, setPemasukan] = useState("");
  const [ongkos, setOngkos] = useState("");
  const [extraTabungan, setExtraTabungan] = useState("");
  const [openDates, setOpenDates] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("keuangan-hamdan");
    if (saved) setData(JSON.parse(saved));
  }, []);

  const handleProcess = () => {
    const p = parseFloat(pemasukan) || 0;
    const o = parseFloat(ongkos) || 0;
    const tabExtra = parseFloat(extraTabungan) || 0;
    const date = new Date().toLocaleDateString("id-ID");

    const tabungan = p * 0.2;
    const service = p * 0.05;
    const danaDarurat = p * 0.02;
    const totalDisisihkan = tabungan + service + danaDarurat + tabExtra;
    const saldoAkhir = p - o - totalDisisihkan;

    const entry = { id: Date.now(), date, p, o, tabungan, service, danaDarurat, tabExtra, totalDisisihkan, saldoAkhir };
    const newData = [entry, ...data];
    setData(newData);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(newData));
  };

  const toggleDate = (date: string) => {
    setOpenDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const grouped = data.reduce((acc, curr) => {
    (acc[curr.date] = acc[curr.date] || []).push(curr);
    return acc;
  }, {});

  return (
    <main className="p-4 max-w-lg mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Manajer Keuangan For Hamdan</h1>
      <div className="space-y-2 mb-6">
        <input className="border p-2 w-full rounded" placeholder="Pemasukan..." value={pemasukan} onChange={(e) => setPemasukan(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Ongkos Keluar..." value={ongkos} onChange={(e) => setOngkos(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Tabungan Tambahan (Opsional)..." value={extraTabungan} onChange={(e) => setExtraTabungan(e.target.value)} />
        <button className="w-full bg-green-600 text-white p-2 rounded font-bold" onClick={handleProcess}>Proses Hari Ini</button>
      </div>

      <div className="space-y-2">
        {Object.keys(grouped).map(date => (
          <div key={date} className="border rounded bg-white">
            <button className="w-full p-3 text-left font-bold bg-gray-100" onClick={() => toggleDate(date)}>{date} {openDates.includes(date) ? '▼' : '▶'}</button>
            {openDates.includes(date) && grouped[date].map((item: any) => (
              <div key={item.id} className="p-3 border-t text-sm space-y-1">
                <div className="flex justify-between"><span>Pemasukan:</span> <b>Rp {item.p.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>Tabungan (20%):</span> <b>Rp {item.tabungan.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>Service (5%):</span> <b>Rp {item.service.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>Dana Darurat (2%):</span> <b>Rp {item.danaDarurat.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>Tabungan Opsional:</span> <b>{item.tabExtra > 0 ? `Rp ${item.tabExtra.toLocaleString()}` : "-"}</b></div>
                <hr />
                <div className="flex justify-between text-blue-700 font-bold"><span>Total Disisihkan:</span> <b>Rp {item.totalDisisihkan.toLocaleString()}</b></div>
                <div className="flex justify-between text-green-700 font-bold"><span>Saldo Akhir:</span> <b>Rp {item.saldoAkhir.toLocaleString()}</b></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}