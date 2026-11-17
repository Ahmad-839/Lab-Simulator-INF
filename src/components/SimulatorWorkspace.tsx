import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Cable,
  CheckCircle2,
  HelpCircle,
  Info,
  MousePointer2,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from 'lucide-react';
import {
  ActivityLogEntry,
  CableType,
  CatalogItem,
  CatalogItemId,
  DeviceType,
  MissionDefinition,
  MissionEvaluation,
  NetworkConnection,
  NetworkDevice,
  PacketAnimationState,
  PingResult,
  WifiSecurity,
} from '../types/network';
import { clonePorts, createDefaultIpConfig, DEVICE_CATALOG, getCatalogItem } from '../data/catalog';
import {
  applyWifiAndDhcpState,
  detectIpConflicts,
  evaluateMission,
  simulatePing,
  validateCableConnection,
  validateDeviceIpConfig,
} from '../engine/networkEngine';
import { DeviceIllustration } from './DeviceIllustration';

interface Props {
  mode: 'lan' | 'wifi' | 'mission';
  initialDevices: NetworkDevice[];
  initialConnections: NetworkConnection[];
  activeMission?: MissionDefinition | null;
  onMissionComplete?: (missionId: string, score: number) => void;
  onSuccessfulPing?: () => void;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 540;

export const SimulatorWorkspace: React.FC<Props> = ({
  mode,
  initialDevices,
  initialConnections,
  activeMission = null,
  onMissionComplete,
  onSuccessfulPing,
}) => {
  const [devices, setDevices] = useState<NetworkDevice[]>(() => applyWifiAndDhcpState(initialDevices));
  const [connections, setConnections] = useState<NetworkConnection[]>(initialConnections);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    initialDevices[0]?.id ?? null
  );
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Tool state
  const [toolMode, setToolMode] = useState<'select' | 'cable'>('select');
  const [cableType, setCableType] = useState<CableType>('straight');
  const [pendingCableSource, setPendingCableSource] = useState<{
    deviceId: string;
    portId: string;
  } | null>(null);
  const [portPickerTarget, setPortPickerTarget] = useState<{
    deviceId: string;
    role: 'source' | 'dest';
  } | null>(null);

  // Inspector & Tooltip state
  const [rightTab, setRightTab] = useState<'config' | 'ping' | 'mission'>(
    mode === 'mission' ? 'mission' : 'config'
  );
  const [inspectedCatalogItem, setInspectedCatalogItem] = useState<CatalogItem | null>(null);
  const [showRj45Guide, setShowRj45Guide] = useState(false);

  // Ping & Activity Log
  const [pingSourceId, setPingSourceId] = useState<string>('');
  const [pingTargetIp, setPingTargetIp] = useState<string>('');
  const [lastPingResult, setLastPingResult] = useState<PingResult | null>(null);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([
    {
      id: 'init-log',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      type: 'info',
      message:
        mode === 'wifi'
          ? 'Simulator WiFi siap. Klik Access Point atau geser Laptop/Smartphone untuk menguji jangkauan sinyal.'
          : 'Simulator LAN siap. Seret atau klik perangkat di panel kiri untuk merakit topologi jaringan.',
    },
  ]);

  // Packet animation state
  const [packetAnim, setPacketAnim] = useState<PacketAnimationState | null>(null);
  const [packetPos, setPacketPos] = useState<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dragging node state
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Mission evaluation
  const [missionEval, setMissionEval] = useState<MissionEvaluation | null>(null);

  // Sync when switching mission or preset
  useEffect(() => {
    const synced = applyWifiAndDhcpState(initialDevices);
    setDevices(synced);
    setConnections(initialConnections);
    setSelectedDeviceId(synced[0]?.id ?? null);
    setSelectedConnectionId(null);
    setPendingCableSource(null);
    setPortPickerTarget(null);
    setLastPingResult(null);
    setMissionEval(null);
    setRightTab(mode === 'mission' ? 'mission' : 'config');
  }, [initialDevices, initialConnections, mode, activeMission?.id]);

  // Keep ping source valid
  useEffect(() => {
    const pingable = devices.filter((d) => d.type !== 'switch');
    if (!pingable.some((d) => d.id === pingSourceId)) {
      setPingSourceId(pingable[0]?.id ?? '');
    }
    if (!pingTargetIp && pingable.length >= 2) {
      const secondIp =
        pingable[1].type === 'access_point'
          ? pingable[1].wifiApConfig?.apIp ?? ''
          : pingable[1].ipConfig.ip;
      if (secondIp) setPingTargetIp(secondIp);
    }
  }, [devices, pingSourceId, pingTargetIp]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const addLog = (type: ActivityLogEntry['type'], message: string) => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
        type,
        message,
      },
      ...prev.slice(0, 29),
    ]);
  };

  const ipConflicts = useMemo(() => detectIpConflicts(devices), [devices]);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId]
  );

  const selectedConnection = useMemo(
    () => connections.find((c) => c.id === selectedConnectionId) ?? null,
    [connections, selectedConnectionId]
  );

  const updateDevicesWithWifi = (updater: (prev: NetworkDevice[]) => NetworkDevice[]) => {
    setDevices((prev) => applyWifiAndDhcpState(updater(prev)));
  };

  const getNextDeviceName = (type: DeviceType, list: NetworkDevice[]): string => {
    const item = getCatalogItem(type);
    const base = item?.shortName ?? type.toUpperCase();
    const count = list.filter((d) => d.type === type).length + 1;
    return `${base} ${count}`;
  };

  const handleAddDeviceAt = (itemId: CatalogItemId, x?: number, y?: number) => {
    if (itemId === 'utp_cable') {
      setToolMode('cable');
      setInspectedCatalogItem(getCatalogItem('utp_cable') ?? null);
      addLog('info', `Mode Tarik Kabel UTP (${cableType === 'straight' ? 'Straight' : 'Crossover'}) diaktifkan.`);
      return;
    }
    if (itemId === 'rj45_connector') {
      setShowRj45Guide(true);
      setInspectedCatalogItem(getCatalogItem('rj45_connector') ?? null);
      addLog('info', 'Membuka panduan pinout Konektor RJ45 (T568A & T568B).');
      return;
    }

    const cat = getCatalogItem(itemId);
    if (!cat || !cat.isPlaceableNode) return;

    const devType = itemId as DeviceType;
    const count = devices.length + 1;
    const targetX = x ?? Math.min(790, Math.max(110, 180 + ((count * 95) % 560)));
    const targetY = y ?? Math.min(460, Math.max(95, 130 + ((count * 70) % 310)));
    const newId = `dev-${devType}-${Date.now().toString(36)}`;

    const newDevice: NetworkDevice = {
      id: newId,
      type: devType,
      name: getNextDeviceName(devType, devices),
      x: targetX,
      y: targetY,
      ports: clonePorts(cat.defaultPorts),
      ipConfig: createDefaultIpConfig(devType, count),
      routerSecondIp:
        devType === 'router'
          ? {
              mode: 'static',
              ip: '10.0.0.2',
              subnetMask: '255.255.255.0',
              gateway: '10.0.0.1',
              dns: '8.8.8.8',
            }
          : undefined,
      wifiApConfig:
        devType === 'access_point'
          ? {
              ssid: 'Lab_SMK_WiFi',
              password: 'smkhebat2026',
              security: 'WPA2',
              radiusPx: 190,
              dhcpEnabled: true,
              dhcpStart: '192.168.1.100',
              dhcpEnd: '192.168.1.150',
              apIp: '192.168.1.254',
              subnetMask: '255.255.255.0',
              interferenceLevel: 'none',
            }
          : undefined,
      wifiClientConfig:
        devType === 'laptop' || devType === 'smartphone'
          ? {
              targetApId: devices.find((d) => d.type === 'access_point')?.id ?? null,
              targetSsid:
                devices.find((d) => d.type === 'access_point')?.wifiApConfig?.ssid ?? 'Lab_SMK_WiFi',
              enteredPassword:
                devices.find((d) => d.type === 'access_point')?.wifiApConfig?.password ?? '',
              connected: false,
              signalPercent: 0,
              signalDbm: -90,
              statusReason: 'Menunggu koneksi WiFi.',
            }
          : undefined,
    };

    updateDevicesWithWifi((prev) => [...prev, newDevice]);
    setSelectedDeviceId(newId);
    setSelectedConnectionId(null);
    if (mode !== 'mission') setRightTab('config');
    addLog('info', `Menambahkan ${newDevice.name} ke area kerja.`);
  };

  const handleDeleteDevice = (id: string) => {
    const dev = devices.find((d) => d.id === id);
    updateDevicesWithWifi((prev) => prev.filter((d) => d.id !== id));
    setConnections((prev) => prev.filter((c) => c.fromDeviceId !== id && c.toDeviceId !== id));
    if (selectedDeviceId === id) setSelectedDeviceId(null);
    if (pendingCableSource?.deviceId === id) setPendingCableSource(null);
    if (dev) addLog('warning', `Menghapus perangkat ${dev.name} beserta kabel terhubung.`);
  };

  const handleDeleteConnection = (connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    if (selectedConnectionId === connId) setSelectedConnectionId(null);
    addLog('warning', 'Kabel UTP dilepas dari port perangkat.');
  };

  const getSvgCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 450, y: 270 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
    return {
      x: Math.round(Math.min(CANVAS_WIDTH - 48, Math.max(48, x))),
      y: Math.round(Math.min(CANVAS_HEIGHT - 48, Math.max(48, y))),
    };
  };

  // Drag-and-drop from Catalog onto Canvas
  const handleCanvasDrop = (e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') as CatalogItemId;
    if (!itemId) return;
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    handleAddDeviceAt(itemId, x, y);
  };

  // Node dragging inside Canvas
  const handleNodePointerDown = (e: React.PointerEvent, dev: NetworkDevice) => {
    if (toolMode === 'cable') return;
    e.stopPropagation();
    const pt = getSvgCoords(e.clientX, e.clientY);
    dragOffsetRef.current = { dx: dev.x - pt.x, dy: dev.y - pt.y };
    setDraggingNodeId(dev.id);
    setSelectedDeviceId(dev.id);
    setSelectedConnectionId(null);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNodeId) return;
    const pt = getSvgCoords(e.clientX, e.clientY);
    const nx = Math.min(CANVAS_WIDTH - 45, Math.max(45, pt.x + dragOffsetRef.current.dx));
    const ny = Math.min(CANVAS_HEIGHT - 45, Math.max(45, pt.y + dragOffsetRef.current.dy));
    updateDevicesWithWifi((prev) =>
      prev.map((d) => (d.id === draggingNodeId ? { ...d, x: nx, y: ny } : d))
    );
  };

  const handleCanvasPointerUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  // Cable connection flow
  const finalizeConnection = (
    fromDeviceId: string,
    fromPortId: string,
    toDeviceId: string,
    toPortId: string
  ) => {
    const fromDev = devices.find((d) => d.id === fromDeviceId);
    const toDev = devices.find((d) => d.id === toDeviceId);
    if (!fromDev || !toDev) return;

    const check = validateCableConnection(
      fromDev,
      fromPortId,
      toDev,
      toPortId,
      cableType,
      connections
    );

    // Prevent exact duplicate link
    const duplicate = connections.some(
      (c) =>
        (c.fromDeviceId === fromDeviceId &&
          c.fromPortId === fromPortId &&
          c.toDeviceId === toDeviceId &&
          c.toPortId === toPortId) ||
        (c.toDeviceId === fromDeviceId &&
          c.toPortId === fromPortId &&
          c.fromDeviceId === toDeviceId &&
          c.fromPortId === toPortId)
    );

    if (duplicate) {
      addLog('warning', 'Kabel pada port tersebut sudah terpasang.');
      setPendingCableSource(null);
      setPortPickerTarget(null);
      return;
    }

    const newConn: NetworkConnection = {
      id: `conn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      fromDeviceId,
      fromPortId,
      toDeviceId,
      toPortId,
      cableType,
      isValid: check.isValid,
      validationMessage: check.message,
    };

    setConnections((prev) => [...prev, newConn]);
    setSelectedConnectionId(newConn.id);
    addLog(check.isValid ? 'success' : 'error', check.message);
    setPendingCableSource(null);
    setPortPickerTarget(null);
  };

  const handleNodeClickInCableMode = (dev: NetworkDevice) => {
    const ethPorts = dev.ports.filter((p) => p.kind !== 'wifi');
    if (ethPorts.length === 0) {
      addLog(
        'error',
        `${dev.name} tidak memiliki port RJ45 (khusus WiFi). Hubungkan lewat menu SSID pada panel Konfigurasi.`
      );
      return;
    }

    const availablePorts = ethPorts.filter(
      (p) =>
        !connections.some(
          (c) =>
            (c.fromDeviceId === dev.id && c.fromPortId === p.id) ||
            (c.toDeviceId === dev.id && c.toPortId === p.id)
        )
    );

    if (availablePorts.length === 0) {
      addLog('warning', `Semua port RJ45 pada ${dev.name} sudah terpakai.`);
      return;
    }

    if (!pendingCableSource) {
      if (availablePorts.length === 1) {
        setPendingCableSource({ deviceId: dev.id, portId: availablePorts[0].id });
        addLog('info', `Memilih port asal ${dev.name}:${availablePorts[0].label}. Klik perangkat tujuan.`);
      } else {
        setPortPickerTarget({ deviceId: dev.id, role: 'source' });
      }
    } else {
      if (pendingCableSource.deviceId === dev.id) {
        setPendingCableSource(null);
        setPortPickerTarget(null);
        return;
      }
      if (availablePorts.length === 1) {
        finalizeConnection(
          pendingCableSource.deviceId,
          pendingCableSource.portId,
          dev.id,
          availablePorts[0].id
        );
      } else {
        setPortPickerTarget({ deviceId: dev.id, role: 'dest' });
      }
    }
  };

  // Packet animation runner
  const triggerPacketAnimation = (pathIds: string[], success: boolean, label: string) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (pathIds.length < 2) {
      setPacketAnim(null);
      setPacketPos(null);
      return;
    }

    const pts = pathIds
      .map((id) => devices.find((d) => d.id === id))
      .filter((d): d is NetworkDevice => Boolean(d))
      .map((d) => ({ x: d.x, y: d.y }));

    if (pts.length < 2) return;

    setPacketAnim({
      id: `pkt-${Date.now()}`,
      pathDeviceIds: pathIds,
      success,
      label,
    });

    const totalSegs = pts.length - 1;
    const durationMs = Math.max(900, totalSegs * 550);
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const exactSeg = t * totalSegs;
      const segIdx = Math.min(totalSegs - 1, Math.floor(exactSeg));
      const localT = exactSeg - segIdx;
      const a = pts[segIdx];
      const b = pts[segIdx + 1];
      setPacketPos({
        x: a.x + (b.x - a.x) * localT,
        y: a.y + (b.y - a.y) * localT,
      });

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setPacketAnim(null);
          setPacketPos(null);
        }, 400);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const handleRunPing = (overrideTargetIp?: string) => {
    const tgt = (overrideTargetIp ?? pingTargetIp).trim();
    if (overrideTargetIp) setPingTargetIp(overrideTargetIp);
    const res = simulatePing(pingSourceId, tgt, devices, connections);
    setLastPingResult(res);
    addLog(res.success ? 'success' : 'error', `Ping ${tgt}: ${res.reason}`);
    if (res.pathDeviceIds.length >= 2) {
      triggerPacketAnimation(res.pathDeviceIds, res.success, res.success ? 'ICMP OK' : 'FAIL');
    }
    if (res.success && onSuccessfulPing) {
      onSuccessfulPing();
    }
  };

  const handleRunMissionCheck = () => {
    if (!activeMission) return;
    const result = evaluateMission(activeMission, devices, connections);
    setMissionEval(result);
    addLog(
      result.passed ? 'success' : 'warning',
      `Pemeriksaan ${activeMission.title}: ${result.score}/${result.maxScore} (${result.passed ? 'LULUS' : 'BELUM LENGKAP'}).`
    );
    if (result.passed && onMissionComplete) {
      onMissionComplete(activeMission.id, result.score);
    }
  };

  // Real-time Lab Score Summary (Fitur 10)
  const labMetrics = useMemo(() => {
    const validCablesCount = connections.filter((c) => c.isValid).length;
    const invalidCablesCount = connections.filter((c) => !c.isValid).length;
    const configurableDevices = devices.filter((d) => d.type !== 'switch');
    const validIpCount = configurableDevices.filter((d) => {
      const cfg =
        d.type === 'access_point' && d.wifiApConfig
          ? { ...d.ipConfig, ip: d.wifiApConfig.apIp, subnetMask: d.wifiApConfig.subnetMask }
          : d.ipConfig;
      return validateDeviceIpConfig(cfg, d.type).valid;
    }).length;
    const conflictCount = Object.keys(ipConflicts).length;

    return {
      deviceCount: devices.length,
      validCablesCount,
      invalidCablesCount,
      validIpCount,
      totalIpDevices: configurableDevices.length,
      conflictCount,
    };
  }, [devices, connections, ipConflicts]);

  const pickerDevice = portPickerTarget
    ? devices.find((d) => d.id === portPickerTarget.deviceId) ?? null
    : null;

  const availablePickerPorts = pickerDevice
    ? pickerDevice.ports.filter(
        (p) =>
          p.kind !== 'wifi' &&
          !connections.some(
            (c) =>
              (c.fromDeviceId === pickerDevice.id && c.fromPortId === p.id) ||
              (c.toDeviceId === pickerDevice.id && c.toPortId === p.id)
          )
      )
    : [];

  const aps = devices.filter((d) => d.type === 'access_point');

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
      {/* Header Status & Scoring Strip */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3.5">
        <div>
          <h1 className="font-display text-lg font-extrabold text-slate-900">
            {activeMission
              ? activeMission.title
              : mode === 'wifi'
              ? 'Simulator Jaringan WiFi & Jangkauan Sinyal'
              : 'Simulator Perakitan LAN & Pengalamatan IP'}
          </h1>
          <p className="text-xs text-slate-600">
            {activeMission
              ? activeMission.subtitle
              : mode === 'wifi'
              ? 'Atur Access Point (SSID, WPA2/WPA3, DHCP) dan geser Laptop/Smartphone untuk menguji sinyal serta ping.'
              : 'Seret perangkat ke kanvas, tarik kabel UTP (Straight/Crossover), konfigurasi IP, lalu jalankan Ping.'}
          </p>
        </div>

        {/* Fitur 10: Live Scoring Indicators */}
        <div className="flex flex-wrap items-center gap-5 text-xs tabular-nums">
          <div>
            <span className="text-slate-500">Perangkat</span>
            <p className="font-mono font-bold text-slate-900">{labMetrics.deviceCount} unit</p>
          </div>
          <div>
            <span className="text-slate-500">Kabel UTP</span>
            <p
              className={`font-mono font-bold ${
                labMetrics.invalidCablesCount > 0 ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              {labMetrics.validCablesCount} benar · {labMetrics.invalidCablesCount} salah
            </p>
          </div>
          <div>
            <span className="text-slate-500">Konfigurasi IP</span>
            <p
              className={`font-mono font-bold ${
                labMetrics.conflictCount > 0 ? 'text-rose-700' : 'text-cyan-700'
              }`}
            >
              {labMetrics.validIpCount}/{labMetrics.totalIpDevices} valid
              {labMetrics.conflictCount > 0 ? ` (${labMetrics.conflictCount} konflik!)` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Main 3-Column Workbench */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* LEFT PANEL: 11-Item Device Catalog */}
        <aside
          aria-label="Katalog perangkat jaringan"
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 xl:col-span-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                Katalog Perangkat (11)
              </h2>
              <p className="text-[11px] text-slate-500">Seret ke kanvas atau klik untuk tambah</p>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:grid-cols-4 xl:grid-cols-2 xl:max-h-[560px] xl:overflow-y-auto xl:pr-1">
            {DEVICE_CATALOG.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.id);
                }}
                className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-2 transition-colors hover:border-cyan-500 hover:bg-cyan-50/40"
              >
                <div className="flex items-start justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => handleAddDeviceAt(item.id)}
                    aria-label={`Tambah ${item.name}`}
                    className="flex flex-1 flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-cyan-600"
                  >
                    <DeviceIllustration type={item.id} size={32} />
                    <span className="mt-1 text-[11px] font-semibold leading-tight text-slate-900">
                      {item.shortName}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectedCatalogItem(item)}
                    aria-label={`Info perangkat ${item.name}`}
                    title={`Lihat fungsi & port ${item.name}`}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="mt-0.5 block truncate text-center text-[10px] text-slate-500">
                  {item.isPlaceableNode ? 'Klik / Seret' : 'Alat / Info'}
                </span>
              </div>
            ))}
          </div>

          {/* Tooltip / Detail Card when clicking a catalog device info button */}
          {inspectedCatalogItem && (
            <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/70 p-3 text-xs text-slate-800">
              <div className="flex items-start justify-between gap-2">
                <strong className="font-display text-slate-900">{inspectedCatalogItem.name}</strong>
                <button
                  type="button"
                  onClick={() => setInspectedCatalogItem(null)}
                  aria-label="Tutup info perangkat"
                  className="text-slate-500 hover:text-slate-900"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 text-slate-700">{inspectedCatalogItem.functionSummary}</p>
              <p className="mt-1.5 font-mono text-[11px] font-semibold text-cyan-800">
                Port: {inspectedCatalogItem.portsSummary}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">{inspectedCatalogItem.tooltipDetail}</p>
            </div>
          )}
        </aside>

        {/* CENTER STAGE: Interactive SVG Network Canvas */}
        <section
          aria-label="Area kerja simulasi jaringan"
          className="flex flex-col rounded-xl border border-slate-200 bg-white xl:col-span-6"
        >
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3.5 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setToolMode('select');
                    setPendingCableSource(null);
                    setPortPickerTarget(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    toolMode === 'select'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MousePointer2 className="h-3.5 w-3.5" />
                  Pilih &amp; Geser
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToolMode('cable');
                    setPendingCableSource(null);
                    setPortPickerTarget(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    toolMode === 'cable'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cable className="h-3.5 w-3.5" />
                  Tarik Kabel UTP
                </button>
              </div>

              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setCableType('straight');
                    setToolMode('cable');
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    cableType === 'straight'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Straight
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCableType('crossover');
                    setToolMode('cable');
                  }}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                    cableType === 'crossover'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Crossover
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const synced = applyWifiAndDhcpState(initialDevices);
                  setDevices(synced);
                  setConnections(initialConnections);
                  setPendingCableSource(null);
                  setPortPickerTarget(null);
                  setLastPingResult(null);
                  addLog('info', 'Area kerja dikembalikan ke kondisi awal.');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setDevices([]);
                  setConnections([]);
                  setSelectedDeviceId(null);
                  setSelectedConnectionId(null);
                  setPendingCableSource(null);
                  setPortPickerTarget(null);
                  addLog('warning', 'Semua perangkat di area kerja dibersihkan.');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Kosongkan
              </button>
            </div>
          </div>

          {/* Active Cable / Port Picker Banner */}
          {toolMode === 'cable' && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-100 bg-cyan-50/80 px-3.5 py-2 text-xs text-cyan-950">
              <span>
                {pendingCableSource
                  ? `Kabel ${cableType === 'straight' ? 'Straight' : 'Crossover'}: Pilih perangkat & port tujuan untuk dihubungkan dari ${
                      devices.find((d) => d.id === pendingCableSource.deviceId)?.name
                    }.`
                  : `Mode Kabel ${cableType === 'straight' ? 'Straight' : 'Crossover'} aktif: Klik perangkat pertama untuk memilih port asal.`}
              </span>
              {pendingCableSource && (
                <button
                  type="button"
                  onClick={() => {
                    setPendingCableSource(null);
                    setPortPickerTarget(null);
                  }}
                  className="font-semibold text-rose-700 hover:underline"
                >
                  Batalkan Tarik Kabel
                </button>
              )}
            </div>
          )}

          {portPickerTarget && pickerDevice && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-900 px-3.5 py-2 text-xs text-white">
              <span className="font-semibold text-cyan-300">
                Pilih port pada {pickerDevice.name}:
              </span>
              {availablePickerPorts.map((port) => (
                <button
                  key={port.id}
                  type="button"
                  onClick={() => {
                    if (portPickerTarget.role === 'source') {
                      setPendingCableSource({ deviceId: pickerDevice.id, portId: port.id });
                      setPortPickerTarget(null);
                      addLog('info', `Port asal dipilih: ${pickerDevice.name}:${port.label}. Klik perangkat tujuan.`);
                    } else if (pendingCableSource) {
                      finalizeConnection(
                        pendingCableSource.deviceId,
                        pendingCableSource.portId,
                        pickerDevice.id,
                        port.id
                      );
                    }
                  }}
                  className="rounded bg-cyan-500 px-2.5 py-1 font-mono font-bold text-slate-950 hover:bg-cyan-400"
                >
                  {port.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPortPickerTarget(null)}
                className="ml-auto text-slate-300 hover:text-white"
              >
                Tutup
              </button>
            </div>
          )}

          {/* SVG Interactive Canvas */}
          <div className="relative flex-1 overflow-hidden rounded-b-xl bg-slate-50">
            <svg
              ref={svgRef}
              data-testid="network-canvas"
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleCanvasDrop}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onClick={() => {
                if (toolMode === 'select') setSelectedConnectionId(null);
              }}
              className="h-full min-h-[320px] sm:min-h-[420px] w-full select-none touch-none"
            >
              <defs>
                <pattern id="lab-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#CBD5E1" />
                </pattern>
              </defs>
              <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#lab-grid)" />

              {/* WiFi Coverage Rings for Access Points */}
              {aps.map((ap) => {
                const cfg = ap.wifiApConfig;
                if (!cfg) return null;
                const ringColor =
                  cfg.interferenceLevel === 'high'
                    ? '#EF4444'
                    : cfg.interferenceLevel === 'medium'
                    ? '#F59E0B'
                    : '#06B6D4';
                return (
                  <g key={`wifi-zone-${ap.id}`} className="pointer-events-none">
                    <circle
                      cx={ap.x}
                      cy={ap.y}
                      r={cfg.radiusPx}
                      fill={ringColor}
                      fillOpacity={0.07}
                      stroke={ringColor}
                      strokeWidth={1.5}
                      strokeDasharray="6 5"
                    />
                    <circle
                      cx={ap.x}
                      cy={ap.y}
                      r={cfg.radiusPx * 0.65}
                      fill="none"
                      stroke={ringColor}
                      strokeOpacity={0.45}
                      strokeWidth={1.2}
                      className="wifi-wave-ring"
                    />
                    <circle
                      cx={ap.x}
                      cy={ap.y}
                      r={cfg.radiusPx * 0.35}
                      fill="none"
                      stroke={ringColor}
                      strokeOpacity={0.55}
                      strokeWidth={1.2}
                    />
                    <text
                      x={ap.x}
                      y={ap.y - cfg.radiusPx - 6}
                      textAnchor="middle"
                      fill="#0E7490"
                      fontSize="11"
                      fontWeight="700"
                      style={{ paintOrder: 'stroke', stroke: '#F8FAFC', strokeWidth: '4px' }}
                    >
                      SSID: {cfg.ssid} ({cfg.security})
                      {cfg.interferenceLevel !== 'none' ? ` · Gangguan ${cfg.interferenceLevel}` : ''}
                    </text>
                  </g>
                );
              })}

              {/* Wireless Client Links */}
              {devices.map((dev) => {
                if (!dev.wifiClientConfig || !dev.wifiClientConfig.targetApId) return null;
                const ap = devices.find((a) => a.id === dev.wifiClientConfig?.targetApId);
                if (!ap) return null;
                const isConnected = dev.wifiClientConfig.connected;
                const lx = ap.x + (dev.x - ap.x) * 0.6;
                const ly = ap.y + (dev.y - ap.y) * 0.6;
                return (
                  <g key={`wlink-${dev.id}`} className="pointer-events-none">
                    <line
                      x1={ap.x}
                      y1={ap.y}
                      x2={dev.x}
                      y2={dev.y}
                      stroke={isConnected ? '#10B981' : '#EF4444'}
                      strokeWidth={2}
                      strokeDasharray={isConnected ? '5 4' : '3 5'}
                      strokeOpacity={isConnected ? 0.85 : 0.65}
                    />
                    <text
                      x={lx}
                      y={ly - 6}
                      textAnchor="middle"
                      fill={isConnected ? '#047857' : '#B91C1C'}
                      fontSize="10"
                      fontWeight="700"
                      style={{ paintOrder: 'stroke', stroke: '#F8FAFC', strokeWidth: '4px' }}
                    >
                      {isConnected
                        ? `WiFi ${dev.wifiClientConfig.signalPercent}%`
                        : 'Terputus'}
                    </text>
                  </g>
                );
              })}

              {/* Wired UTP Connections */}
              {connections.map((conn) => {
                const from = devices.find((d) => d.id === conn.fromDeviceId);
                const to = devices.find((d) => d.id === conn.toDeviceId);
                if (!from || !to) return null;
                const isSelected = selectedConnectionId === conn.id;
                const strokeColor = !conn.isValid
                  ? '#DC2626'
                  : conn.cableType === 'straight'
                  ? '#0891B2'
                  : '#D97706';
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                const fromPort = from.ports.find((p) => p.id === conn.fromPortId)?.label ?? '';
                const toPort = to.ports.find((p) => p.id === conn.toPortId)?.label ?? '';

                return (
                  <g
                    key={conn.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConnectionId(conn.id);
                      setSelectedDeviceId(null);
                    }}
                    className="cursor-pointer"
                  >
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="transparent"
                      strokeWidth={14}
                    />
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 4.5 : 3}
                      strokeDasharray={
                        !conn.isValid ? '6 4' : conn.cableType === 'crossover' ? '9 4' : undefined
                      }
                    />
                    <rect
                      x={midX - 36}
                      y={midY - 9}
                      width="72"
                      height="18"
                      rx="4"
                      fill={!conn.isValid ? '#FEF2F2' : '#FFFFFF'}
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 3}
                      textAnchor="middle"
                      fill={!conn.isValid ? '#B91C1C' : '#0F172A'}
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {!conn.isValid
                        ? 'Kabel Salah!'
                        : `${conn.cableType === 'straight' ? 'Straight' : 'Cross'}`}
                    </text>
                    <text
                      x={from.x + (to.x - from.x) * 0.31}
                      y={from.y + (to.y - from.y) * 0.31 - 5}
                      textAnchor="middle"
                      fill="#334155"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                      style={{ paintOrder: 'stroke', stroke: '#F8FAFC', strokeWidth: '3.5px' }}
                    >
                      {fromPort}
                    </text>
                    <text
                      x={to.x + (from.x - to.x) * 0.31}
                      y={to.y + (from.y - to.y) * 0.31 - 5}
                      textAnchor="middle"
                      fill="#334155"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                      style={{ paintOrder: 'stroke', stroke: '#F8FAFC', strokeWidth: '3.5px' }}
                    >
                      {toPort}
                    </text>
                  </g>
                );
              })}

              {/* Placed Network Devices */}
              {devices.map((dev) => {
                const isSelected = selectedDeviceId === dev.id;
                const isCableSource = pendingCableSource?.deviceId === dev.id;
                const hasConflict = Boolean(ipConflicts[dev.id]);
                const effectiveIp =
                  dev.type === 'access_point' && dev.wifiApConfig
                    ? dev.wifiApConfig.apIp
                    : dev.ipConfig.ip;
                const ipValid = validateDeviceIpConfig(
                  dev.type === 'access_point' && dev.wifiApConfig
                    ? { ...dev.ipConfig, ip: dev.wifiApConfig.apIp, subnetMask: dev.wifiApConfig.subnetMask }
                    : dev.ipConfig,
                  dev.type
                ).valid;

                return (
                  <g
                    key={dev.id}
                    transform={`translate(${dev.x}, ${dev.y})`}
                    onPointerDown={(e) => handleNodePointerDown(e, dev)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (toolMode === 'cable') {
                        handleNodeClickInCableMode(dev);
                      } else {
                        setSelectedDeviceId(dev.id);
                        setSelectedConnectionId(null);
                      }
                    }}
                    className={toolMode === 'cable' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}
                  >
                    <rect
                      x="-36"
                      y="-32"
                      width="72"
                      height="64"
                      rx="10"
                      fill="#FFFFFF"
                      stroke={
                        isCableSource
                          ? '#0891B2'
                          : hasConflict
                          ? '#DC2626'
                          : isSelected
                          ? '#0F172A'
                          : '#CBD5E1'
                      }
                      strokeWidth={isSelected || isCableSource || hasConflict ? 2.5 : 1.5}
                    />
                    <g transform="translate(-24, -26)">
                      <DeviceIllustration
                        type={dev.type}
                        size={48}
                        active={
                          dev.wifiClientConfig ? dev.wifiClientConfig.connected : ipValid && !hasConflict
                        }
                      />
                    </g>

                    {/* Device Name & IP Pill-free Crisp Label */}
                    <text
                      x="0"
                      y="45"
                      textAnchor="middle"
                      fill="#0F172A"
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {dev.name}
                    </text>
                    {dev.type !== 'switch' && (
                      <text
                        x="0"
                        y="58"
                        textAnchor="middle"
                        fill={hasConflict ? '#DC2626' : ipValid ? '#0E7490' : '#64748B'}
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="600"
                      >
                        {hasConflict
                          ? `${effectiveIp} (Konflik)`
                          : effectiveIp || (dev.wifiClientConfig ? 'Belum ada IP' : 'IP kosong')}
                      </text>
                    )}

                    {/* WiFi Client Status Badge inside Node */}
                    {dev.wifiClientConfig && (
                      <text
                        x="0"
                        y="-38"
                        textAnchor="middle"
                        fill={dev.wifiClientConfig.connected ? '#059669' : '#DC2626'}
                        fontSize="9.5"
                        fontWeight="700"
                      >
                        {dev.wifiClientConfig.connected
                          ? `Connected (${dev.wifiClientConfig.signalPercent}%)`
                          : 'Disconnected'}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Animated Ping Data Packet */}
              {packetAnim && packetPos && (
                <g transform={`translate(${packetPos.x}, ${packetPos.y})`} className="pointer-events-none">
                  <circle
                    r="11"
                    fill={packetAnim.success ? '#10B981' : '#EF4444'}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    fill={packetAnim.success ? '#047857' : '#B91C1C'}
                    fontSize="10"
                    fontWeight="800"
                  >
                    {packetAnim.label}
                  </text>
                </g>
              )}

              {/* Empty state message */}
              {devices.length === 0 && (
                <text
                  x={CANVAS_WIDTH / 2}
                  y={CANVAS_HEIGHT / 2}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="14"
                  fontWeight="600"
                >
                  Seret atau klik perangkat dari Katalog di sebelah kiri untuk memulai perakitan jaringan.
                </text>
              )}
            </svg>

            {/* Selected Cable Floating Inspector Bar */}
            {selectedConnection && (
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 px-4 py-2.5 text-xs shadow-md backdrop-blur">
                <div className="flex items-center gap-2">
                  {selectedConnection.isValid ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span className="font-medium text-slate-800">
                    {selectedConnection.validationMessage}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteConnection(selectedConnection.id)}
                  className="inline-flex items-center gap-1 rounded bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Lepas Kabel
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: Configuration, Ping Testing, & Mission Tracker */}
        <aside
          aria-label="Panel konfigurasi dan pengujian jaringan"
          className="flex flex-col rounded-xl border border-slate-200 bg-white xl:col-span-3"
        >
          <div className="flex border-b border-slate-200 p-1.5">
            {activeMission && (
              <button
                type="button"
                onClick={() => setRightTab('mission')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                  rightTab === 'mission'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Misi
              </button>
            )}
            <button
              type="button"
              onClick={() => setRightTab('config')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                rightTab === 'config'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Konfigurasi
            </button>
            <button
              type="button"
              onClick={() => setRightTab('ping')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
                rightTab === 'ping'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Uji Ping &amp; Log
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 xl:max-h-[540px]">
            {/* TAB 1: KONFIGURASI PERANGKAT */}
            {rightTab === 'config' && (
              <>
                {!selectedDevice ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Klik salah satu perangkat di kanvas untuk mengatur IP Address, Subnet Mask, Gateway, DNS, atau pengaturan WiFi.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <DeviceIllustration type={selectedDevice.type} size={36} />
                        <div>
                          <input
                            type="text"
                            aria-label="Nama perangkat"
                            value={selectedDevice.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDevicesWithWifi((prev) =>
                                prev.map((d) => (d.id === selectedDevice.id ? { ...d, name: val } : d))
                              );
                            }}
                            className="w-full rounded border border-transparent px-1 py-0.5 font-display text-sm font-bold text-slate-900 hover:border-slate-300 focus:border-cyan-600 focus:outline-none"
                          />
                          <p className="px-1 text-[11px] text-slate-500">
                            {getCatalogItem(selectedDevice.type)?.name}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDevice(selectedDevice.id)}
                        aria-label={`Hapus ${selectedDevice.name}`}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Conflict Warning */}
                    {ipConflicts[selectedDevice.id] && (
                      <div className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <span>{ipConflicts[selectedDevice.id][0]}</span>
                      </div>
                    )}

                    {/* Switch Info */}
                    {selectedDevice.type === 'switch' && (
                      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                        <p className="font-semibold text-slate-900">Switch Layer 2 (8 Port)</p>
                        <p>
                          Switch meneruskan frame Ethernet dalam jaringan LAN lokal tanpa memerlukan konfigurasi IP Address pada port host.
                        </p>
                        <div className="mt-2 grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                          {selectedDevice.ports.map((p) => {
                            const used = connections.some(
                              (c) =>
                                (c.fromDeviceId === selectedDevice.id && c.fromPortId === p.id) ||
                                (c.toDeviceId === selectedDevice.id && c.toPortId === p.id)
                            );
                            return (
                              <span
                                key={p.id}
                                className={`rounded border px-1.5 py-1 text-center ${
                                  used
                                    ? 'border-emerald-300 bg-emerald-50 font-bold text-emerald-800'
                                    : 'border-slate-200 bg-white text-slate-500'
                                }`}
                              >
                                {p.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Access Point WiFi Configuration (Fitur 5) */}
                    {selectedDevice.type === 'access_point' && selectedDevice.wifiApConfig && (
                      <div className="space-y-3">
                        <h3 className="font-display text-xs font-bold text-slate-900">
                          Pengaturan Wireless Access Point
                        </h3>

                        <div>
                          <label htmlFor="ap-ssid" className="block text-xs font-medium text-slate-700">
                            Nama Jaringan (SSID)
                          </label>
                          <input
                            id="ap-ssid"
                            type="text"
                            value={selectedDevice.wifiApConfig.ssid}
                            onChange={(e) => {
                              const ssid = e.target.value;
                              updateDevicesWithWifi((prev) =>
                                prev.map((d) =>
                                  d.id === selectedDevice.id && d.wifiApConfig
                                    ? { ...d, wifiApConfig: { ...d.wifiApConfig, ssid } }
                                    : d
                                )
                              );
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs focus:border-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="ap-sec" className="block text-xs font-medium text-slate-700">
                              Keamanan
                            </label>
                            <select
                              id="ap-sec"
                              value={selectedDevice.wifiApConfig.security}
                              onChange={(e) => {
                                const security = e.target.value as WifiSecurity;
                                updateDevicesWithWifi((prev) =>
                                  prev.map((d) =>
                                    d.id === selectedDevice.id && d.wifiApConfig
                                      ? { ...d, wifiApConfig: { ...d.wifiApConfig, security } }
                                      : d
                                  )
                                );
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-cyan-600 focus:outline-none"
                            >
                              <option value="WPA2">WPA2</option>
                              <option value="WPA3">WPA3</option>
                              <option value="Open">Open (Tanpa Sandi)</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="ap-pass" className="block text-xs font-medium text-slate-700">
                              Password WiFi
                            </label>
                            <input
                              id="ap-pass"
                              type="text"
                              disabled={selectedDevice.wifiApConfig.security === 'Open'}
                              value={selectedDevice.wifiApConfig.password}
                              onChange={(e) => {
                                const password = e.target.value;
                                updateDevicesWithWifi((prev) =>
                                  prev.map((d) =>
                                    d.id === selectedDevice.id && d.wifiApConfig
                                      ? { ...d, wifiApConfig: { ...d.wifiApConfig, password } }
                                      : d
                                  )
                                );
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs disabled:bg-slate-100 focus:border-cyan-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="ap-radius" className="flex justify-between text-xs font-medium text-slate-700">
                            <span>Radius Jangkauan Sinyal</span>
                            <span className="font-mono text-cyan-700">{selectedDevice.wifiApConfig.radiusPx}px</span>
                          </label>
                          <input
                            id="ap-radius"
                            type="range"
                            min={100}
                            max={280}
                            value={selectedDevice.wifiApConfig.radiusPx}
                            onChange={(e) => {
                              const radiusPx = Number(e.target.value);
                              updateDevicesWithWifi((prev) =>
                                prev.map((d) =>
                                  d.id === selectedDevice.id && d.wifiApConfig
                                    ? { ...d, wifiApConfig: { ...d.wifiApConfig, radiusPx } }
                                    : d
                                )
                              );
                            }}
                            className="mt-1 w-full accent-cyan-600"
                          />
                        </div>

                        <div>
                          <label htmlFor="ap-interf" className="block text-xs font-medium text-slate-700">
                            Simulasi Gangguan / Interferensi Sinyal
                          </label>
                          <select
                            id="ap-interf"
                            value={selectedDevice.wifiApConfig.interferenceLevel}
                            onChange={(e) => {
                              const interferenceLevel = e.target.value as 'none' | 'medium' | 'high';
                              updateDevicesWithWifi((prev) =>
                                prev.map((d) =>
                                  d.id === selectedDevice.id && d.wifiApConfig
                                    ? {
                                        ...d,
                                        wifiApConfig: { ...d.wifiApConfig, interferenceLevel },
                                      }
                                    : d
                                )
                              );
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-cyan-600 focus:outline-none"
                          >
                            <option value="none">Normal (Tanpa Gangguan)</option>
                            <option value="medium">Gangguan Sedang (Tembok Tebal)</option>
                            <option value="high">Gangguan Berat (Interferensi Tinggi)</option>
                          </select>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">IP Access Point &amp; DHCP</span>
                            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={selectedDevice.wifiApConfig.dhcpEnabled}
                                onChange={(e) => {
                                  const dhcpEnabled = e.target.checked;
                                  updateDevicesWithWifi((prev) =>
                                    prev.map((d) =>
                                      d.id === selectedDevice.id && d.wifiApConfig
                                        ? { ...d, wifiApConfig: { ...d.wifiApConfig, dhcpEnabled } }
                                        : d
                                    )
                                  );
                                }}
                                className="accent-cyan-600"
                              />
                              Aktifkan DHCP
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor="ap-ip" className="block text-[11px] text-slate-600">IP AP</label>
                              <input
                                id="ap-ip"
                                type="text"
                                value={selectedDevice.wifiApConfig.apIp}
                                onChange={(e) => {
                                  const apIp = e.target.value;
                                  updateDevicesWithWifi((prev) =>
                                    prev.map((d) =>
                                      d.id === selectedDevice.id && d.wifiApConfig
                                        ? { ...d, wifiApConfig: { ...d.wifiApConfig, apIp } }
                                        : d
                                    )
                                  );
                                }}
                                className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label htmlFor="ap-mask" className="block text-[11px] text-slate-600">Subnet Mask</label>
                              <input
                                id="ap-mask"
                                type="text"
                                value={selectedDevice.wifiApConfig.subnetMask}
                                onChange={(e) => {
                                  const subnetMask = e.target.value;
                                  updateDevicesWithWifi((prev) =>
                                    prev.map((d) =>
                                      d.id === selectedDevice.id && d.wifiApConfig
                                        ? { ...d, wifiApConfig: { ...d.wifiApConfig, subnetMask } }
                                        : d
                                    )
                                  );
                                }}
                                className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label htmlFor="ap-dhcp-start" className="block text-[11px] text-slate-600">DHCP Start</label>
                              <input
                                id="ap-dhcp-start"
                                type="text"
                                value={selectedDevice.wifiApConfig.dhcpStart}
                                onChange={(e) => {
                                  const dhcpStart = e.target.value;
                                  updateDevicesWithWifi((prev) =>
                                    prev.map((d) =>
                                      d.id === selectedDevice.id && d.wifiApConfig
                                        ? { ...d, wifiApConfig: { ...d.wifiApConfig, dhcpStart } }
                                        : d
                                    )
                                  );
                                }}
                                className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label htmlFor="ap-dhcp-end" className="block text-[11px] text-slate-600">DHCP End</label>
                              <input
                                id="ap-dhcp-end"
                                type="text"
                                value={selectedDevice.wifiApConfig.dhcpEnd}
                                onChange={(e) => {
                                  const dhcpEnd = e.target.value;
                                  updateDevicesWithWifi((prev) =>
                                    prev.map((d) =>
                                      d.id === selectedDevice.id && d.wifiApConfig
                                        ? { ...d, wifiApConfig: { ...d.wifiApConfig, dhcpEnd } }
                                        : d
                                    )
                                  );
                                }}
                                className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WiFi Client Settings (Laptop / Smartphone) */}
                    {selectedDevice.wifiClientConfig && (
                      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-xs font-bold text-slate-900">
                            Koneksi Nirkabel (WiFi)
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold ${
                              selectedDevice.wifiClientConfig.connected
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {selectedDevice.wifiClientConfig.connected ? (
                              <>
                                <Wifi className="h-3.5 w-3.5" />
                                Connected ({selectedDevice.wifiClientConfig.signalPercent}%)
                              </>
                            ) : (
                              <>
                                <WifiOff className="h-3.5 w-3.5" />
                                Disconnected
                              </>
                            )}
                          </span>
                        </div>

                        <div>
                          <label htmlFor="wifi-ap-select" className="block text-[11px] font-medium text-slate-600">
                            Pilih Access Point
                          </label>
                          <select
                            id="wifi-ap-select"
                            value={selectedDevice.wifiClientConfig.targetApId ?? ''}
                            onChange={(e) => {
                              const apId = e.target.value || null;
                              const ap = aps.find((a) => a.id === apId);
                              updateDevicesWithWifi((prev) =>
                                prev.map((d) =>
                                  d.id === selectedDevice.id && d.wifiClientConfig
                                    ? {
                                        ...d,
                                        wifiClientConfig: {
                                          ...d.wifiClientConfig,
                                          targetApId: apId,
                                          targetSsid: ap?.wifiApConfig?.ssid ?? d.wifiClientConfig.targetSsid,
                                        },
                                      }
                                    : d
                                )
                              );
                            }}
                            className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                          >
                            <option value="">-- Tidak terhubung --</option>
                            {aps.map((ap) => (
                              <option key={ap.id} value={ap.id}>
                                {ap.name} ({ap.wifiApConfig?.ssid})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label htmlFor="wifi-ssid-input" className="block text-[11px] font-medium text-slate-600">
                              SSID Tujuan
                            </label>
                            <input
                              id="wifi-ssid-input"
                              type="text"
                              value={selectedDevice.wifiClientConfig.targetSsid}
                              onChange={(e) => {
                                const targetSsid = e.target.value;
                                updateDevicesWithWifi((prev) =>
                                  prev.map((d) =>
                                    d.id === selectedDevice.id && d.wifiClientConfig
                                      ? {
                                          ...d,
                                          wifiClientConfig: { ...d.wifiClientConfig, targetSsid },
                                        }
                                      : d
                                  )
                                );
                              }}
                              className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor="wifi-pass-input" className="block text-[11px] font-medium text-slate-600">
                              Password WiFi
                            </label>
                            <input
                              id="wifi-pass-input"
                              type="text"
                              value={selectedDevice.wifiClientConfig.enteredPassword}
                              onChange={(e) => {
                                const enteredPassword = e.target.value;
                                updateDevicesWithWifi((prev) =>
                                  prev.map((d) =>
                                    d.id === selectedDevice.id && d.wifiClientConfig
                                      ? {
                                          ...d,
                                          wifiClientConfig: {
                                            ...d.wifiClientConfig,
                                            enteredPassword,
                                          },
                                        }
                                      : d
                                  )
                                );
                              }}
                              className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600">
                          {selectedDevice.wifiClientConfig.statusReason}
                          {selectedDevice.wifiClientConfig.connected &&
                            ` (${selectedDevice.wifiClientConfig.signalDbm} dBm)`}
                        </p>
                      </div>
                    )}

                    {/* Standard IPv4 Configuration (Fitur 4) */}
                    {selectedDevice.type !== 'switch' && selectedDevice.type !== 'access_point' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-xs font-bold text-slate-900">
                            Konfigurasi IPv4
                          </h3>
                          <div className="flex rounded-md bg-slate-100 p-0.5">
                            {(['static', 'dhcp'] as const).map((ipMode) => (
                              <button
                                key={ipMode}
                                type="button"
                                onClick={() => {
                                  updateDevicesWithWifi((prev) =>
                                    prev.map((d) =>
                                      d.id === selectedDevice.id
                                        ? { ...d, ipConfig: { ...d.ipConfig, mode: ipMode } }
                                        : d
                                    )
                                  );
                                }}
                                className={`rounded px-2.5 py-1 text-[11px] font-semibold uppercase ${
                                  selectedDevice.ipConfig.mode === ipMode
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600'
                                }`}
                              >
                                {ipMode}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(() => {
                          const ipValidation = validateDeviceIpConfig(
                            selectedDevice.ipConfig,
                            selectedDevice.type
                          );
                          return !ipValidation.valid ? (
                            <div className="rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-950">
                              {ipValidation.reason}
                            </div>
                          ) : null;
                        })()}

                        <div>
                          <label htmlFor="cfg-ip" className="block text-xs font-medium text-slate-700">
                            IP Address
                          </label>
                          <input
                            id="cfg-ip"
                            type="text"
                            disabled={selectedDevice.ipConfig.mode === 'dhcp'}
                            value={selectedDevice.ipConfig.ip}
                            placeholder="Contoh: 192.168.1.2"
                            onChange={(e) => {
                              const ip = e.target.value;
                              updateDevicesWithWifi((prev) =>
                                prev.map((d) =>
                                  d.id === selectedDevice.id
                                    ? { ...d, ipConfig: { ...d.ipConfig, ip } }
                                    : d
                                )
                              );
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs disabled:bg-slate-100 focus:border-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="cfg-mask" className="block text-xs font-medium text-slate-700">
                            Subnet Mask
                          </label>
                          <input
                            id="cfg-mask"
                            type="text"
                            disabled={selectedDevice.ipConfig.mode === 'dhcp'}
                            value={selectedDevice.ipConfig.subnetMask}
                            placeholder="Contoh: 255.255.255.0"
                            onChange={(e) => {
                              const subnetMask = e.target.value;
                              updateDevicesWithWifi((prev) =>
                                prev.map((d) =>
                                  d.id === selectedDevice.id
                                    ? { ...d, ipConfig: { ...d.ipConfig, subnetMask } }
                                    : d
                                )
                              );
                            }}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs disabled:bg-slate-100 focus:border-cyan-600 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label htmlFor="cfg-gw" className="block text-xs font-medium text-slate-700">
                              Default Gateway
                            </label>
                            <input
                              id="cfg-gw"
                              type="text"
                              disabled={selectedDevice.ipConfig.mode === 'dhcp'}
                              value={selectedDevice.ipConfig.gateway}
                              placeholder="192.168.1.1"
                              onChange={(e) => {
                                const gateway = e.target.value;
                                updateDevicesWithWifi((prev) =>
                                  prev.map((d) =>
                                    d.id === selectedDevice.id
                                      ? { ...d, ipConfig: { ...d.ipConfig, gateway } }
                                      : d
                                  )
                                );
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs disabled:bg-slate-100 focus:border-cyan-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label htmlFor="cfg-dns" className="block text-xs font-medium text-slate-700">
                              DNS Server
                            </label>
                            <input
                              id="cfg-dns"
                              type="text"
                              disabled={selectedDevice.ipConfig.mode === 'dhcp'}
                              value={selectedDevice.ipConfig.dns}
                              placeholder="8.8.8.8"
                              onChange={(e) => {
                                const dns = e.target.value;
                                updateDevicesWithWifi((prev) =>
                                  prev.map((d) =>
                                    d.id === selectedDevice.id
                                      ? { ...d, ipConfig: { ...d.ipConfig, dns } }
                                      : d
                                  )
                                );
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs disabled:bg-slate-100 focus:border-cyan-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        {selectedDevice.type === 'router' && selectedDevice.routerSecondIp && (
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                            <p className="text-[11px] font-bold text-slate-800">
                              Port WAN Router (Gi0/1)
                            </p>
                            <div className="mt-1.5 grid grid-cols-2 gap-2">
                              <div>
                                <label htmlFor="cfg-wan-ip" className="block text-[10px] text-slate-600">IP WAN</label>
                                <input
                                  id="cfg-wan-ip"
                                  type="text"
                                  value={selectedDevice.routerSecondIp.ip}
                                  onChange={(e) => {
                                    const ip = e.target.value;
                                    updateDevicesWithWifi((prev) =>
                                      prev.map((d) =>
                                        d.id === selectedDevice.id && d.routerSecondIp
                                          ? { ...d, routerSecondIp: { ...d.routerSecondIp, ip } }
                                          : d
                                      )
                                    );
                                  }}
                                  className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <label htmlFor="cfg-wan-mask" className="block text-[10px] text-slate-600">Subnet WAN</label>
                                <input
                                  id="cfg-wan-mask"
                                  type="text"
                                  value={selectedDevice.routerSecondIp.subnetMask}
                                  onChange={(e) => {
                                    const subnetMask = e.target.value;
                                    updateDevicesWithWifi((prev) =>
                                      prev.map((d) =>
                                        d.id === selectedDevice.id && d.routerSecondIp
                                          ? {
                                              ...d,
                                              routerSecondIp: { ...d.routerSecondIp, subnetMask },
                                            }
                                          : d
                                      )
                                    );
                                  }}
                                  className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: PENGUJIAN JARINGAN (PING & LOG AKTIVITAS) */}
            {rightTab === 'ping' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-display text-xs font-bold text-slate-900">
                    Uji Konektivitas Ping (ICMP)
                  </h3>

                  <div>
                    <label htmlFor="ping-src" className="block text-xs font-medium text-slate-700">
                      Perangkat Pengirim
                    </label>
                    <select
                      id="ping-src"
                      value={pingSourceId}
                      onChange={(e) => setPingSourceId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-cyan-600 focus:outline-none"
                    >
                      {devices
                        .filter((d) => d.type !== 'switch')
                        .map((d) => {
                          const ip =
                            d.type === 'access_point' ? d.wifiApConfig?.apIp : d.ipConfig.ip;
                          return (
                            <option key={d.id} value={d.id}>
                              {d.name} ({ip || 'Belum ada IP'})
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ping-target" className="block text-xs font-medium text-slate-700">
                      IP Address Tujuan
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        id="ping-target"
                        type="text"
                        value={pingTargetIp}
                        onChange={(e) => setPingTargetIp(e.target.value)}
                        placeholder="Contoh: 192.168.1.3"
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-xs focus:border-cyan-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRunPing()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700 whitespace-nowrap"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Ping
                      </button>
                    </div>
                  </div>

                  {/* Quick Ping Target Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {devices
                      .filter((d) => d.id !== pingSourceId && d.type !== 'switch')
                      .map((d) => {
                        const ip =
                          d.type === 'access_point' ? d.wifiApConfig?.apIp : d.ipConfig.ip;
                        if (!ip) return null;
                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => handleRunPing(ip)}
                            className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-cyan-500 hover:bg-cyan-50"
                          >
                            Tes → {d.name}
                          </button>
                        );
                      })}
                    {(() => {
                      const src = devices.find((d) => d.id === pingSourceId);
                      const gw = src?.ipConfig.gateway.trim();
                      if (!gw) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => handleRunPing(gw)}
                          className="rounded border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-800 hover:bg-cyan-100"
                        >
                          Tes Gateway ({gw})
                        </button>
                      );
                    })()}
                  </div>

                  {/* Ping Output Terminal */}
                  {lastPingResult && (
                    <div
                      data-testid="ping-result"
                      className={`rounded-lg border p-3 font-mono text-[11px] leading-relaxed ${
                        lastPingResult.success
                          ? 'border-emerald-300 bg-slate-900 text-emerald-300'
                          : 'border-rose-300 bg-slate-900 text-rose-300'
                      }`}
                    >
                      {lastPingResult.logs.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Network Activity Log */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Activity className="h-3.5 w-3.5 text-cyan-700" />
                    <span>Log Aktivitas Jaringan</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[11px]">
                    {logs.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-slate-700"
                      >
                        <span className="font-mono text-slate-400">[{entry.timestamp}] </span>
                        <span
                          className={
                            entry.type === 'error'
                              ? 'font-medium text-rose-700'
                              : entry.type === 'success'
                              ? 'font-medium text-emerald-700'
                              : entry.type === 'warning'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                          }
                        >
                          {entry.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: MISI PRAKTIK CHECKER */}
            {rightTab === 'mission' && activeMission && (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[11px] font-bold text-cyan-700">
                    Tingkat: {activeMission.difficulty} · Skor Maks {activeMission.maxScore}
                  </span>
                  <h3 className="mt-1 font-display text-sm font-bold text-slate-900">
                    Instruksi Kerja
                  </h3>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700">
                    {activeMission.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <h4 className="text-xs font-bold text-slate-900">Perangkat yang Dibutuhkan</h4>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                    {activeMission.requiredDevices.map((req, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Plus className="h-3 w-3 text-cyan-700" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleRunMissionCheck}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  Periksa Misi Sekarang
                </button>

                {missionEval && (
                  <div
                    data-testid="mission-evaluation"
                    className={`space-y-2.5 rounded-lg border p-3.5 text-xs ${
                      missionEval.passed
                        ? 'border-emerald-300 bg-emerald-50/70'
                        : 'border-amber-300 bg-amber-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">
                        {missionEval.passed ? 'Misi Berhasil!' : 'Perlu Perbaikan'}
                      </strong>
                      <span className="font-mono font-bold text-slate-900">
                        Skor: {missionEval.score}/{missionEval.maxScore}
                      </span>
                    </div>
                    <p className="text-slate-700">{missionEval.summaryFeedback}</p>
                    <ul className="space-y-1.5 border-t border-slate-200/70 pt-2">
                      {missionEval.checks.map((chk) => (
                        <li key={chk.id} className="flex items-start gap-2">
                          {chk.passed ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          ) : (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{chk.label}</p>
                            <p className="text-[11px] text-slate-600">{chk.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal Guide for RJ45 Connector */}
      {showRj45Guide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rj45-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="rj45-title" className="font-display text-lg font-bold text-slate-900">
                Standar Pinout Konektor RJ45 &amp; Kabel UTP
              </h2>
              <button
                type="button"
                onClick={() => setShowRj45Guide(false)}
                aria-label="Tutup panduan RJ45"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Konektor RJ45 mengunci 8 pin warna kabel UTP. Pastikan susunan warna sesuai sebelum melakukan crimping:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-mono font-bold text-cyan-700">T568B (Umum / Straight)</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-slate-700">
                  <li>Putih Oranye (Tx+)</li>
                  <li>Oranye (Tx-)</li>
                  <li>Putih Hijau (Rx+)</li>
                  <li>Biru</li>
                  <li>Putih Biru</li>
                  <li>Hijau (Rx-)</li>
                  <li>Putih Cokelat</li>
                  <li>Cokelat</li>
                </ol>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-mono font-bold text-amber-700">T568A (Pasangan Crossover)</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-slate-700">
                  <li>Putih Hijau (Rx+)</li>
                  <li>Hijau (Rx-)</li>
                  <li>Putih Oranye (Tx+)</li>
                  <li>Biru</li>
                  <li>Putih Biru</li>
                  <li>Oranye (Tx-)</li>
                  <li>Putih Cokelat</li>
                  <li>Cokelat</li>
                </ol>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRj45Guide(false)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700"
              >
                Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
