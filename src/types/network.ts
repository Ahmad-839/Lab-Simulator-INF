export type NavTab =
  | 'beranda'
  | 'belajar'
  | 'simulator_lan'
  | 'simulator_wifi'
  | 'misi'
  | 'evaluasi'
  | 'panduan'
  | 'identitas';

export type DeviceType =
  | 'pc'
  | 'laptop'
  | 'server'
  | 'switch'
  | 'router'
  | 'access_point'
  | 'modem'
  | 'printer'
  | 'smartphone';

export type CatalogItemId = DeviceType | 'utp_cable' | 'rj45_connector';

export type CableType = 'straight' | 'crossover';

export type WifiSecurity = 'WPA2' | 'WPA3' | 'Open';

export interface DevicePort {
  id: string;
  label: string;
  kind: 'eth' | 'wan' | 'lan' | 'wifi';
}

export interface IpConfig {
  mode: 'static' | 'dhcp';
  ip: string;
  subnetMask: string;
  gateway: string;
  dns: string;
}

export interface WifiApConfig {
  ssid: string;
  password: string;
  security: WifiSecurity;
  radiusPx: number;
  dhcpEnabled: boolean;
  dhcpStart: string;
  dhcpEnd: string;
  apIp: string;
  subnetMask: string;
  interferenceLevel: 'none' | 'medium' | 'high';
}

export interface WifiClientConfig {
  targetApId: string | null;
  targetSsid: string;
  enteredPassword: string;
  connected: boolean;
  signalPercent: number;
  signalDbm: number;
  statusReason: string;
}

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  ports: DevicePort[];
  ipConfig: IpConfig;
  /** Routers have a secondary LAN interface or WAN interface IP for inter-network routing */
  routerSecondIp?: IpConfig;
  wifiApConfig?: WifiApConfig;
  wifiClientConfig?: WifiClientConfig;
}

export interface NetworkConnection {
  id: string;
  fromDeviceId: string;
  fromPortId: string;
  toDeviceId: string;
  toPortId: string;
  cableType: CableType;
  isValid: boolean;
  validationMessage: string;
}

export interface PingResult {
  success: boolean;
  sourceId: string;
  targetIp: string;
  targetDeviceId: string | null;
  pathDeviceIds: string[];
  hops: number;
  latencyMs: number;
  ttl: number;
  logs: string[];
  reason: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface PacketAnimationState {
  id: string;
  pathDeviceIds: string[];
  success: boolean;
  label: string;
}

export interface CatalogItem {
  id: CatalogItemId;
  name: string;
  shortName: string;
  category: 'End Device' | 'Perangkat Jaringan' | 'Media Transmisi';
  description: string;
  functionSummary: string;
  portsSummary: string;
  tooltipDetail: string;
  isPlaceableNode: boolean;
  defaultPorts: DevicePort[];
  supportsWifiClient?: boolean;
  supportsWifiAp?: boolean;
}

export interface MissionCheckItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface MissionDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  difficulty: 'Dasar' | 'Menengah' | 'Lanjutan';
  instructions: string[];
  targets: string[];
  requiredDevices: string[];
  maxScore: number;
}

export interface MissionEvaluation {
  missionId: string;
  passed: boolean;
  score: number;
  maxScore: number;
  checks: MissionCheckItem[];
  summaryFeedback: string;
}

export interface StudentProgress {
  completedLessons: string[];
  completedMissions: Record<string, number>;
  quizBestScore: number | null;
  quizLastAttemptDate: string | null;
  totalLabsBuilt: number;
  successfulPings: number;
}
