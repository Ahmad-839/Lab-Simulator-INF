import React from 'react';
import { CatalogItemId } from '../types/network';

interface Props {
  type: CatalogItemId;
  size?: number;
  active?: boolean;
}

export const DeviceIllustration: React.FC<Props> = ({ type, size = 48, active = true }) => {
  const ledColor = active ? '#10b981' : '#94a3b8';

  switch (type) {
    case 'pc':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="8" y="10" width="48" height="32" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <rect x="12" y="14" width="40" height="24" rx="2" fill="#1E293B" />
          <path d="M18 22H36M18 27H42M18 32H28" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 42H38L40 49H24L26 42Z" fill="#334155" />
          <rect x="18" y="49" width="28" height="4" rx="2" fill="#0F172A" />
          <circle cx="48" cy="39" r="2" fill={ledColor} />
        </svg>
      );

    case 'laptop':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="12" y="13" width="40" height="26" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <rect x="16" y="17" width="32" height="18" rx="1.5" fill="#1E293B" />
          <path d="M22 25C27.5 20.5 36.5 20.5 42 25" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M26 28.5C29.5 25.8 34.5 25.8 38 28.5" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="31.5" r="1.8" fill={ledColor} />
          <path d="M6 41H58L54 48H10L6 41Z" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="26" y="43" width="12" height="2.5" rx="1" fill="#64748B" />
        </svg>
      );

    case 'server':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="14" y="8" width="36" height="48" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <rect x="18" y="13" width="28" height="10" rx="2" fill="#1E293B" stroke="#334155" />
          <rect x="18" y="27" width="28" height="10" rx="2" fill="#1E293B" stroke="#334155" />
          <rect x="18" y="41" width="28" height="10" rx="2" fill="#1E293B" stroke="#334155" />
          <circle cx="23" cy="18" r="2" fill={ledColor} />
          <circle cx="29" cy="18" r="2" fill="#22D3EE" />
          <circle cx="23" cy="32" r="2" fill={ledColor} />
          <circle cx="23" cy="46" r="2" fill="#22D3EE" />
          <path d="M35 18H42M35 32H42M35 46H42" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'switch':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="6" y="20" width="52" height="24" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          <rect x="11" y="29" width="6" height="6" rx="1" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
          <rect x="19" y="29" width="6" height="6" rx="1" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
          <rect x="27" y="29" width="6" height="6" rx="1" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
          <rect x="35" y="29" width="6" height="6" rx="1" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
          <rect x="43" y="29" width="6" height="6" rx="1" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
          <circle cx="14" cy="25" r="1.6" fill={ledColor} />
          <circle cx="22" cy="25" r="1.6" fill={ledColor} />
          <circle cx="30" cy="25" r="1.6" fill="#22D3EE" />
          <circle cx="38" cy="25" r="1.6" fill={ledColor} />
          <circle cx="46" cy="25" r="1.6" fill="#22D3EE" />
          <circle cx="53" cy="32" r="2" fill={ledColor} />
        </svg>
      );

    case 'router':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <ellipse cx="32" cy="36" rx="24" ry="12" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          <ellipse cx="32" cy="28" rx="24" ry="11" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
          <path d="M22 25L29 28L22 31M42 25L35 28L42 31" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 21V35" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          <circle cx="48" cy="39" r="2" fill={ledColor} />
        </svg>
      );

    case 'access_point':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M18 16L18 32" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M46 16L46 32" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <path d="M25 14C29 10.5 35 10.5 39 14" stroke="#06B6D4" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M21 10C27.5 4.8 36.5 4.8 43 10" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <rect x="10" y="30" width="44" height="16" rx="5" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          <circle cx="20" cy="38" r="2.2" fill={ledColor} />
          <circle cx="28" cy="38" r="2.2" fill="#22D3EE" />
          <rect x="38" y="36" width="10" height="4" rx="1" fill="#334155" />
        </svg>
      );

    case 'modem':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="10" y="24" width="44" height="22" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <path d="M32 10V24" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="9" r="3" fill="#06B6D4" />
          <circle cx="18" cy="35" r="2.2" fill={ledColor} />
          <circle cx="25" cy="35" r="2.2" fill="#22D3EE" />
          <circle cx="32" cy="35" r="2.2" fill={ledColor} />
          <rect x="40" y="31" width="9" height="8" rx="1.5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
        </svg>
      );

    case 'printer':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="18" y="10" width="28" height="14" rx="2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
          <rect x="10" y="22" width="44" height="22" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <rect x="18" y="36" width="28" height="18" rx="2" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
          <path d="M23 42H41M23 47H35" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="46" cy="28" r="2.2" fill={ledColor} />
        </svg>
      );

    case 'smartphone':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="20" y="8" width="24" height="48" rx="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
          <rect x="23" y="14" width="18" height="34" rx="2" fill="#1E293B" />
          <path d="M27 28C30 25.5 34 25.5 37 28" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="32" r="2" fill={ledColor} />
          <rect x="28" y="51" width="8" height="2" rx="1" fill="#64748B" />
        </svg>
      );

    case 'utp_cable':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M12 46C18 46 20 18 32 18C44 18 46 46 52 46" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
          <rect x="7" y="40" width="10" height="12" rx="2" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <rect x="47" y="40" width="10" height="12" rx="2" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M28 15H36" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'rj45_connector':
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="18" y="12" width="28" height="30" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <rect x="21" y="14" width="2.2" height="10" fill="#F97316" />
          <rect x="24.2" y="14" width="2.2" height="10" fill="#FB923C" />
          <rect x="27.4" y="14" width="2.2" height="10" fill="#22C55E" />
          <rect x="30.6" y="14" width="2.2" height="10" fill="#3B82F6" />
          <rect x="33.8" y="14" width="2.2" height="10" fill="#93C5FD" />
          <rect x="37" y="14" width="2.2" height="10" fill="#16A34A" />
          <rect x="40.2" y="14" width="2.2" height="10" fill="#92400E" />
          <rect x="24" y="42" width="16" height="12" rx="2" fill="#0F172A" />
        </svg>
      );
  }
};
