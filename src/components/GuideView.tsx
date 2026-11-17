import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Cable,
  CheckCircle2,
  HelpCircle,
  Network,
  Shield,
  Smartphone,
  Terminal,
  Wifi,
} from 'lucide-react';
import { NavTab } from '../types/network';

interface Props {
  onNavigate: (tab: NavTab) => void;
}

export const GuideView: React.FC<Props> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      icon: Network,
      title: 'Tambahkan & Posisikan Perangkat',
      body: 'Pada laptop/komputer, seret perangkat (drag and drop) dari Katalog Perangkat ke kanvas, atau cukup klik/ketuk ikon perangkat pada tablet dan smartphone. Geser perangkat di kanvas untuk merapikan topologi.',
    },
    {
      num: '02',
      icon: Cable,
      title: 'Pasang Kabel UTP (Straight atau Crossover)',
      body: 'Aktifkan mode Tarik Kabel UTP, lalu pilih Straight (untuk PC ↔ Switch atau Switch ↔ Router) atau Crossover (untuk PC ↔ PC secara langsung). Klik perangkat asal, pilih port RJ45 jika muncul pilihan, lalu klik perangkat tujuan.',
    },
    {
      num: '03',
      icon: Shield,
      title: 'Konfigurasi IP Address & Pengaturan WiFi',
      body: 'Klik perangkat untuk membuka panel Konfigurasi. Atur IP Address, Subnet Mask (misal 255.255.255.0), Default Gateway (IP Router), dan DNS. Untuk Access Point, atur SSID, Password, keamanan WPA2/WPA3, serta DHCP.',
    },
    {
      num: '04',
      icon: Terminal,
      title: 'Uji Konektivitas Ping & Selesaikan Misi',
      body: 'Buka tab Uji Ping & Log, pilih perangkat pengirim dan IP tujuan, lalu klik Ping. Amati paket bergerak di kabel/gelombang WiFi. Setelah paham, kerjakan Misi 1–5 dan Kuis Evaluasi.',
    },
  ];

  const troubleshooting = [
    {
      problem: 'Muncul peringatan "Kabel Salah!" (garis merah putus-putus)',
      solution:
        'Lepas kabel dengan mengklik garis kabel lalu klik Lepas Kabel. Gunakan kabel Straight untuk PC ↔ Switch atau Switch ↔ Router, dan Crossover untuk PC ↔ PC.',
    },
    {
      problem: 'Muncul peringatan "Konflik IP"',
      solution:
        'Ada dua perangkat yang memakai IP Address yang sama. Ubah salah satu IP agar unik (misal 192.168.1.2 dan 192.168.1.3).',
    },
    {
      problem: 'Status Laptop/Smartphone "Disconnected"',
      solution:
        'Pastikan perangkat berada di dalam lingkaran sinyal Access Point, serta SSID dan Password WiFi persis sama dengan pengaturan Access Point.',
    },
    {
      problem: 'Ping gagal antar subnet yang berbeda',
      solution:
        'Pastikan kedua jaringan dihubungkan melalui Router, dan Default Gateway pada masing-masing perangkat sudah diisi alamat IP Router.',
    },
  ];

  return (
    <main className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-wider text-cyan-700">
          Petunjuk Penggunaan untuk Siswa · SMK 02 Islam 45 Ambulu
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Panduan Praktikum Network Lab Simulator
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Seluruh praktikum perakitan jaringan LAN dan WiFi pada aplikasi ini berjalan secara virtual di browser tanpa memerlukan Switch, Router, atau kabel fisik. Ikuti panduan berikut sebelum memulai praktikum.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-cyan-700">Langkah {step.num}</span>
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
                <h2 className="mt-3 font-display text-base font-bold text-slate-900">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50/60 p-4 text-sm text-slate-800">
          <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
          <div>
            <strong className="font-semibold text-slate-900">Tips Pengguna Tablet &amp; Smartphone:</strong>{' '}
            Ketuk langsung nama perangkat pada Katalog Perangkat untuk menambahkannya ke kanvas, lalu ketuk perangkat di kanvas untuk menggeser atau mengatur IP.
          </div>
        </div>
      </section>

      {/* Solusi Masalah Umum */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="font-display text-lg font-bold text-slate-900">
            Mengatasi Kesalahan Umum (Troubleshooting)
          </h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {troubleshooting.map((item) => (
            <div key={item.problem} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm font-bold text-slate-900">{item.problem}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabel Aturan Cepat & Rubrik */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Aturan Cepat Pemilihan Kabel UTP
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2 pr-4">Koneksi Perangkat</th>
                  <th className="py-2 pr-4">Jenis Kabel</th>
                  <th className="py-2">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 pr-4 font-medium">PC / Laptop / Server ↔ Switch</td>
                  <td className="py-2.5 pr-4 font-mono text-xs font-bold text-cyan-700">Straight</td>
                  <td className="py-2.5 text-xs">Perangkat berbeda jenis</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Switch ↔ Router / Access Point</td>
                  <td className="py-2.5 pr-4 font-mono text-xs font-bold text-cyan-700">Straight</td>
                  <td className="py-2.5 text-xs">Uplink ke Switch pusat</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Modem ↔ Router</td>
                  <td className="py-2.5 pr-4 font-mono text-xs font-bold text-cyan-700">Straight</td>
                  <td className="py-2.5 text-xs">Jalur WAN ISP ke Router</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">PC ↔ PC (Langsung)</td>
                  <td className="py-2.5 pr-4 font-mono text-xs font-bold text-amber-700">Crossover</td>
                  <td className="py-2.5 text-xs">Perangkat sejenis (peer-to-peer)</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium">Switch ↔ Switch / Router ↔ Router</td>
                  <td className="py-2.5 pr-4 font-mono text-xs font-bold text-amber-700">Crossover</td>
                  <td className="py-2.5 text-xs">Pin Tx dan Rx perlu disilang</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Rubrik Penilaian Praktikum
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Ketepatan Pemilihan Perangkat:</strong> Menggunakan Switch untuk LAN lokal, Router untuk Gateway, dan Access Point untuk klien nirkabel.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Ketepatan Pemasangan Kabel:</strong> Tidak ada kabel dengan jenis yang salah atau port yang tidak sesuai.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Ketepatan Konfigurasi IP &amp; WiFi:</strong> IP Address unik satu subnet, Subnet Mask valid, Gateway benar, dan WiFi terenkripsi WPA2/WPA3.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span><strong>Keberhasilan Konektivitas &amp; Misi:</strong> Ping antarperangkat berhasil dan seluruh target misi terpenuhi.</span>
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('simulator_lan')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Langsung Praktik di Simulator
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('misi')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Wifi className="h-4 w-4 text-cyan-700" />
              Lihat Daftar Misi
            </button>
            <button
              type="button"
              onClick={() => onNavigate('evaluasi')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <HelpCircle className="h-4 w-4 text-slate-600" />
              Kuis Evaluasi
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};
