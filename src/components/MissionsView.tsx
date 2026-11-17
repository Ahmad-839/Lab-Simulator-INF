import React, { useMemo, useState } from 'react';
import { CheckCircle2, Target } from 'lucide-react';
import { MISSIONS } from '../data/missions';
import { NetworkConnection, NetworkDevice } from '../types/network';
import { SimulatorWorkspace } from './SimulatorWorkspace';
import { clonePorts, getCatalogItem } from '../data/catalog';

interface Props {
  completedMissions: Record<string, number>;
  onMissionComplete: (missionId: string, score: number) => void;
  onSuccessfulPing: () => void;
  initialMissionId?: string | null;
}

function getMissionStarter(missionId: string): {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
} {
  const pcCat = getCatalogItem('pc')!;
  const swCat = getCatalogItem('switch')!;
  const apCat = getCatalogItem('access_point')!;
  const lapCat = getCatalogItem('laptop')!;

  if (missionId === 'misi-1') {
    return {
      devices: [
        {
          id: 'm1-pc1',
          type: 'pc',
          name: 'PC 1',
          x: 240,
          y: 260,
          ports: clonePorts(pcCat.defaultPorts),
          ipConfig: { mode: 'static', ip: '192.168.1.2', subnetMask: '255.255.255.0', gateway: '', dns: '' },
        },
        {
          id: 'm1-pc2',
          type: 'pc',
          name: 'PC 2',
          x: 620,
          y: 260,
          ports: clonePorts(pcCat.defaultPorts),
          ipConfig: { mode: 'static', ip: '', subnetMask: '255.255.255.0', gateway: '', dns: '' },
        },
      ],
      connections: [],
    };
  }

  if (missionId === 'misi-2') {
    return {
      devices: [
        {
          id: 'm2-sw1',
          type: 'switch',
          name: 'Switch Lab',
          x: 450,
          y: 160,
          ports: clonePorts(swCat.defaultPorts),
          ipConfig: { mode: 'static', ip: '', subnetMask: '255.255.255.0', gateway: '', dns: '' },
        },
        {
          id: 'm2-pc1',
          type: 'pc',
          name: 'PC 1',
          x: 160,
          y: 370,
          ports: clonePorts(pcCat.defaultPorts),
          ipConfig: { mode: 'static', ip: '192.168.1.2', subnetMask: '255.255.255.0', gateway: '', dns: '' },
        },
        {
          id: 'm2-pc2',
          type: 'pc',
          name: 'PC 2',
          x: 350,
          y: 370,
          ports: clonePorts(pcCat.defaultPorts),
          ipConfig: { mode: 'static', ip: '192.168.1.3', subnetMask: '255.255.255.0', gateway: '', dns: '' },
        },
      ],
      connections: [],
    };
  }

  if (missionId === 'misi-4') {
    return {
      devices: [
        {
          id: 'm4-ap1',
          type: 'access_point',
          name: 'Access Point 1',
          x: 430,
          y: 260,
          ports: clonePorts(apCat.defaultPorts),
          ipConfig: { mode: 'static', ip: '192.168.1.254', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8' },
          wifiApConfig: {
            ssid: 'Lab_WiFi',
            password: '',
            security: 'Open',
            radiusPx: 190,
            dhcpEnabled: true,
            dhcpStart: '192.168.1.100',
            dhcpEnd: '192.168.1.150',
            apIp: '192.168.1.254',
            subnetMask: '255.255.255.0',
            interferenceLevel: 'none',
          },
        },
        {
          id: 'm4-lap1',
          type: 'laptop',
          name: 'Laptop 1',
          x: 560,
          y: 220,
          ports: clonePorts(lapCat.defaultPorts),
          ipConfig: { mode: 'dhcp', ip: '', subnetMask: '', gateway: '', dns: '' },
          wifiClientConfig: {
            targetApId: 'm4-ap1',
            targetSsid: 'Lab_WiFi',
            enteredPassword: '',
            connected: false,
            signalPercent: 0,
            signalDbm: -90,
            statusReason: 'Belum terhubung.',
          },
        },
      ],
      connections: [],
    };
  }

  // Misi 3 & Misi 5 start with clean guided workspace or switch
  return {
    devices: [
      {
        id: `${missionId}-sw`,
        type: 'switch',
        name: 'Switch Lab',
        x: 440,
        y: 250,
        ports: clonePorts(swCat.defaultPorts),
        ipConfig: { mode: 'static', ip: '', subnetMask: '255.255.255.0', gateway: '', dns: '' },
      },
    ],
    connections: [],
  };
}

export const MissionsView: React.FC<Props> = ({
  completedMissions,
  onMissionComplete,
  onSuccessfulPing,
  initialMissionId,
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    initialMissionId && MISSIONS.some((m) => m.id === initialMissionId)
      ? initialMissionId
      : MISSIONS[0].id
  );

  const activeMission = useMemo(
    () => MISSIONS.find((m) => m.id === selectedMissionId) ?? MISSIONS[0],
    [selectedMissionId]
  );

  const starter = useMemo(() => getMissionStarter(activeMission.id), [activeMission.id]);

  return (
    <div>
      {/* Mission Selector Strip */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
          <div className="mr-3 flex items-center gap-2 text-xs font-bold text-slate-900">
            <Target className="h-4 w-4 text-cyan-700" />
            <span>Pilih Misi Praktik:</span>
          </div>
          {MISSIONS.map((m) => {
            const isActive = m.id === activeMission.id;
            const best = completedMissions[m.id];
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMissionId(m.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : best !== undefined
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>Misi {m.number}</span>
                {best !== undefined && (
                  <CheckCircle2
                    className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-emerald-600'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <SimulatorWorkspace
        key={activeMission.id}
        mode="mission"
        initialDevices={starter.devices}
        initialConnections={starter.connections}
        activeMission={activeMission}
        onMissionComplete={onMissionComplete}
        onSuccessfulPing={onSuccessfulPing}
      />
    </div>
  );
};
