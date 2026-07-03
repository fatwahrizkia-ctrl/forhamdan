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
      alert("Hari ini sudah ada input! Silakan edit di daftar bawah.");
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
    <main style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1rem', color: '#000000' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000000' }}>Manajer Keuangan For Hamdan</h1>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-blue-600 text-white p-3 rounded-lg text-center shadow">
            <p className="text-[10px] uppercase font-bold">Target Tabungan</p>
            <h2 className="text-lg font-bold">Rp {sisaTargetTabungan.toLocaleString('id-ID')}</h2>
        </div>
        <div className="bg-orange-600 text-white p-3 rounded-lg text-center shadow">
            <p className="text-[10px] uppercase font-bold">Target Service</p>
            <h2 className="text-lg font-bold">Rp {sisaTargetService.toLocaleString('id-ID')}</h2>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #9ca3af', marginBottom: '1.5rem' }}>
        <input style={{ border: '1px solid #9ca3af', padding: '0.5rem', width: '100%', borderRadius: '0.25rem', marginBottom: '0.5rem', color: '#000000' }} placeholder="Pemasukan..." value={pemasukan} onChange={(e) => setPemasukan(formatRupiah(e.target.value))} />
        <input style={{ border: '1px solid #9ca3af', padding: '0.5rem', width: '100%', borderRadius: '0.25rem', marginBottom: '0.5rem', color: '#000000' }} placeholder="Ongkos Keluar..." value={ongkos} onChange={(e) => setOngkos(formatRupiah(e.target.value))} />
        <input style={{ border: '1px solid #9ca3af', padding: '0.5rem', width: '100%', borderRadius: '0.25rem', marginBottom: '0.5rem', color: '#000000' }} placeholder="Tabungan Tambahan..." value={extra} onChange={(e) => setExtra(formatRupiah(e.target.value))} />
        <button style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', padding: '0.5rem', borderRadius: '0.25rem', fontWeight: 'bold' }} onClick={handleProcess}>Proses Hari Ini</button>
      </div>

      <div className="space-y-2">
        {Object.keys(grouped).map(date => (
          <div key={date} style={{ border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '0.5rem' }}>
            <button style={{ width: '100%', padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb', color: '#000000', display: 'flex', justifyContent: 'space-between' }} onClick={() => toggleDate(date)}>
              {date} <span>{openDates.includes(date) ? '▼' : '▶'}</span>
            </button>
            {openDates.includes(date) && (
              <div style={{ padding: '1rem', borderTop: '1px solid #d1d5db', color: '#000000', fontSize: '0.875rem' }}>
                {grouped[date].map((item: any) => (
                  <div key={item.id} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Pemasukan:</span> <input style={{ border: '1px solid #9ca3af', width: '7rem', textAlign: 'right', color: '#000000' }} defaultValue={item.p.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'p', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Ongkos:</span> <input style={{ border: '1px solid #9ca3af', width: '7rem', textAlign: 'right', color: '#000000' }} defaultValue={item.o.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'o', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Tabungan Tambahan:</span> <input style={{ border: '1px solid #9ca3af', width: '7rem', textAlign: 'right', color: '#000000' }} defaultValue={item.e.toLocaleString('id-ID')} onBlur={(e) => updateItem(item.id, 'e', e.target.value)} />
                    </div>
                    <hr style={{ margin: '0.5rem 0' }}/>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Saldo Kotor:</span> <b>Rp {item.saldoKotor.toLocaleString()}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tabungan:</span> <b>Rp {item.tabungan.toLocaleString()}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Service:</span> <b>Rp {item.service.toLocaleString()}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dana Darurat:</span> <b>Rp {item.danaDarurat.toLocaleString()}</b></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}><span>Total Bersih:</span> <b style={{ color: '#15803d' }}>Rp {item.saldoBersih.toLocaleString()}</b></div>
                    <button style={{ width: '100%', marginTop: '1rem', backgroundColor: '#ef4444', color: '#ffffff', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }} onClick={() => deleteDate(date)}>HAPUS HARI INI</button>
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