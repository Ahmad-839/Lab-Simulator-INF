import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavTab } from '../types/network';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'belajar', label: 'Belajar' },
  { id: 'simulator_lan', label: 'Simulator LAN' },
  { id: 'simulator_wifi', label: 'Simulator WiFi' },
  { id: 'misi', label: 'Misi Praktik' },
  { id: 'evaluasi', label: 'Evaluasi' },
  { id: 'panduan', label: 'Panduan' },
  { id: 'identitas', label: 'Identitas' },
];

export const TopNav: React.FC<Props> = ({ activeTab, onSelectTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: NavTab) => {
    onSelectTab(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 xl:gap-8">
        <button
          type="button"
          onClick={() => handleNav('beranda')}
          className="text-left font-display text-base font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-600"
        >
          NETWORK LAB SIMULATOR
        </button>

        <nav
          aria-label="Navigasi utama"
          className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-600 ${
                  isActive
                    ? 'font-semibold text-slate-950'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-cyan-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('simulator_lan')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-cyan-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-600"
          >
            Mulai Praktik
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Menu navigasi seluler"
          className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
