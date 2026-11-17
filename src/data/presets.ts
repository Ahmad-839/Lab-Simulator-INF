import { NetworkConnection, NetworkDevice } from '../types/network';
import { clonePorts } from './catalog';
import { getCatalogItem } from './catalog';

export function createLanStarterTopology(): {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
} {
  const pcCat = getCatalogItem('pc')!;
  const swCat = getCatalogItem('switch')!;
  const rCat = getCatalogItem('router')!;

  const devices: NetworkDevice[] = [
    {
      id: 'dev-router-1',
      type: 'router',
      name: 'Router Gateway',
      x: 430,
      y: 95,
      ports: clonePorts(rCat.defaultPorts),
      ipConfig: {
        mode: 'static',
        ip: '192.168.1.1',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: '8.8.8.8',
      },
      routerSecondIp: {
        mode: 'static',
        ip: '10.0.0.2',
        subnetMask: '255.255.255.0',
        gateway: '10.0.0.1',
        dns: '8.8.8.8',
      },
    },
    {
      id: 'dev-switch-1',
      type: 'switch',
      name: 'Switch Lab',
      x: 430,
      y: 250,
      ports: clonePorts(swCat.defaultPorts),
      ipConfig: {
        mode: 'static',
        ip: '',
        subnetMask: '255.255.255.0',
        gateway: '',
        dns: '',
      },
    },
    {
      id: 'dev-pc-1',
      type: 'pc',
      name: 'PC 1',
      x: 185,
      y: 415,
      ports: clonePorts(pcCat.defaultPorts),
      ipConfig: {
        mode: 'static',
        ip: '192.168.1.2',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: '8.8.8.8',
      },
    },
    {
      id: 'dev-pc-2',
      type: 'pc',
      name: 'PC 2',
      x: 430,
      y: 415,
      ports: clonePorts(pcCat.defaultPorts),
      ipConfig: {
        mode: 'static',
        ip: '192.168.1.3',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: '8.8.8.8',
      },
    },
    {
      id: 'dev-pc-3',
      type: 'pc',
      name: 'PC 3',
      x: 675,
      y: 415,
      ports: clonePorts(pcCat.defaultPorts),
      ipConfig: {
        mode: 'static',
        ip: '192.168.1.4',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: '8.8.8.8',
      },
    },
  ];

  const connections: NetworkConnection[] = [
    {
      id: 'conn-1',
      fromDeviceId: 'dev-router-1',
      fromPortId: 'gi0',
      toDeviceId: 'dev-switch-1',
      toPortId: 'fa1',
      cableType: 'straight',
      isValid: true,
      validationMessage: 'Koneksi kabel Straight berhasil (Router Gateway:Gi0/0 ↔ Switch Lab:Fa0/1).',
    },
    {
      id: 'conn-2',
      fromDeviceId: 'dev-pc-1',
      fromPortId: 'eth0',
      toDeviceId: 'dev-switch-1',
      toPortId: 'fa2',
      cableType: 'straight',
      isValid: true,
      validationMessage: 'Koneksi kabel Straight berhasil (PC 1:Eth0 ↔ Switch Lab:Fa0/2).',
    },
    {
      id: 'conn-3',
      fromDeviceId: 'dev-pc-2',
      fromPortId: 'eth0',
      toDeviceId: 'dev-switch-1',
      toPortId: 'fa3',
      cableType: 'straight',
      isValid: true,
      validationMessage: 'Koneksi kabel Straight berhasil (PC 2:Eth0 ↔ Switch Lab:Fa0/3).',
    },
    {
      id: 'conn-4',
      fromDeviceId: 'dev-pc-3',
      fromPortId: 'eth0',
      toDeviceId: 'dev-switch-1',
      toPortId: 'fa4',
      cableType: 'straight',
      isValid: true,
      validationMessage: 'Koneksi kabel Straight berhasil (PC 3:Eth0 ↔ Switch Lab:Fa0/4).',
    },
  ];

  return { devices, connections };
}

export function createWifiStarterTopology(): {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
} {
  const apCat = getCatalogItem('access_point')!;
  const lapCat = getCatalogItem('laptop')!;
  const phoneCat = getCatalogItem('smartphone')!;
  const swCat = getCatalogItem('switch')!;

  const devices: NetworkDevice[] = [
    {
      id: 'dev-sw-wifi',
      type: 'switch',
      name: 'Switch Utama',
      x: 190,
      y: 250,
      ports: clonePorts(swCat.defaultPorts),
      ipConfig: {
        mode: 'static',
        ip: '',
        subnetMask: '255.255.255.0',
        gateway: '',
        dns: '',
      },
    },
    {
      id: 'dev-ap-1',
      type: 'access_point',
      name: 'Access Point Lab',
      x: 440,
      y: 250,
      ports: clonePorts(apCat.defaultPorts),
      ipConfig: {
        mode: 'static',
        ip: '192.168.1.254',
        subnetMask: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: '8.8.8.8',
      },
      wifiApConfig: {
        ssid: 'Lab_SMK_WiFi',
        password: 'smkhebat2026',
        security: 'WPA2',
        radiusPx: 195,
        dhcpEnabled: true,
        dhcpStart: '192.168.1.100',
        dhcpEnd: '192.168.1.150',
        apIp: '192.168.1.254',
        subnetMask: '255.255.255.0',
        interferenceLevel: 'none',
      },
    },
    {
      id: 'dev-laptop-1',
      type: 'laptop',
      name: 'Laptop Siswa 1',
      x: 560,
      y: 160,
      ports: clonePorts(lapCat.defaultPorts),
      ipConfig: {
        mode: 'dhcp',
        ip: '',
        subnetMask: '',
        gateway: '',
        dns: '',
      },
      wifiClientConfig: {
        targetApId: 'dev-ap-1',
        targetSsid: 'Lab_SMK_WiFi',
        enteredPassword: 'smkhebat2026',
        connected: true,
        signalPercent: 80,
        signalDbm: -45,
        statusReason: '',
      },
    },
    {
      id: 'dev-phone-1',
      type: 'smartphone',
      name: 'Smartphone Siswa',
      x: 575,
      y: 350,
      ports: clonePorts(phoneCat.defaultPorts),
      ipConfig: {
        mode: 'dhcp',
        ip: '',
        subnetMask: '',
        gateway: '',
        dns: '',
      },
      wifiClientConfig: {
        targetApId: 'dev-ap-1',
        targetSsid: 'Lab_SMK_WiFi',
        enteredPassword: 'smkhebat2026',
        connected: true,
        signalPercent: 72,
        signalDbm: -51,
        statusReason: '',
      },
    },
    {
      id: 'dev-laptop-far',
      type: 'laptop',
      name: 'Laptop Luar Jangkauan',
      x: 745,
      y: 250,
      ports: clonePorts(lapCat.defaultPorts),
      ipConfig: {
        mode: 'dhcp',
        ip: '',
        subnetMask: '',
        gateway: '',
        dns: '',
      },
      wifiClientConfig: {
        targetApId: 'dev-ap-1',
        targetSsid: 'Lab_SMK_WiFi',
        enteredPassword: 'smkhebat2026',
        connected: false,
        signalPercent: 0,
        signalDbm: -92,
        statusReason: '',
      },
    },
  ];

  const connections: NetworkConnection[] = [
    {
      id: 'conn-w1',
      fromDeviceId: 'dev-ap-1',
      fromPortId: 'eth0',
      toDeviceId: 'dev-sw-wifi',
      toPortId: 'fa1',
      cableType: 'straight',
      isValid: true,
      validationMessage: 'Koneksi kabel Straight berhasil (Access Point Lab:Uplink ↔ Switch Utama:Fa0/1).',
    },
  ];

  return { devices, connections };
}
