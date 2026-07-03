"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [pemasukan, setPemasukan] = useState("");
  const [ongkos, setOngkos] = useState("");
  const [extra, setExtra] = useState("");
  const [openDates, setOpenDates] = useState<string[]>([]);

  const targetTabungan = 3000000;
  const targetService = 300000;

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
      alert("Hari ini sudah ada input!");
      return;
    }

    let currentTotalService = data.reduce((sum, item) => sum + item.service, 0);
    const service = currentTotalService >= targetService ? 0 : p * 0.05;
    
    const entry = { 
      id: Date.now(), date, p, o, e, 
      saldoKotor: p - o,
      tabungan: p * 0.2,
      service,
      danaDarurat: p * 0.02,
      totalDisisihkan: (p * 0.2) + service + (p * 0.02) + e,
      saldoBersih: (p - o) - ((p * 0.2) + service + (p * 0.02) + e)
    };
    
    const newData = [entry, ...data];
    setData(newData);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(newData));
    setPemasukan(""); setOngkos(""); setExtra("");
  };

  const updateItem = (id: number, key: string, val: string) => {
    const numVal = parseFloat(val.replace(/\./g, "")) || 0;
    let updatedData = data.map(item => (item.id === id ? { ...item, [key]: numVal } : item));
    
    let totalServiceAccumulated = 0;
    updatedData = updatedData.sort((a, b) => a.id - b.id).map((item) => {
      const p = item.p || 0;
      const o = item.o || 0;
      const e = item.e || 0;
      const service = totalServiceAccumulated >= targetService ? 0 : p * 0.05;
      totalServiceAccumulated += service;
      return { 
        ...item, 
        saldoKotor: p - o,
        tabungan: p * 0.2,
        service,
        danaDarurat: p * 0.02,
        totalDisisihkan: (p * 0.2) + service + (p * 0.02) + e,
        saldoBersih: (p - o) - ((p * 0.2) + service + (p * 0.02) + e)
      };
    });

    const finalData = updatedData.sort((a, b) => b.id - a.id);
    setData(finalData);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(finalData));
  };

  const deleteDate = (date: string) => {
    if (confirm(`Hapus semua data untuk tanggal ${date}?`)) {
      const filtered = data.filter(item => item.date !== date);
      setData(filtered);
      localStorage.setItem("keuangan-hamdan", JSON.stringify(filtered));
    }
  };

  const totalTabunganTerkumpul = data.reduce((sum, item) => sum + item.tabungan + item.e, 0);
  const totalServiceTerkumpul = data.reduce((sum, item) => sum + item.service, 0);
  const sisaTargetTabungan = Math.max(0, targetTabungan - totalTabunganTerkumpul);
  const sisaTargetService = Math.max(0, targetService - totalServiceTerkumpul);

  const toggleDate = (date: string) => {
    setOpenDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const grouped = data.reduce((acc: any, curr) => {
    (acc[curr.date] = acc[curr.date] || []).push(curr);
    return acc;
  }, {});

  return (
    <main className="p-4 max-w-lg mx-auto bg-gray-50 min-h-screen text-black">
      <h1 className="text-xl font-bold mb-4">Manajer Keuangan For Hamdan</h1>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-blue-600 text-white p-3 rounded-lg text-center shadow-md">
            <p className="text-[10px] uppercase font-bold">Target Tabungan</p>
            <h2 className="text-lg font-bold">Rp {sisaTargetTabungan.toLocaleString('id-ID')}</h2>
        </div>
        <div className="bg-orange-600 text-white p-3 rounded-lg text-center shadow-md">
            <p className="text-[10px] uppercase font-bold">Target Service</p>
            <h2 className="text-lg font-bold">Rp {sisaTargetService.toLocaleString('id-ID')}</h2>
        </div>
      </div>

      <div className="space-y-2 mb-6 bg-white p-4 rounded shadow border">
        <input className="border p-2 w-full rounded" placeholder="Pemasukan..." value={pemasukan} onChange={(e) => setPemasukan(formatRupiah(e.target.value))} />
        <input className="border p-2 w-full rounded" placeholder="Ongkos Keluar..." value={ongkos} onChange={(e) => setOngkos(formatRupiah(e.target.value))} />
        <input className="border p-2 w-full rounded" placeholder="Tabungan Tambahan..." value={extra} onChange={(e) => setExtra(formatRupiah(e.target.value))} />
        <button className="w-full bg-green-600 text-white p-2 rounded font-bold" onClick={handleProcess}>Proses Hari Ini</button>
      </div>

      <div className="space-y-2">
        {Object.keys(grouped).map(date => (
          <div key={date} className="border rounded bg-white shadow-sm">
            <button className="w-full p-3 text-left font-bold bg-gray-200 flex justify-between" onClick={() => toggleDate(date)}>
              {date} <span>{openDates.includes(date) ? '▼' : '▶'}</span>
            </button>
            {openDates.includes(date) && (
              <div className="p-4 border-t space-y-2 text-sm">
                {grouped[date].map((item: any) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between"><span>Pemasukan:</span> <input className="border w-28 text-right px-1" defaultValue={item.p.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'p', e.target.value)} /></div>
                    <div className="flex justify-between"><span>Ongkos:</span> <input className="border w-28 text-right px-1" defaultValue={item.o.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'o', e.target.value)} /></div>
                    <div className="flex justify-between"><span>Tab. Tambahan:</span> <input className="border w-28 text-right px-1" defaultValue={item.e.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'e', e.target.value)} /></div>
                    <hr/>
                    <div className="flex justify-between"><span>Saldo Kotor:</span> <b>Rp {item.saldoKotor.toLocaleString()}</b></div>
                    <div className="flex justify-between"><span>Tabungan (20%):</span> <b>Rp {item.tabungan.toLocaleString()}</b></div>
                    <div className="flex justify-between"><span>Service (5%):</span> <b>Rp {item.service.toLocaleString()}</b></div>
                    <div className="flex justify-between"><span>Dana Darurat (2%):</span> <b>Rp {item.danaDarurat.toLocaleString()}</b></div>
                    {/* Disini baris yang kamu mau balik lagi */}
                    <div className="flex justify-between text-blue-700 font-bold"><span>Total Disisihkan:</span> <b>Rp {item.totalDisisihkan.toLocaleString()}</b></div>
                    {/* Saldo Bersih diperbesar */}
                    <div className="flex justify-between text-green-700 font-bold text-lg mt-2">
                        <span>Total Bersih:</span> <b>Rp {item.saldoBersih.toLocaleString()}</b>
                    </div>
                    <button className="w-full mt-4 bg-red-500 text-white p-2 rounded text-xs font-bold" onClick={() => deleteDate(date)}>HAPUS HARI INI</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}