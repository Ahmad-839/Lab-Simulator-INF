import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Info, Lock, Network, ShieldAlert, Wifi, XCircle } from 'lucide-react';
import { LEARNING_TOPICS, LessonTopic } from '../data/curriculum';
import { NavTab } from '../types/network';
import { DeviceIllustration } from './DeviceIllustration';

interface Props {
  completedLessons: string[];
  onCompleteLesson: (lessonId: string) => void;
  onNavigate: (tab: NavTab) => void;
  initialTopicId?: string | null;
}

const T568B_PINS = [
  { pin: 1, name: 'Putih Oranye', color: '#FDBA74', stripe: true },
  { pin: 2, name: 'Oranye', color: '#F97316', stripe: false },
  { pin: 3, name: 'Putih Hijau', color: '#86EFAC', stripe: true },
  { pin: 4, name: 'Biru', color: '#2563EB', stripe: false },
  { pin: 5, name: 'Putih Biru', color: '#93C5FD', stripe: true },
  { pin: 6, name: 'Hijau', color: '#16A34A', stripe: false },
  { pin: 7, name: 'Putih Cokelat', color: '#D6B48F', stripe: true },
  { pin: 8, name: 'Cokelat', color: '#78350F', stripe: false },
];

const T568A_PINS = [
  { pin: 1, name: 'Putih Hijau', color: '#86EFAC', stripe: true },
  { pin: 2, name: 'Hijau', color: '#16A34A', stripe: false },
  { pin: 3, name: 'Putih Oranye', color: '#FDBA74', stripe: true },
  { pin: 4, name: 'Biru', color: '#2563EB', stripe: false },
  { pin: 5, name: 'Putih Biru', color: '#93C5FD', stripe: true },
  { pin: 6, name: 'Oranye', color: '#F97316', stripe: false },
  { pin: 7, name: 'Putih Cokelat', color: '#D6B48F', stripe: true },
  { pin: 8, name: 'Cokelat', color: '#78350F', stripe: false },
];

const InteractiveLessonDiagram: React.FC<{ topic: LessonTopic }> = ({ topic }) => {
  const [cableMode, setCableMode] = useState<'straight' | 'crossover'>('straight');
  const [topoMode, setTopoMode] = useState<'star' | 'bus'>('star');
  const [faultSimulated, setFaultSimulated] = useState(false);
  const [pc2Octet3, setPc2Octet3] = useState(1);
  const [wifiDist, setWifiDist] = useState(40);
  const [secMode, setSecMode] = useState<'Open' | 'WPA2' | 'WPA3'>('WPA2');

  if (topic.visualType === 'utp_colors') {
    const rightPins = cableMode === 'straight' ? T568B_PINS : T568A_PINS;
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-bold text-white">
              Simulasi Susunan Warna Kabel UTP (RJ45)
            </h3>
            <p className="text-xs text-slate-300">
              {cableMode === 'straight'
                ? 'Straight-Through: Ujung A (T568B) ↔ Ujung B (T568B) · Untuk PC ↔ Switch'
                : 'Crossover: Ujung A (T568B) ↔ Ujung B (T568A) · Pin 1↔3 dan 2↔6 disilang untuk PC ↔ PC'}
            </p>
          </div>
          <div className="flex rounded-lg bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setCableMode('straight')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                cableMode === 'straight' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Straight (T568B–B)
            </button>
            <button
              type="button"
              onClick={() => setCableMode('crossover')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                cableMode === 'crossover' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Crossover (T568B–A)
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
            <p className="mb-2 font-mono text-xs font-semibold text-cyan-300">Ujung 1 · Standar T568B</p>
            <div className="space-y-1.5">
              {T568B_PINS.map((p) => (
                <div key={p.pin} className="flex items-center gap-2.5 text-xs">
                  <span className="w-5 font-mono text-slate-400">P{p.pin}</span>
                  <span
                    className="h-3.5 w-8 rounded-sm border border-white/20"
                    style={{
                      background: p.stripe
                        ? `repeating-linear-gradient(90deg, #fff, #fff 3px, ${p.color} 3px, ${p.color} 6px)`
                        : p.color,
                    }}
                  />
                  <span className="text-slate-200">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
            <p className="mb-2 font-mono text-xs font-semibold text-emerald-300">
              Ujung 2 · Standar {cableMode === 'straight' ? 'T568B' : 'T568A'}
            </p>
            <div className="space-y-1.5">
              {rightPins.map((p) => (
                <div key={p.pin} className="flex items-center gap-2.5 text-xs">
                  <span className="w-5 font-mono text-slate-400">P{p.pin}</span>
                  <span
                    className="h-3.5 w-8 rounded-sm border border-white/20"
                    style={{
                      background: p.stripe
                        ? `repeating-linear-gradient(90deg, #fff, #fff 3px, ${p.color} 3px, ${p.color} 6px)`
                        : p.color,
                    }}
                  />
                  <span className="text-slate-200">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (topic.visualType === 'topology') {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-bold text-white">
              Perbandingan Ketahanan Topologi Star vs Bus
            </h3>
            <p className="text-xs text-slate-300">
              Uji apa yang terjadi apabila salah satu segmen kabel mengalami kerusakan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setTopoMode('star')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  topoMode === 'star' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                Topologi Star
              </button>
              <button
                type="button"
                onClick={() => setTopoMode('bus')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  topoMode === 'bus' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                Topologi Bus
              </button>
            </div>
            <button
              type="button"
              onClick={() => setFaultSimulated((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                faultSimulated
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              {faultSimulated ? 'Perbaiki Kabel' : 'Simulasi Kabel Putus'}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-950 p-4">
          {topoMode === 'star' ? (
            <svg viewBox="0 0 520 190" className="w-full max-h-[190px]">
              <line x1="260" y1="95" x2="100" y2="40" stroke={faultSimulated ? '#EF4444' : '#06B6D4'} strokeWidth="3" strokeDasharray={faultSimulated ? '6 4' : undefined} />
              <line x1="260" y1="95" x2="420" y2="40" stroke="#10B981" strokeWidth="3" />
              <line x1="260" y1="95" x2="100" y2="150" stroke="#10B981" strokeWidth="3" />
              <line x1="260" y1="95" x2="420" y2="150" stroke="#10B981" strokeWidth="3" />
              <rect x="220" y="75" width="80" height="40" rx="6" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
              <text x="260" y="99" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">SWITCH</text>
              {[
                { x: 100, y: 40, label: 'PC 1', down: faultSimulated },
                { x: 420, y: 40, label: 'PC 2', down: false },
                { x: 100, y: 150, label: 'PC 3', down: false },
                { x: 420, y: 150, label: 'PC 4', down: false },
              ].map((n) => (
                <g key={n.label}>
                  <rect x={n.x - 36} y={n.y - 16} width="72" height="32" rx="6" fill={n.down ? '#450A0A' : '#1E293B'} stroke={n.down ? '#EF4444' : '#10B981'} strokeWidth="2" />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="600">
                    {n.label} {n.down ? '(Putus)' : '(Aktif)'}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <svg viewBox="0 0 520 190" className="w-full max-h-[190px]">
              <line x1="50" y1="95" x2="260" y2="95" stroke="#06B6D4" strokeWidth="5" />
              <line x1="260" y1="95" x2="470" y2="95" stroke={faultSimulated ? '#EF4444' : '#06B6D4'} strokeWidth="5" strokeDasharray={faultSimulated ? '8 5' : undefined} />
              {[85, 195, 325, 435].map((x, idx) => (
                <g key={x}>
                  <line x1={x} y1="95" x2={x} y2="48" stroke="#94A3B8" strokeWidth="2" />
                  <rect x={x - 38} y="16" width="76" height="32" rx="6" fill={faultSimulated ? '#450A0A' : '#1E293B'} stroke={faultSimulated ? '#EF4444' : '#10B981'} strokeWidth="2" />
                  <text x={x} y="36" textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="600">
                    PC {idx + 1} {faultSimulated ? '(Lumpuh)' : '(Aktif)'}
                  </text>
                </g>
              ))}
              <text x="260" y="145" textAnchor="middle" fill={faultSimulated ? '#FCA5A5' : '#94A3B8'} fontSize="12">
                {faultSimulated
                  ? 'Kabel utama (Backbone) putus → Seluruh komputer pada Topologi Bus gagal berkomunikasi!'
                  : 'Semua perangkat berbagi satu jalur kabel utama (Backbone).'}
              </text>
            </svg>
          )}
        </div>
      </div>
    );
  }

  if (topic.visualType === 'ip_addressing') {
    const sameNet = pc2Octet3 === 1;
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-bold text-white">
              Eksperimen Network ID &amp; Subnet Mask (255.255.255.0)
            </h3>
            <p className="text-xs text-slate-300">
              Ubah oktet ke-3 pada PC 2 untuk melihat apakah PC 1 dan PC 2 berada di subnet yang sama.
            </p>
          </div>
          <div className="flex rounded-lg bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setPc2Octet3(1)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold ${
                pc2Octet3 === 1 ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              192.168.1.3
            </button>
            <button
              type="button"
              onClick={() => setPc2Octet3(2)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold ${
                pc2Octet3 === 2 ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
              }`}
            >
              192.168.2.3
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3.5 font-mono text-xs">
            <p className="text-cyan-300">PC 1 (Pengirim)</p>
            <p className="mt-1 text-base font-bold text-white">192.168.1.2</p>
            <p className="mt-1 text-slate-400">Subnet: 255.255.255.0</p>
            <p className="text-slate-400">Network ID: <span className="text-emerald-400">192.168.1.0</span></p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3.5 font-mono text-xs">
            <p className="text-cyan-300">PC 2 (Tujuan)</p>
            <p className="mt-1 text-base font-bold text-white">192.168.{pc2Octet3}.3</p>
            <p className="mt-1 text-slate-400">Subnet: 255.255.255.0</p>
            <p className="text-slate-400">
              Network ID:{' '}
              <span className={sameNet ? 'text-emerald-400' : 'text-amber-300'}>
                192.168.{pc2Octet3}.0
              </span>
            </p>
          </div>
        </div>

        <div
          className={`mt-4 rounded-lg border p-3 text-xs ${
            sameNet
              ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-200'
              : 'border-amber-500/40 bg-amber-950/60 text-amber-200'
          }`}
        >
          {sameNet
            ? 'Status: Satu Subnet! PC 1 dan PC 2 dapat langsung berkomunikasi melalui Switch tanpa Router.'
            : 'Status: Beda Subnet! Paket dari 192.168.1.0 menuju 192.168.2.0 wajib melewati Default Gateway (Router).'}
        </div>
      </div>
    );
  }

  if (topic.visualType === 'access_point' || topic.visualType === 'wifi_security') {
    const signalPct = Math.max(0, Math.round(100 - wifiDist));
    const connected = signalPct >= 20;
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-bold text-white">
              Simulasi Jarak Sinyal &amp; Keamanan WiFi
            </h3>
            <p className="text-xs text-slate-300">
              Geser jarak perangkat dan bandingkan enkripsi Open, WPA2, serta WPA3.
            </p>
          </div>
          <div className="flex rounded-lg bg-slate-800 p-1">
            {(['Open', 'WPA2', 'WPA3'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSecMode(m)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  secMode === m ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between text-xs text-slate-300">
            <span>Jarak Laptop dari Access Point: <strong className="font-mono text-white">{wifiDist} meter</strong></span>
            <span className={`font-mono font-bold ${connected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {connected ? `Connected · Sinyal ${signalPct}%` : 'Disconnected · Di Luar Jangkauan'}
            </span>
          </label>
          <input
            type="range"
            min={5}
            max={95}
            value={wifiDist}
            onChange={(e) => setWifiDist(Number(e.target.value))}
            aria-label="Jarak perangkat dari Access Point"
            className="w-full accent-cyan-400"
          />

          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-xs">
            <div className="flex items-center gap-2">
              {secMode === 'Open' ? (
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              ) : (
                <Lock className="h-4 w-4 text-emerald-400" />
              )}
              <span>
                Keamanan <strong>{secMode}</strong>:{' '}
                {secMode === 'Open'
                  ? 'Tanpa password & tanpa enkripsi — rentan penyadapan!'
                  : secMode === 'WPA2'
                  ? 'Enkripsi AES dengan password minimal 8 karakter (standar umum).'
                  : 'Enkripsi SAE terbaru dengan perlindungan brute-force terkuat.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default interactive visual for network_concept, lan_vs_wlan, wired_vs_wireless, devices
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-white">
          Diagram Arsitektur {topic.title}
        </h3>
        <span className="font-mono text-xs text-cyan-300">Alur Paket Data</span>
      </div>
      <div className="mt-4 grid grid-cols-3 items-center gap-3 rounded-lg bg-slate-950 p-4 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <DeviceIllustration type={topic.visualType === 'lan_vs_wlan' ? 'laptop' : 'pc'} size={44} />
          <span className="text-xs font-semibold text-white">Pengirim</span>
          <span className="font-mono text-[11px] text-slate-400">192.168.1.2</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          {topic.visualType === 'lan_vs_wlan' ? (
            <Wifi className="h-9 w-9 text-cyan-400" />
          ) : (
            <DeviceIllustration type={topic.visualType === 'devices' ? 'router' : 'switch'} size={44} />
          )}
          <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />
          <span className="text-[11px] font-medium text-cyan-300">
            {topic.visualType === 'wired_vs_wireless' ? 'Kabel UTP / Gelombang WiFi' : 'Switch / Access Point'}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <DeviceIllustration type={topic.visualType === 'devices' ? 'server' : 'printer'} size={44} />
          <span className="text-xs font-semibold text-white">Penerima</span>
          <span className="font-mono text-[11px] text-slate-400">192.168.1.10</span>
        </div>
      </div>
    </div>
  );
};

export const LearnView: React.FC<Props> = ({
  completedLessons,
  onCompleteLesson,
  onNavigate,
  initialTopicId,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialTopicId && LEARNING_TOPICS.some((t) => t.id === initialTopicId)
      ? initialTopicId
      : LEARNING_TOPICS[0].id
  );
  const [selectedOption, setSelectedOption] = useState<Record<string, number>>({});
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  const activeTopic = LEARNING_TOPICS.find((t) => t.id === selectedId) ?? LEARNING_TOPICS[0];
  const chosenIdx = selectedOption[activeTopic.id];
  const isChecked = Boolean(checkedTopics[activeTopic.id]);
  const isCorrect = chosenIdx === activeTopic.checkQuestion.correctIndex;
  const isDone = completedLessons.includes(activeTopic.id);

  const handleCheckAnswer = () => {
    if (chosenIdx === undefined) return;
    setCheckedTopics((prev) => ({ ...prev, [activeTopic.id]: true }));
    if (chosenIdx === activeTopic.checkQuestion.correctIndex) {
      onCompleteLesson(activeTopic.id);
    }
  };

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-cyan-700">
            Mode Belajar Interaktif · 9 Modul Inti Informatika
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
            Materi Dasar Jaringan LAN &amp; WiFi
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm tabular-nums">
          <span className="text-slate-600">
            Selesai:{' '}
            <strong className="font-mono text-slate-900">
              {completedLessons.length} / {LEARNING_TOPICS.length}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('simulator_lan')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700"
          >
            Praktik di Simulator
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar Daftar Materi */}
        <aside aria-label="Daftar topik belajar" className="lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <ul className="space-y-1">
              {LEARNING_TOPICS.map((topic) => {
                const active = topic.id === activeTopic.id;
                const done = completedLessons.includes(topic.id);
                return (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(topic.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-left transition-colors ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <span
                          className={`block text-[11px] font-medium ${
                            active ? 'text-cyan-300' : 'text-slate-500'
                          }`}
                        >
                          0{topic.number}. {topic.category}
                        </span>
                        <span className="block truncate text-sm font-semibold">{topic.title}</span>
                      </div>
                      {done && (
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${
                            active ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                          aria-label="Selesai"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Konten Materi */}
        <article className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold text-cyan-700">
                  Topik 0{activeTopic.number} · {activeTopic.category}
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">
                  {activeTopic.title}
                </h2>
              </div>
              {isDone && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Materi Dipahami
                </span>
              )}
            </div>

            <p className="mt-4 text-base font-medium text-slate-800">{activeTopic.summary}</p>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
              {activeTopic.explanation.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50/60 p-4 text-sm text-slate-800">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                <div>
                  <strong className="font-semibold text-slate-900">Contoh Penerapan di SMK:</strong>{' '}
                  {activeTopic.example}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <InteractiveLessonDiagram topic={activeTopic} />
            </div>

            {/* Pertanyaan Pemahaman */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-display text-base font-bold text-slate-900">
                Uji Pemahaman Singkat
              </h3>
              <p className="mt-1.5 text-sm font-medium text-slate-800">
                {activeTopic.checkQuestion.question}
              </p>

              <div className="mt-3 space-y-2">
                {activeTopic.checkQuestion.options.map((opt, idx) => {
                  const selected = chosenIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedOption((prev) => ({ ...prev, [activeTopic.id]: idx }));
                        setCheckedTopics((prev) => ({ ...prev, [activeTopic.id]: false }));
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                        selected
                          ? 'border-cyan-600 bg-cyan-50 font-semibold text-slate-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={chosenIdx === undefined}
                  onClick={handleCheckAnswer}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Periksa Jawaban
                </button>
                {activeTopic.number < LEARNING_TOPICS.length && (
                  <button
                    type="button"
                    onClick={() => setSelectedId(LEARNING_TOPICS[activeTopic.number].id)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 hover:text-cyan-900"
                  >
                    Materi Berikutnya
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isChecked && (
                <div
                  className={`mt-4 flex items-start gap-2.5 rounded-lg border p-3.5 text-sm ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-rose-200 bg-rose-50 text-rose-900'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {isCorrect ? 'Jawaban Benar!' : 'Belum Tepat, coba tinjau kembali materi di atas.'}
                    </p>
                    {isCorrect && <p className="mt-0.5">{activeTopic.checkQuestion.feedback}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
};
