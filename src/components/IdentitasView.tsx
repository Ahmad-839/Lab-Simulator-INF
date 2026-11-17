import React from 'react';
import { ArrowRight, BookOpen, Cpu, GraduationCap, Laptop, Network, School, ShieldCheck } from 'lucide-react';
import { NavTab } from '../types/network';

interface Props {
  onNavigate: (tab: NavTab) => void;
}

export const IdentitasView: React.FC<Props> = ({ onNavigate }) => {
  return (
    <main className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6">
      {/* Header Identitas Sekolah & Aplikasi */}
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider text-cyan-400">
              Identitas Aplikasi &amp; Satuan Pendidikan
            </p>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              SMK 02 Islam 45 Ambulu
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
              <strong>NETWORK LAB SIMULATOR: Virtual LAN &amp; WiFi Assembly</strong> dikembangkan sebagai media pembelajaran interaktif Informatika dan Teknik Jaringan Komputer untuk siswa kelas X SMK 02 Islam 45 Ambulu.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('simulator_lan')}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-400 whitespace-nowrap"
            >
              Mulai Simulasi
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('panduan')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 whitespace-nowrap"
            >
              Petunjuk Siswa
            </button>
          </div>
        </div>
      </section>

      {/* Tabel Metadata Identitas Resmi */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <School className="h-5 w-5 text-cyan-700" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Profil Media Pembelajaran
            </h2>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500">Nama Aplikasi</dt>
              <dd className="font-semibold text-slate-900 sm:col-span-2">
                NETWORK LAB SIMULATOR: Virtual LAN &amp; WiFi Assembly
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500">Nama Sekolah</dt>
              <dd className="font-bold text-cyan-800 sm:col-span-2">
                SMK 02 Islam 45 Ambulu
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500">Mata Pelajaran</dt>
              <dd className="text-slate-800 sm:col-span-2">
                Informatika — Elemen Jaringan Komputer dan Internet (Kelas X SMK)
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500">Lingkup Kompetensi</dt>
              <dd className="text-slate-800 sm:col-span-2">
                Pengenalan perangkat jaringan, perakitan kabel UTP T568A/T568B, konfigurasi IPv4, simulasi Access Point WiFi, dan uji konektivitas Ping.
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500">Kebutuhan Perangkat</dt>
              <dd className="text-slate-800 sm:col-span-2">
                Berjalan 100% virtual di browser (laptop, komputer, tablet, atau smartphone) tanpa membutuhkan perangkat keras Switch, Router, atau Access Point fisik.
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-slate-500">Penyimpanan Progres</dt>
              <dd className="text-slate-800 sm:col-span-2">
                Otomatis tersimpan secara lokal di perangkat siswa (tanpa akun eksternal atau data sensitif).
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Tujuan Pembelajaran di SMK 02 Islam 45 Ambulu
              </h2>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Network className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                <span>Siswa mampu membedakan fungsi perangkat LAN dan WLAN secara tepat.</span>
              </li>
              <li className="flex items-start gap-2">
                <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                <span>Siswa mampu merakit topologi jaringan virtual tanpa risiko kerusakan perangkat keras lab.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                <span>Siswa mampu mendiagnosis konflik IP, kesalahan kabel UTP, serta keamanan WiFi WPA2/WPA3.</span>
              </li>
              <li className="flex items-start gap-2">
                <Laptop className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                <span>Siswa dapat berlatih mandiri dari rumah menggunakan laptop, tablet, maupun HP.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-base font-bold text-slate-900">
              Mulai Belajar Sekarang
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Pelajari konsep dasar terlebih dahulu atau langsung uji kemampuanmu pada 5 Misi Praktik.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('belajar')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-cyan-700"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Mode Belajar
              </button>
              <button
                type="button"
                onClick={() => onNavigate('misi')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                5 Misi Praktik
              </button>
              <button
                type="button"
                onClick={() => onNavigate('evaluasi')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Kuis Evaluasi
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
