import React, { useState } from 'react';
import { ArrowRight, Award, BookOpen, CheckCircle2, Network, ShieldCheck, Target, Wifi } from 'lucide-react';
import { NavTab, StudentProgress } from '../types/network';
import { calculateOverallScore } from '../utils/storage';
import { MISSIONS } from '../data/missions';
import { LEARNING_TOPICS } from '../data/curriculum';

interface Props {
  progress: StudentProgress;
  onNavigate: (tab: NavTab) => void;
  onStartMission: (missionId: string) => void;
}

export const DashboardView: React.FC<Props> = ({ progress, onNavigate, onStartMission }) => {
  const [imgError, setImgError] = useState(false);
  const { totalPoints, maxPoints, completionPercent } = calculateOverallScore(progress);
  const completedMissionCount = Object.keys(progress.completedMissions).length;

  const achievements = [
    {
      id: 'ach-lesson',
      title: 'Pembelajar Konsep Jaringan',
      requirement: 'Selesaikan minimal 3 materi belajar',
      unlocked: progress.completedLessons.length >= 3,
      stat: `${progress.completedLessons.length}/${LEARNING_TOPICS.length} materi`,
    },
    {
      id: 'ach-ping',
      title: 'Teknisi Penguji Koneksi',
      requirement: 'Berhasil melakukan Ping di simulator',
      unlocked: progress.successfulPings >= 1,
      stat: `${progress.successfulPings} ping sukses`,
    },
    {
      id: 'ach-mission',
      title: 'Perakit Topologi Andal',
      requirement: 'Selesaikan minimal 3 misi praktik',
      unlocked: completedMissionCount >= 3,
      stat: `${completedMissionCount}/${MISSIONS.length} misi`,
    },
    {
      id: 'ach-quiz',
      title: 'Lulus Evaluasi Informatika',
      requirement: 'Raih skor evaluasi minimal 75',
      unlocked: (progress.quizBestScore ?? 0) >= 75,
      stat: progress.quizBestScore !== null ? `Skor terbaik ${progress.quizBestScore}` : 'Belum dikerjakan',
    },
  ];

  return (
    <main className="mx-auto max-w-[1440px] space-y-10 px-4 py-8 sm:px-6">
      {/* Hero Split */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white">
        <div className="grid items-stretch lg:grid-cols-12">
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-wider text-cyan-400">
                SMK 02 Islam 45 Ambulu · Media Pembelajaran Informatika
              </p>
              <h1 className="max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-4xl">
                NETWORK LAB SIMULATOR
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300">
                Rancang topologi jaringan lokal, pilih kabel UTP Straight atau Crossover, atur IP Address dan Gateway, pancarkan sinyal WiFi Access Point, serta uji konektivitas Ping secara langsung.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('simulator_lan')}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 whitespace-nowrap shrink-0"
              >
                Mulai Praktik
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('belajar')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-4 w-4 text-cyan-400" />
                Pelajari Materi Dasar
              </button>
              <button
                type="button"
                onClick={() => onNavigate('misi')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap shrink-0"
              >
                <Target className="h-4 w-4 text-emerald-400" />
                5 Misi Praktik
              </button>
            </div>
          </div>

          <div className="relative min-h-[260px] bg-slate-950 lg:col-span-5">
            {!imgError ? (
              <img
                src="/src/assets/images/hero_network_lab_1794880085755.jpg"
                alt="Ilustrasi laboratorium jaringan komputer virtual dengan switch, kabel UTP cyan, komputer, dan Access Point WiFi"
                referrerPolicy="no-referrer"
                loading="eager"
                decoding="async"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover lg:h-full"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 p-8 text-center">
                <Network className="h-14 w-14 text-cyan-400" />
                <p className="mt-3 font-display text-sm font-semibold text-white">
                  Laboratorium Perakitan LAN &amp; WiFi Virtual
                </p>
              </div>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-900/60 lg:via-transparent lg:to-transparent"
            />
          </div>
        </div>
      </section>

      {/* Progress & Score Overview Strip */}
      <section aria-labelledby="progress-heading" className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 id="progress-heading" className="font-display text-lg font-bold text-slate-900">
              Progres Pembelajaran Siswa
            </h2>
            <p className="text-sm text-slate-600">
              Kemajuan tersimpan otomatis di perangkat ini melalui materi, misi praktik, dan kuis evaluasi.
            </p>
          </div>
          <div className="flex items-baseline gap-6 tabular-nums">
            <div>
              <span className="block text-xs font-medium text-slate-500">Total Skor</span>
              <span className="font-mono text-2xl font-bold text-slate-900">
                {totalPoints}
                <span className="text-sm font-normal text-slate-500"> / {maxPoints}</span>
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">Ketuntasan</span>
              <span className="font-mono text-2xl font-bold text-cyan-700">{completionPercent}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Persentase kemajuan belajar">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${Math.max(4, completionPercent)}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4 tabular-nums">
          <div>
            <p className="text-xs text-slate-500">Materi Selesai</p>
            <p className="mt-1 font-mono text-lg font-bold text-slate-900">
              {progress.completedLessons.length} / {LEARNING_TOPICS.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Misi Diselesaikan</p>
            <p className="mt-1 font-mono text-lg font-bold text-slate-900">
              {completedMissionCount} / {MISSIONS.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Skor Kuis Evaluasi</p>
            <p className="mt-1 font-mono text-lg font-bold text-slate-900">
              {progress.quizBestScore !== null ? `${progress.quizBestScore} / 100` : 'Belum ada'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Uji Ping Berhasil</p>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-700">
              {progress.successfulPings} kali
            </p>
          </div>
        </div>
      </section>

      {/* Kartu Materi Utama LAN & WiFi */}
      <section aria-labelledby="modules-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="modules-heading" className="font-display text-xl font-bold text-slate-900">
              Laboratorium Utama LAN &amp; WiFi
            </h2>
            <p className="text-sm text-slate-600">
              Pilih modul praktik untuk merakit kabel UTP, mengonfigurasi IP Address, atau membangun jaringan nirkabel.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card LAN */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-cyan-400">
                  <Network className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Kabel UTP · Switch · Router · IPv4
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Simulator Perakitan LAN &amp; Pengalamatan IP
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Seret perangkat PC, Switch, Router, Server, dan Printer ke kanvas kerja. Hubungkan port menggunakan kabel Straight atau Crossover, atur IP Address dan Gateway, deteksi konflik IP, lalu uji Ping dengan animasi paket.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Validasi otomatis kabel Straight vs Crossover</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Deteksi IP Conflict dan kesalahan subnet/gateway</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('simulator_lan')}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
              >
                Buka Simulator LAN
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onStartMission('misi-2')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Coba Misi Topologi Star
              </button>
            </div>
          </div>

          {/* Card WiFi */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-700 text-white">
                  <Wifi className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Access Point · SSID · WPA2/WPA3 · DHCP
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Simulator Jaringan WiFi &amp; Jangkauan Sinyal
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Konfigurasi Access Point dengan SSID, password WPA2/WPA3, serta DHCP Server. Amati kekuatan sinyal (dBm), geser Laptop atau Smartphone keluar lingkaran jangkauan, dan uji simulasi gangguan sinyal.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Visualisasi gelombang jangkauan sinyal dan indikator bar WiFi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Simulasi interferensi &amp; pemutusan otomatis di luar radius</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('simulator_wifi')}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-800"
              >
                Buka Simulator WiFi
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onStartMission('misi-4')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Coba Misi WiFi Aman
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pencapaian & Akses Cepat Evaluasi */}
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Indikator Pencapaian Kompetensi
            </h2>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              {achievements.filter((a) => a.unlocked).length} dari {achievements.length} tercapai
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`rounded-lg border p-4 transition-colors ${
                  ach.unlocked
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Award
                      className={`h-5 w-5 shrink-0 ${
                        ach.unlocked ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-slate-900">{ach.title}</h3>
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      ach.unlocked ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    {ach.unlocked ? 'Tercapai' : 'Belum'}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600">{ach.requirement}</p>
                <p className="mt-2 font-mono text-xs font-medium text-slate-700">{ach.stat}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-4">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
              Evaluasi Pemahaman &amp; Panduan
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Uji penguasaan materi LAN, kabel UTP T568A/B, IPv4, dan keamanan WiFi melalui 12 soal evaluasi interaktif beserta pembahasan lengkap.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('evaluasi')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
            >
              Kerjakan Kuis Evaluasi
            </button>
            <button
              type="button"
              onClick={() => onNavigate('panduan')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Baca Petunjuk Siswa
            </button>
            <button
              type="button"
              onClick={() => onNavigate('identitas')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Identitas SMK 02 Islam 45 Ambulu
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
