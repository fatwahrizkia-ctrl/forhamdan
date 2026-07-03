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

  // Hitung total service yang sudah terkumpul (sebelum data baru masuk)
  const totalServiceTerkumpul = data.reduce((sum, item) => sum + item.service, 0);

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
    // Logika Service: 0 jika sudah mencapai target 300rb
    const service = totalServiceTerkumpul >= targetService ? 0 : p * 0.05;
    const danaDarurat = p * 0.02;
    const totalDisisihkan = tabungan + service + danaDarurat + e;
    const saldoBersih = saldoKotor - totalDisisihkan;

    const entry = { id: Date.now(), date, p, o, e, saldoKotor, tabungan, service, danaDarurat, totalDisisihkan, saldoBersih };
    const newData = [entry, ...data];
    setData(newData);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(newData));
    setPemasukan(""); setOngkos(""); setExtra("");
  };

  const handleDelete = (id: number) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    localStorage.setItem("keuangan-hamdan", JSON.stringify(newData));
  };
}