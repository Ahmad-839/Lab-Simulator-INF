import { CatalogItem, DevicePort, DeviceType, IpConfig } from '../types/network';

export const DEVICE_CATALOG: CatalogItem[] = [
  {
    id: 'pc',
    name: 'PC / Komputer',
    shortName: 'PC',
    category: 'End Device',
    description: 'Komputer meja (desktop) dengan kartu jaringan Ethernet (NIC) untuk mengakses sumber daya LAN maupun internet.',
    functionSummary: 'Perangkat pengguna akhir (client) untuk mengirim dan menerima data melalui kabel UTP.',
    portsSummary: '1x Port FastEthernet (RJ45)',
    tooltipDetail: 'Gunakan kabel Straight untuk menghubungkan PC ke Switch, atau Crossover jika menghubungkan langsung PC ke PC.',
    isPlaceableNode: true,
    defaultPorts: [{ id: 'eth0', label: 'Eth0', kind: 'eth' }],
  },
  {
    id: 'laptop',
    name: 'Laptop',
    shortName: 'Laptop',
    category: 'End Device',
    description: 'Komputer portabel yang memiliki port LAN kabel serta adaptor WiFi (WLAN) bawaan.',
    functionSummary: 'Dapat terhubung ke jaringan lokal via kabel UTP maupun secara nirkabel ke Access Point.',
    portsSummary: '1x Port Ethernet (RJ45) + 1x Modul WiFi',
    tooltipDetail: 'Laptop mendukung koneksi kabel ke Switch sekaligus koneksi nirkabel (SSID) ke Access Point atau Router Wireless.',
    isPlaceableNode: true,
    supportsWifiClient: true,
    defaultPorts: [
      { id: 'eth0', label: 'Eth0', kind: 'eth' },
      { id: 'wlan0', label: 'WiFi', kind: 'wifi' },
    ],
  },
  {
    id: 'server',
    name: 'Server',
    shortName: 'Server',
    category: 'End Device',
    description: 'Komputer berperforma tinggi yang menyediakan layanan jaringan seperti web, file sharing, DNS, atau database.',
    functionSummary: 'Melayani permintaan data dari PC klien di jaringan laboratorium atau sekolah.',
    portsSummary: '2x Port GigabitEthernet (RJ45)',
    tooltipDetail: 'Server biasanya menggunakan IP Address Static (misalnya 192.168.1.10) agar mudah diakses oleh seluruh klien.',
    isPlaceableNode: true,
    defaultPorts: [
      { id: 'eth0', label: 'Eth0', kind: 'eth' },
      { id: 'eth1', label: 'Eth1', kind: 'eth' },
    ],
  },
  {
    id: 'switch',
    name: 'Switch',
    shortName: 'Switch',
    category: 'Perangkat Jaringan',
    description: 'Perangkat Layer 2 yang menghubungkan banyak perangkat dalam satu jaringan LAN menggunakan alamat MAC.',
    functionSummary: 'Menjadi pusat penghubung topologi Star untuk meneruskan paket data hanya ke port tujuan.',
    portsSummary: '8x Port FastEthernet (Fa0/1 – Fa0/8)',
    tooltipDetail: 'Hubungkan PC, Server, Printer, atau Router ke port Switch menggunakan kabel Straight.',
    isPlaceableNode: true,
    defaultPorts: [
      { id: 'fa1', label: 'Fa0/1', kind: 'eth' },
      { id: 'fa2', label: 'Fa0/2', kind: 'eth' },
      { id: 'fa3', label: 'Fa0/3', kind: 'eth' },
      { id: 'fa4', label: 'Fa0/4', kind: 'eth' },
      { id: 'fa5', label: 'Fa0/5', kind: 'eth' },
      { id: 'fa6', label: 'Fa0/6', kind: 'eth' },
      { id: 'fa7', label: 'Fa0/7', kind: 'eth' },
      { id: 'fa8', label: 'Fa0/8', kind: 'eth' },
    ],
  },
  {
    id: 'router',
    name: 'Router',
    shortName: 'Router',
    category: 'Perangkat Jaringan',
    description: 'Perangkat Layer 3 yang menghubungkan dua atau lebih jaringan berbeda (misal LAN Lab ke WAN/Internet) serta menjadi Default Gateway.',
    functionSummary: 'Mengatur rute paket antarjaringan berbeda segmen IP dan menyediakan fungsi Gateway/DHCP.',
    portsSummary: '2x Port LAN/WAN (Gi0/0, Gi0/1) + Opsional Wireless',
    tooltipDetail: 'Port LAN Router (misal 192.168.1.1) menjadi Default Gateway bagi komputer di dalam jaringan LAN.',
    isPlaceableNode: true,
    supportsWifiAp: false,
    defaultPorts: [
      { id: 'gi0', label: 'Gi0/0 (LAN)', kind: 'lan' },
      { id: 'gi1', label: 'Gi0/1 (WAN)', kind: 'wan' },
    ],
  },
  {
    id: 'access_point',
    name: 'Access Point',
    shortName: 'Access Point',
    category: 'Perangkat Jaringan',
    description: 'Perangkat pemancar sinyal WiFi (WLAN) yang menjembatani perangkat nirkabel ke jaringan LAN kabel.',
    functionSummary: 'Memancarkan SSID WiFi dengan keamanan WPA2/WPA3 untuk menghubungkan Laptop dan Smartphone.',
    portsSummary: '1x Port Uplink Ethernet (RJ45) + Antena WiFi',
    tooltipDetail: 'Klik Access Point untuk mengatur SSID, Password, Keamanan WPA2/WPA3, DHCP, dan jangkauan sinyal.',
    isPlaceableNode: true,
    supportsWifiAp: true,
    defaultPorts: [
      { id: 'eth0', label: 'Uplink', kind: 'eth' },
      { id: 'wlan0', label: 'WLAN', kind: 'wifi' },
    ],
  },
  {
    id: 'modem',
    name: 'Modem',
    shortName: 'Modem',
    category: 'Perangkat Jaringan',
    description: 'Modulator-Demodulator yang mengubah sinyal ISP (fiber/ADSL) menjadi sinyal digital Ethernet untuk jaringan lokal.',
    functionSummary: 'Gerbang fisik pertama dari penyedia layanan internet (ISP) sebelum masuk ke Router.',
    portsSummary: '1x Port WAN/ISP + 1x Port Ethernet ke Router',
    tooltipDetail: 'Hubungkan port Ethernet Modem ke port WAN Router menggunakan kabel Straight.',
    isPlaceableNode: true,
    defaultPorts: [
      { id: 'eth0', label: 'LAN->Router', kind: 'eth' },
      { id: 'wan0', label: 'Line ISP', kind: 'wan' },
    ],
  },
  {
    id: 'printer',
    name: 'Printer Jaringan',
    shortName: 'Printer',
    category: 'End Device',
    description: 'Printer dengan antarmuka jaringan Ethernet agar dapat digunakan bersama oleh semua komputer di LAN.',
    functionSummary: 'Menerima tugas cetak dari komputer mana saja yang berada dalam satu jaringan.',
    portsSummary: '1x Port Ethernet (RJ45)',
    tooltipDetail: 'Berikan IP Address Static pada Printer Jaringan agar komputer selalu dapat menemukannya.',
    isPlaceableNode: true,
    defaultPorts: [{ id: 'eth0', label: 'Eth0', kind: 'eth' }],
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    shortName: 'HP / Ponsel',
    category: 'End Device',
    description: 'Perangkat seluler yang terhubung ke jaringan lokal melalui gelombang radio WiFi.',
    functionSummary: 'Klien nirkabel yang mendapatkan IP melalui DHCP setelah terhubung ke SSID Access Point.',
    portsSummary: '1x Modul WiFi (802.11ac/ax)',
    tooltipDetail: 'Smartphone tidak memiliki port RJ45; hubungkan ke Access Point dengan memasukkan SSID dan Password yang sesuai.',
    isPlaceableNode: true,
    supportsWifiClient: true,
    defaultPorts: [{ id: 'wlan0', label: 'WiFi', kind: 'wifi' }],
  },
  {
    id: 'utp_cable',
    name: 'Kabel UTP (Cat5e/Cat6)',
    shortName: 'Kabel UTP',
    category: 'Media Transmisi',
    description: 'Kabel Unshielded Twisted Pair berisi 8 helai kabel tembaga berpasangan untuk transmisi data jaringan LAN.',
    functionSummary: 'Media penghantar sinyal listrik antarport RJ45 (tersedia mode Straight-Through & Crossover).',
    portsSummary: 'Mendukung Straight (T568B–T568B) & Crossover (T568A–T568B)',
    tooltipDetail: 'Klik untuk mengaktifkan Mode Tarik Kabel di kanvas, lalu pilih tipe Straight atau Crossover.',
    isPlaceableNode: false,
    defaultPorts: [],
  },
  {
    id: 'rj45_connector',
    name: 'Konektor RJ45',
    shortName: 'Konektor RJ45',
    category: 'Media Transmisi',
    description: 'Konektor modular 8-pin (8P8C) yang dipasang pada ujung kabel UTP menggunakan tang crimping.',
    functionSummary: 'Mengunci urutan 8 pin warna kabel UTP agar dapat dicolokkan ke port NIC, Switch, atau Router.',
    portsSummary: '8 Pin T568A / T568B Standar IEEE 802.3',
    tooltipDetail: 'Pin 1–2 (Transmit) dan Pin 3–6 (Receive) merupakan jalur utama komunikasi Ethernet 100Mbps.',
    isPlaceableNode: false,
    defaultPorts: [],
  },
];

export function getCatalogItem(id: string): CatalogItem | undefined {
  return DEVICE_CATALOG.find((item) => item.id === id);
}

export function createDefaultIpConfig(type: DeviceType, indexHint: number): IpConfig {
  const hostOctet = Math.min(250, Math.max(2, indexHint + 1));
  if (type === 'router') {
    return {
      mode: 'static',
      ip: '192.168.1.1',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dns: '8.8.8.8',
    };
  }
  if (type === 'modem') {
    return {
      mode: 'static',
      ip: '10.0.0.1',
      subnetMask: '255.255.255.0',
      gateway: '10.0.0.1',
      dns: '8.8.8.8',
    };
  }
  if (type === 'switch') {
    return {
      mode: 'static',
      ip: '',
      subnetMask: '255.255.255.0',
      gateway: '',
      dns: '',
    };
  }
  if (type === 'access_point') {
    return {
      mode: 'static',
      ip: '192.168.1.254',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dns: '8.8.8.8',
    };
  }
  if (type === 'server') {
    return {
      mode: 'static',
      ip: `192.168.1.${Math.min(250, 10 + indexHint)}`,
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dns: '8.8.8.8',
    };
  }
  if (type === 'smartphone') {
    return {
      mode: 'dhcp',
      ip: '',
      subnetMask: '',
      gateway: '',
      dns: '',
    };
  }
  return {
    mode: 'static',
    ip: `192.168.1.${hostOctet}`,
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
  };
}

export function clonePorts(ports: DevicePort[]): DevicePort[] {
  return ports.map((p) => ({ ...p }));
}
