import {
  CableType,
  DeviceType,
  IpConfig,
  MissionDefinition,
  MissionEvaluation,
  NetworkConnection,
  NetworkDevice,
  PingResult,
} from '../types/network';

export interface IpValidationResult {
  valid: boolean;
  reason?: string;
}

const VALID_SUBNET_MASKS = new Set([
  '255.0.0.0',
  '255.128.0.0',
  '255.192.0.0',
  '255.224.0.0',
  '255.240.0.0',
  '255.248.0.0',
  '255.252.0.0',
  '255.254.0.0',
  '255.255.0.0',
  '255.255.128.0',
  '255.255.192.0',
  '255.255.224.0',
  '255.255.240.0',
  '255.255.248.0',
  '255.255.252.0',
  '255.255.254.0',
  '255.255.255.0',
  '255.255.255.128',
  '255.255.255.192',
  '255.255.255.224',
  '255.255.255.240',
  '255.255.255.248',
  '255.255.255.252',
]);

export function parseIpv4(ip: string): number[] | null {
  const trimmed = ip.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    if (part.length > 1 && part.startsWith('0')) return null;
    const num = Number(part);
    if (num < 0 || num > 255) return null;
    octets.push(num);
  }
  return octets;
}

export function ipToInt(ip: string): number | null {
  const octets = parseIpv4(ip);
  if (!octets) return null;
  return (
    ((octets[0] << 24) >>> 0) +
    ((octets[1] << 16) >>> 0) +
    ((octets[2] << 8) >>> 0) +
    (octets[3] >>> 0)
  ) >>> 0;
}

export function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join('.');
}

export function validateIpv4(ip: string): IpValidationResult {
  if (!ip || !ip.trim()) {
    return { valid: false, reason: 'Alamat IP belum diisi.' };
  }
  const octets = parseIpv4(ip);
  if (!octets) {
    return {
      valid: false,
      reason: 'Format IP tidak valid. Gunakan 4 oktet angka 0–255 (contoh: 192.168.1.2).',
    };
  }
  if (octets[0] === 0 || octets[0] === 127 || octets[0] >= 224) {
    return {
      valid: false,
      reason: `Oktet pertama ${octets[0]} merupakan alamat khusus/reserved dan tidak boleh dipakai untuk host.`,
    };
  }
  return { valid: true };
}

export function validateSubnetMask(mask: string): IpValidationResult {
  if (!mask || !mask.trim()) {
    return { valid: false, reason: 'Subnet Mask belum diisi.' };
  }
  if (!VALID_SUBNET_MASKS.has(mask.trim())) {
    return {
      valid: false,
      reason: 'Subnet Mask tidak valid. Contoh standar kelas C adalah 255.255.255.0.',
    };
  }
  return { valid: true };
}

export function validateDeviceIpConfig(ipConfig: IpConfig, deviceType: DeviceType): IpValidationResult {
  if (deviceType === 'switch') {
    return { valid: true };
  }
  if (ipConfig.mode === 'dhcp' && !ipConfig.ip.trim()) {
    return {
      valid: false,
      reason: 'Mode DHCP aktif namun perangkat belum menerima IP dari DHCP Server / Access Point.',
    };
  }
  const ipCheck = validateIpv4(ipConfig.ip);
  if (!ipCheck.valid) return ipCheck;

  const maskCheck = validateSubnetMask(ipConfig.subnetMask);
  if (!maskCheck.valid) return maskCheck;

  const ipInt = ipToInt(ipConfig.ip)!;
  const maskInt = ipToInt(ipConfig.subnetMask)!;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

  if (ipInt === networkInt) {
    return {
      valid: false,
      reason: `IP ${ipConfig.ip} adalah Network Address, tidak dapat digunakan oleh perangkat.`,
    };
  }
  if (ipInt === broadcastInt) {
    return {
      valid: false,
      reason: `IP ${ipConfig.ip} adalah Broadcast Address, tidak dapat digunakan oleh perangkat.`,
    };
  }

  if (ipConfig.gateway.trim()) {
    const gwCheck = validateIpv4(ipConfig.gateway);
    if (!gwCheck.valid) {
      return { valid: false, reason: `Default Gateway tidak valid: ${gwCheck.reason}` };
    }
    const gwInt = ipToInt(ipConfig.gateway)!;
    if ((gwInt & maskInt) >>> 0 !== networkInt) {
      return {
        valid: false,
        reason: `Default Gateway (${ipConfig.gateway}) harus berada dalam satu subnet jaringan dengan IP perangkat (${ipConfig.ip}).`,
      };
    }
  }

  return { valid: true };
}

export function isSameSubnet(ipA: string, maskA: string, ipB: string, maskB: string): boolean {
  const a = ipToInt(ipA);
  const ma = ipToInt(maskA);
  const b = ipToInt(ipB);
  const mb = ipToInt(maskB);
  if (a === null || ma === null || b === null || mb === null) return false;
  return ((a & ma) >>> 0) === ((b & mb) >>> 0) && ma === mb;
}

export function detectIpConflicts(devices: NetworkDevice[]): Record<string, string[]> {
  const ipMap = new Map<string, NetworkDevice[]>();

  for (const dev of devices) {
    if (dev.type === 'switch') continue;
    const primaryIp = dev.type === 'access_point' && dev.wifiApConfig
      ? dev.wifiApConfig.apIp.trim()
      : dev.ipConfig.ip.trim();

    if (primaryIp && validateIpv4(primaryIp).valid) {
      const list = ipMap.get(primaryIp) ?? [];
      list.push(dev);
      ipMap.set(primaryIp, list);
    }

    if (dev.type === 'router' && dev.routerSecondIp?.ip.trim()) {
      const secIp = dev.routerSecondIp.ip.trim();
      if (validateIpv4(secIp).valid) {
        const list = ipMap.get(secIp) ?? [];
        list.push(dev);
        ipMap.set(secIp, list);
      }
    }
  }

  const conflicts: Record<string, string[]> = {};
  for (const [ip, list] of ipMap.entries()) {
    if (list.length > 1) {
      for (const dev of list) {
        const others = list.filter((d) => d.id !== dev.id).map((d) => d.name);
        conflicts[dev.id] = [`Konflik IP ${ip} bentrok dengan ${others.join(', ')}.`];
      }
    }
  }
  return conflicts;
}

function getDeviceCableGroup(type: DeviceType): 'end' | 'switch' | 'router' | 'ap' | 'modem' {
  if (type === 'switch') return 'switch';
  if (type === 'router') return 'router';
  if (type === 'access_point') return 'ap';
  if (type === 'modem') return 'modem';
  return 'end';
}

export function getRecommendedCableType(typeA: DeviceType, typeB: DeviceType): CableType {
  const groupA = getDeviceCableGroup(typeA);
  const groupB = getDeviceCableGroup(typeB);

  // Switch is an Unlike device to End-devices, Router, and Access Point -> Straight
  if (groupA === 'switch' && groupB !== 'switch') return 'straight';
  if (groupB === 'switch' && groupA !== 'switch') return 'straight';

  // Modem to Router uses Straight
  if ((groupA === 'modem' && groupB === 'router') || (groupA === 'router' && groupB === 'modem')) {
    return 'straight';
  }

  // Same-layer / Direct connections (PC-PC, Switch-Switch, Router-Router, PC-Router, AP-Router) -> Crossover
  return 'crossover';
}

export function validateCableConnection(
  fromDevice: NetworkDevice,
  fromPortId: string,
  toDevice: NetworkDevice,
  toPortId: string,
  cableType: CableType,
  existingConnections: NetworkConnection[]
): { isValid: boolean; message: string } {
  if (fromDevice.id === toDevice.id) {
    return { isValid: false, message: 'Tidak dapat menghubungkan perangkat ke dirinya sendiri.' };
  }

  const fromPort = fromDevice.ports.find((p) => p.id === fromPortId);
  const toPort = toDevice.ports.find((p) => p.id === toPortId);

  if (!fromPort || !toPort) {
    return { isValid: false, message: 'Port jaringan yang dipilih tidak ditemukan.' };
  }

  if (fromPort.kind === 'wifi' || toPort.kind === 'wifi') {
    return {
      isValid: false,
      message: 'Port WiFi tidak menggunakan kabel UTP. Hubungkan secara nirkabel melalui pengaturan SSID.',
    };
  }

  const fromBusy = existingConnections.some(
    (c) =>
      (c.fromDeviceId === fromDevice.id && c.fromPortId === fromPortId) ||
      (c.toDeviceId === fromDevice.id && c.toPortId === fromPortId)
  );
  if (fromBusy) {
    return {
      isValid: false,
      message: `Port ${fromPort.label} pada ${fromDevice.name} sudah terpakai kabel lain.`,
    };
  }

  const toBusy = existingConnections.some(
    (c) =>
      (c.fromDeviceId === toDevice.id && c.fromPortId === toPortId) ||
      (c.toDeviceId === toDevice.id && c.toPortId === toPortId)
  );
  if (toBusy) {
    return {
      isValid: false,
      message: `Port ${toPort.label} pada ${toDevice.name} sudah terpakai kabel lain.`,
    };
  }

  const recommended = getRecommendedCableType(fromDevice.type, toDevice.type);
  if (cableType !== recommended) {
    if (recommended === 'crossover') {
      return {
        isValid: false,
        message: `Jenis kabel salah! Koneksi langsung ${fromDevice.name} ke ${toDevice.name} membutuhkan kabel Crossover (T568A–T568B), bukan Straight.`,
      };
    }
    return {
      isValid: false,
      message: `Jenis kabel salah! Koneksi ${fromDevice.name} ke ${toDevice.name} membutuhkan kabel Straight (T568B–T568B), bukan Crossover.`,
    };
  }

  return {
    isValid: true,
    message: `Koneksi kabel ${cableType === 'straight' ? 'Straight' : 'Crossover'} berhasil (${fromDevice.name}:${fromPort.label} ↔ ${toDevice.name}:${toPort.label}).`,
  };
}

export function applyWifiAndDhcpState(devices: NetworkDevice[]): NetworkDevice[] {
  const aps = devices.filter((d) => d.type === 'access_point' && d.wifiApConfig);

  // Track already used static/AP IPs so DHCP doesn't assign colliding IPs
  const usedIps = new Set<string>();
  for (const d of devices) {
    if (d.type === 'access_point' && d.wifiApConfig?.apIp) {
      usedIps.add(d.wifiApConfig.apIp.trim());
    } else if (d.ipConfig.mode === 'static' && d.ipConfig.ip.trim()) {
      usedIps.add(d.ipConfig.ip.trim());
    }
    if (d.routerSecondIp?.ip.trim()) {
      usedIps.add(d.routerSecondIp.ip.trim());
    }
  }

  const updated = devices.map((dev) => ({
    ...dev,
    ipConfig: { ...dev.ipConfig },
    wifiClientConfig: dev.wifiClientConfig ? { ...dev.wifiClientConfig } : undefined,
  }));

  for (const client of updated) {
    if ((client.type !== 'laptop' && client.type !== 'smartphone') || !client.wifiClientConfig) {
      continue;
    }

    const wc = client.wifiClientConfig;
    if (!wc.targetApId && !wc.targetSsid) {
      wc.connected = false;
      wc.signalPercent = 0;
      wc.signalDbm = -95;
      wc.statusReason = 'Belum memilih jaringan WiFi (SSID).';
      if (client.ipConfig.mode === 'dhcp') {
        client.ipConfig.ip = '';
        client.ipConfig.subnetMask = '';
        client.ipConfig.gateway = '';
      }
      continue;
    }

    const ap =
      aps.find((a) => a.id === wc.targetApId) ??
      aps.find((a) => a.wifiApConfig?.ssid === wc.targetSsid);

    if (!ap || !ap.wifiApConfig) {
      wc.connected = false;
      wc.signalPercent = 0;
      wc.signalDbm = -95;
      wc.statusReason = 'Access Point tujuan tidak ditemukan di area kerja.';
      if (client.ipConfig.mode === 'dhcp') {
        client.ipConfig.ip = '';
      }
      continue;
    }

    const apCfg = ap.wifiApConfig;
    wc.targetApId = ap.id;

    if (wc.targetSsid !== apCfg.ssid) {
      wc.connected = false;
      wc.signalPercent = 0;
      wc.signalDbm = -95;
      wc.statusReason = `SSID "${wc.targetSsid}" tidak cocok dengan SSID Access Point ("${apCfg.ssid}").`;
      if (client.ipConfig.mode === 'dhcp') {
        client.ipConfig.ip = '';
      }
      continue;
    }

    if (apCfg.security !== 'Open' && wc.enteredPassword !== apCfg.password) {
      wc.connected = false;
      wc.signalPercent = 0;
      wc.signalDbm = -95;
      wc.statusReason = `Password WiFi salah untuk keamanan ${apCfg.security}.`;
      if (client.ipConfig.mode === 'dhcp') {
        client.ipConfig.ip = '';
      }
      continue;
    }

    const dx = client.x - ap.x;
    const dy = client.y - ap.y;
    const dist = Math.hypot(dx, dy);

    if (dist > apCfg.radiusPx) {
      wc.connected = false;
      wc.signalPercent = 0;
      wc.signalDbm = -92;
      wc.statusReason = `Di luar jangkauan sinyal (${Math.round(dist)}px > radius ${apCfg.radiusPx}px). Pindahkan perangkat mendekati Access Point.`;
      if (client.ipConfig.mode === 'dhcp') {
        client.ipConfig.ip = '';
      }
      continue;
    }

    let rawPercent = Math.max(18, Math.round(100 - (dist / apCfg.radiusPx) * 75));
    if (apCfg.interferenceLevel === 'medium') rawPercent -= 25;
    if (apCfg.interferenceLevel === 'high') rawPercent -= 58;

    if (rawPercent < 15) {
      wc.connected = false;
      wc.signalPercent = Math.max(5, rawPercent);
      wc.signalDbm = -88;
      wc.statusReason = 'Gangguan sinyal (interferensi tinggi) menyebabkan koneksi WiFi terputus.';
      if (client.ipConfig.mode === 'dhcp') {
        client.ipConfig.ip = '';
      }
      continue;
    }

    wc.connected = true;
    wc.signalPercent = Math.min(100, rawPercent);
    wc.signalDbm = Math.round(-35 - ((100 - wc.signalPercent) / 100) * 48);
    wc.statusReason = `Terhubung ke "${apCfg.ssid}" (${apCfg.security}) · Sinyal ${wc.signalPercent}%`;

    // Assign DHCP IP if requested
    if (client.ipConfig.mode === 'dhcp') {
      if (apCfg.dhcpEnabled) {
        const startInt = ipToInt(apCfg.dhcpStart);
        const endInt = ipToInt(apCfg.dhcpEnd);
        if (startInt !== null && endInt !== null && startInt <= endInt) {
          // Keep existing valid DHCP IP in pool if not conflicting
          const currentInt = ipToInt(client.ipConfig.ip);
          if (
            currentInt !== null &&
            currentInt >= startInt &&
            currentInt <= endInt &&
            !usedIps.has(client.ipConfig.ip)
          ) {
            usedIps.add(client.ipConfig.ip);
          } else {
            let assigned = '';
            for (let candidate = startInt; candidate <= endInt; candidate++) {
              const ipStr = intToIp(candidate);
              if (!usedIps.has(ipStr)) {
                assigned = ipStr;
                usedIps.add(ipStr);
                break;
              }
            }
            client.ipConfig.ip = assigned;
          }
          client.ipConfig.subnetMask = apCfg.subnetMask;
          client.ipConfig.gateway = apCfg.apIp;
          client.ipConfig.dns = '8.8.8.8';
        }
      } else {
        client.ipConfig.ip = '';
        wc.statusReason = 'Terhubung ke WiFi namun DHCP Server pada AP nonaktif.';
      }
    }
  }

  return updated;
}

function getEffectiveIpConfig(dev: NetworkDevice): IpConfig {
  if (dev.type === 'access_point' && dev.wifiApConfig) {
    return {
      mode: 'static',
      ip: dev.wifiApConfig.apIp,
      subnetMask: dev.wifiApConfig.subnetMask,
      gateway: dev.ipConfig.gateway || dev.wifiApConfig.apIp,
      dns: dev.ipConfig.dns || '8.8.8.8',
    };
  }
  return dev.ipConfig;
}

function deviceMatchesIp(dev: NetworkDevice, targetIp: string): boolean {
  const eff = getEffectiveIpConfig(dev);
  if (eff.ip.trim() === targetIp.trim()) return true;
  if (dev.type === 'router' && dev.routerSecondIp?.ip.trim() === targetIp.trim()) return true;
  return false;
}

function getDeviceSubnets(dev: NetworkDevice): { ip: string; mask: string }[] {
  const res: { ip: string; mask: string }[] = [];
  const eff = getEffectiveIpConfig(dev);
  if (eff.ip.trim() && eff.subnetMask.trim()) {
    res.push({ ip: eff.ip.trim(), mask: eff.subnetMask.trim() });
  }
  if (dev.type === 'router' && dev.routerSecondIp?.ip.trim() && dev.routerSecondIp?.subnetMask.trim()) {
    res.push({ ip: dev.routerSecondIp.ip.trim(), mask: dev.routerSecondIp.subnetMask.trim() });
  }
  return res;
}

export function simulatePing(
  sourceId: string,
  targetIpRaw: string,
  devices: NetworkDevice[],
  connections: NetworkConnection[]
): PingResult {
  const targetIp = targetIpRaw.trim();
  const source = devices.find((d) => d.id === sourceId);

  if (!source) {
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: null,
      pathDeviceIds: [],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: ['Error: Perangkat sumber tidak ditemukan.'],
      reason: 'Perangkat sumber tidak ditemukan.',
    };
  }

  const srcIpCfg = getEffectiveIpConfig(source);
  const conflicts = detectIpConflicts(devices);

  if (source.type === 'switch') {
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: null,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [`Error: ${source.name} adalah Switch Layer 2, lakukan ping dari PC, Laptop, Server, atau Router.`],
      reason: 'Switch Layer 2 tidak dapat memulai perintah ping.',
    };
  }

  if (conflicts[source.id]) {
    const msg = conflicts[source.id][0];
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: null,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [`Pinging ${targetIp} from ${source.name}...`, `Error: ${msg}`],
      reason: msg,
    };
  }

  const srcCheck = validateDeviceIpConfig(srcIpCfg, source.type);
  if (!srcCheck.valid) {
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: null,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [`Pinging ${targetIp}...`, `Transmit failed: ${srcCheck.reason}`],
      reason: srcCheck.reason ?? 'Konfigurasi IP sumber tidak valid.',
    };
  }

  if (!validateIpv4(targetIp).valid) {
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: null,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [`Ping request could not find host ${targetIp}. Format IP tujuan tidak valid.`],
      reason: 'Format IP tujuan tidak valid.',
    };
  }

  if (deviceMatchesIp(source, targetIp)) {
    return {
      success: true,
      sourceId,
      targetIp,
      targetDeviceId: source.id,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 1,
      ttl: 64,
      logs: [
        `Pinging ${targetIp} with 32 bytes of data:`,
        `Reply from ${targetIp}: bytes=32 time<1ms TTL=64 (Loopback/Local)`,
      ],
      reason: 'Ping ke IP perangkat sendiri berhasil.',
    };
  }

  const target = devices.find((d) => d.type !== 'switch' && deviceMatchesIp(d, targetIp));
  if (!target) {
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: null,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [
        `Pinging ${targetIp} with 32 bytes of data:`,
        'Request timed out.',
        `Keterangan: Tidak ada perangkat aktif dengan IP ${targetIp}.`,
      ],
      reason: `Tidak ditemukan perangkat dengan IP ${targetIp}.`,
    };
  }

  if (conflicts[target.id]) {
    const msg = conflicts[target.id][0];
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: target.id,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [`Pinging ${targetIp}...`, `Request timed out. (${msg})`],
      reason: msg,
    };
  }

  const tgtIpCfg = getEffectiveIpConfig(target);
  const tgtCheck = validateDeviceIpConfig(tgtIpCfg, target.type);
  if (!tgtCheck.valid) {
    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: target.id,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [`Pinging ${targetIp}...`, `Destination host unreachable: ${tgtCheck.reason}`],
      reason: `Konfigurasi IP ${target.name} bermasalah: ${tgtCheck.reason}`,
    };
  }

  // Build adjacency list from valid wired connections and active WiFi links
  const adj = new Map<string, { neighborId: string; isWifi: boolean; apId?: string }[]>();
  for (const d of devices) adj.set(d.id, []);

  for (const conn of connections) {
    if (!conn.isValid) continue;
    adj.get(conn.fromDeviceId)?.push({ neighborId: conn.toDeviceId, isWifi: false });
    adj.get(conn.toDeviceId)?.push({ neighborId: conn.fromDeviceId, isWifi: false });
  }

  for (const d of devices) {
    if ((d.type === 'laptop' || d.type === 'smartphone') && d.wifiClientConfig?.connected && d.wifiClientConfig.targetApId) {
      const apId = d.wifiClientConfig.targetApId;
      adj.get(d.id)?.push({ neighborId: apId, isWifi: true, apId });
      adj.get(apId)?.push({ neighborId: d.id, isWifi: true, apId });
    }
  }

  // BFS shortest path from source to target
  const queue: string[] = [source.id];
  const parent = new Map<string, string | null>([[source.id, null]]);
  let found = false;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === target.id) {
      found = true;
      break;
    }
    for (const edge of adj.get(curr) ?? []) {
      if (!parent.has(edge.neighborId)) {
        parent.set(edge.neighborId, curr);
        queue.push(edge.neighborId);
      }
    }
  }

  if (!found) {
    // Check if there's an invalid cable connecting them to give an even more helpful reason
    const hasInvalidCable = connections.some((c) => !c.isValid);
    const wifiBlocked =
      (source.wifiClientConfig && !source.wifiClientConfig.connected) ||
      (target.wifiClientConfig && !target.wifiClientConfig.connected);

    let reason = `Tidak ada jalur fisik atau WiFi yang terhubung dari ${source.name} ke ${target.name}.`;
    if (wifiBlocked) {
      reason = `Koneksi WiFi belum aktif (${source.wifiClientConfig?.statusReason || target.wifiClientConfig?.statusReason}).`;
    } else if (hasInvalidCable) {
      reason = 'Terdapat kabel dengan jenis yang salah (Straight/Crossover) sehingga jalur putus.';
    }

    return {
      success: false,
      sourceId,
      targetIp,
      targetDeviceId: target.id,
      pathDeviceIds: [source.id],
      hops: 0,
      latencyMs: 0,
      ttl: 0,
      logs: [
        `Pinging ${targetIp} with 32 bytes of data:`,
        'Destination host unreachable.',
        `Analisis: ${reason}`,
      ],
      reason,
    };
  }

  const path: string[] = [];
  let cursor: string | null = target.id;
  while (cursor) {
    path.unshift(cursor);
    cursor = parent.get(cursor) ?? null;
  }

  // Check L2 vs L3 Subnet & Gateway logic
  const srcSubnets = getDeviceSubnets(source);
  const tgtSubnets = getDeviceSubnets(target);
  const shareSubnet = srcSubnets.some((s) =>
    tgtSubnets.some((t) => isSameSubnet(s.ip, s.mask, t.ip, t.mask))
  );

  const routersOnPath = path
    .slice(1, -1)
    .map((id) => devices.find((d) => d.id === id))
    .filter((d): d is NetworkDevice => d?.type === 'router');

  if (!shareSubnet) {
    // Must pass through a router (or target IS a router with matching interface)
    const routerInvolved =
      source.type === 'router' || target.type === 'router' || routersOnPath.length > 0;

    if (!routerInvolved) {
      const reason = `${source.name} (${srcIpCfg.ip}) dan ${target.name} (${targetIp}) berada pada subnet berbeda tanpa perantara Router.`;
      return {
        success: false,
        sourceId,
        targetIp,
        targetDeviceId: target.id,
        pathDeviceIds: path,
        hops: path.length - 1,
        latencyMs: 0,
        ttl: 0,
        logs: [
          `Pinging ${targetIp} with 32 bytes of data:`,
          'Request timed out.',
          `Analisis: ${reason}`,
        ],
        reason,
      };
    }

    // Verify source Default Gateway points to a router in source's subnet when source is not a router
    if (source.type !== 'router') {
      const gwIp = srcIpCfg.gateway.trim();
      const gwRouter = devices.find(
        (d) =>
          d.type === 'router' &&
          deviceMatchesIp(d, gwIp) &&
          getDeviceSubnets(d).some((rs) => isSameSubnet(rs.ip, rs.mask, srcIpCfg.ip, srcIpCfg.subnetMask))
      );
      if (!gwIp || !gwRouter) {
        const reason = `Default Gateway pada ${source.name} belum mengarah ke IP Router di subnetnya.`;
        return {
          success: false,
          sourceId,
          targetIp,
          targetDeviceId: target.id,
          pathDeviceIds: path,
          hops: path.length - 1,
          latencyMs: 0,
          ttl: 0,
          logs: [
            `Pinging ${targetIp} with 32 bytes of data:`,
            'Request timed out.',
            `Analisis: ${reason}`,
          ],
          reason,
        };
      }
    }
  }

  // Compute latency
  let latencyMs = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = devices.find((d) => d.id === path[i]);
    const b = devices.find((d) => d.id === path[i + 1]);
    const isWifiHop =
      (a?.wifiClientConfig?.connected && a.wifiClientConfig.targetApId === b?.id) ||
      (b?.wifiClientConfig?.connected && b.wifiClientConfig.targetApId === a?.id);
    if (isWifiHop) {
      const ap = a?.type === 'access_point' ? a : b;
      const extra = ap?.wifiApConfig?.interferenceLevel === 'medium' ? 14 : 5;
      latencyMs += extra;
    } else {
      latencyMs += 2;
    }
  }

  const routerHops = routersOnPath.length;
  const ttl = Math.max(1, 64 - routerHops);
  const pathNames = path
    .map((id) => devices.find((d) => d.id === id)?.name ?? id)
    .join(' → ');

  return {
    success: true,
    sourceId,
    targetIp,
    targetDeviceId: target.id,
    pathDeviceIds: path,
    hops: path.length - 1,
    latencyMs,
    ttl,
    logs: [
      `Pinging ${targetIp} (${target.name}) with 32 bytes of data:`,
      `Jalur paket: ${pathNames}`,
      `Reply from ${targetIp}: bytes=32 time=${latencyMs}ms TTL=${ttl}`,
      `Reply from ${targetIp}: bytes=32 time=${latencyMs + 1}ms TTL=${ttl}`,
      `Ping statistics for ${targetIp}: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`,
    ],
    reason: `Koneksi berhasil melalui ${path.length - 1} hop (${latencyMs}ms).`,
  };
}

export function evaluateMission(
  mission: MissionDefinition,
  devices: NetworkDevice[],
  connections: NetworkConnection[]
): MissionEvaluation {
  const conflicts = detectIpConflicts(devices);
  const noConflicts = Object.keys(conflicts).length === 0;
  const validCables = connections.filter((c) => c.isValid);
  const invalidCables = connections.filter((c) => !c.isValid);

  const pcs = devices.filter((d) => d.type === 'pc' || d.type === 'laptop');
  const onlyPcs = devices.filter((d) => d.type === 'pc');
  const switches = devices.filter((d) => d.type === 'switch');
  const routers = devices.filter((d) => d.type === 'router');
  const aps = devices.filter((d) => d.type === 'access_point');
  const wirelessClients = devices.filter((d) => d.type === 'laptop' || d.type === 'smartphone');

  const checks: { id: string; label: string; passed: boolean; detail: string }[] = [];

  if (mission.id === 'misi-1') {
    const hasTwoPcs = onlyPcs.length >= 2 || pcs.length >= 2;
    checks.push({
      id: 'dev',
      label: 'Minimal 2 Komputer di area kerja',
      passed: hasTwoPcs,
      detail: hasTwoPcs ? 'Perangkat PC sudah tersedia.' : 'Tambahkan minimal 2 unit PC/Komputer.',
    });

    const directCrossover = validCables.some((c) => {
      const a = devices.find((d) => d.id === c.fromDeviceId);
      const b = devices.find((d) => d.id === c.toDeviceId);
      return (
        c.cableType === 'crossover' &&
        a &&
        b &&
        (a.type === 'pc' || a.type === 'laptop') &&
        (b.type === 'pc' || b.type === 'laptop')
      );
    });
    checks.push({
      id: 'cable',
      label: 'Terhubung langsung dengan kabel Crossover',
      passed: directCrossover && invalidCables.length === 0,
      detail: directCrossover
        ? 'Kabel Crossover terpasang dengan benar.'
        : 'Hubungkan kedua komputer secara langsung menggunakan kabel Crossover.',
    });

    const twoValidPcs = pcs.filter((p) => validateDeviceIpConfig(p.ipConfig, p.type).valid);
    let canPing = false;
    if (twoValidPcs.length >= 2 && noConflicts) {
      const pingRes = simulatePing(twoValidPcs[0].id, twoValidPcs[1].ipConfig.ip, devices, connections);
      canPing = pingRes.success;
    }
    checks.push({
      id: 'ip',
      label: 'IP Address satu subnet & tidak konflik',
      passed: twoValidPcs.length >= 2 && noConflicts,
      detail:
        twoValidPcs.length >= 2 && noConflicts
          ? 'Konfigurasi IP valid tanpa konflik.'
          : 'Atur IP kedua PC dalam satu subnet (misal 192.168.1.2 dan 192.168.1.3).',
    });
    checks.push({
      id: 'ping',
      label: 'Uji Ping antar-komputer berhasil',
      passed: canPing,
      detail: canPing ? 'Ping antar-komputer berhasil (Reply).' : 'Ping antar-komputer belum berhasil.',
    });
  } else if (mission.id === 'misi-2') {
    const has4Pcs = pcs.length >= 4;
    const hasSwitch = switches.length >= 1;
    checks.push({
      id: 'dev',
      label: '4 Komputer dan 1 Switch terpasang',
      passed: has4Pcs && hasSwitch,
      detail:
        has4Pcs && hasSwitch
          ? 'Jumlah PC dan Switch memenuhi syarat.'
          : `Saat ini ada ${pcs.length} PC dan ${switches.length} Switch (butuh 4 PC & 1 Switch).`,
    });

    const sw = switches[0];
    const connectedViaStraight = sw
      ? pcs.filter((p) =>
          validCables.some(
            (c) =>
              c.cableType === 'straight' &&
              ((c.fromDeviceId === p.id && c.toDeviceId === sw.id) ||
                (c.toDeviceId === p.id && c.fromDeviceId === sw.id))
          )
        ).length >= 4
      : false;
    checks.push({
      id: 'cable',
      label: 'Semua komputer terhubung ke Switch dengan kabel Straight',
      passed: connectedViaStraight && invalidCables.length === 0,
      detail: connectedViaStraight
        ? 'Seluruh kabel Straight terpasang ke port Switch.'
        : 'Pastikan 4 komputer terhubung ke port Switch menggunakan kabel Straight.',
    });

    const validPcs = pcs.filter((p) => validateDeviceIpConfig(p.ipConfig, p.type).valid);
    let allReachable = false;
    if (validPcs.length >= 4 && noConflicts) {
      allReachable = validPcs.slice(1, 4).every((target) =>
        simulatePing(validPcs[0].id, target.ipConfig.ip, devices, connections).success
      );
    }
    checks.push({
      id: 'ip',
      label: 'Semua PC memiliki IP valid satu subnet tanpa konflik',
      passed: validPcs.length >= 4 && noConflicts,
      detail:
        validPcs.length >= 4 && noConflicts
          ? 'Alamat IP 4 komputer valid.'
          : 'Periksa IP Address setiap komputer agar unik dan satu subnet.',
    });
    checks.push({
      id: 'ping',
      label: 'Konektivitas Ping antar seluruh PC berhasil',
      passed: allReachable,
      detail: allReachable
        ? 'Seluruh komputer saling terhubung dalam topologi Star.'
        : 'Pastikan semua komputer dapat saling di-ping melalui Switch.',
    });
  } else if (mission.id === 'misi-3') {
    const hasRouter = routers.length >= 1;
    const hasSwitch = switches.length >= 1;
    const hasPcs = pcs.length >= 2;
    checks.push({
      id: 'dev',
      label: 'Minimal 2 PC, 1 Switch, dan 1 Router tersedia',
      passed: hasRouter && hasSwitch && hasPcs,
      detail:
        hasRouter && hasSwitch && hasPcs
          ? 'Perangkat LAN dan Router lengkap.'
          : 'Tambahkan minimal 2 PC, 1 Switch, dan 1 Router.',
    });

    const routerToSwitch = validCables.some((c) => {
      const a = devices.find((d) => d.id === c.fromDeviceId);
      const b = devices.find((d) => d.id === c.toDeviceId);
      return (
        c.cableType === 'straight' &&
        a &&
        b &&
        ((a.type === 'router' && b.type === 'switch') || (a.type === 'switch' && b.type === 'router'))
      );
    });
    checks.push({
      id: 'cable',
      label: 'Switch terhubung ke Router dengan kabel Straight',
      passed: routerToSwitch && invalidCables.length === 0,
      detail: routerToSwitch
        ? 'Uplink Switch ke Router aktif.'
        : 'Hubungkan Switch ke port LAN Router menggunakan kabel Straight.',
    });

    const router = routers[0];
    const routerIpOk = router ? validateDeviceIpConfig(router.ipConfig, 'router').valid : false;
    const pcsWithGw = pcs.filter(
      (p) =>
        validateDeviceIpConfig(p.ipConfig, p.type).valid &&
        router &&
        p.ipConfig.gateway.trim() === router.ipConfig.ip.trim()
    );
    checks.push({
      id: 'gw',
      label: 'Default Gateway PC mengarah ke IP Router',
      passed: routerIpOk && pcsWithGw.length >= 2 && noConflicts,
      detail:
        routerIpOk && pcsWithGw.length >= 2 && noConflicts
          ? 'Gateway PC sesuai dengan IP Router.'
          : 'Pastikan Default Gateway pada setiap PC diisi IP LAN Router (misal 192.168.1.1).',
    });

    let pingGwOk = false;
    if (router && pcsWithGw.length >= 2 && noConflicts) {
      pingGwOk = pcsWithGw.every(
        (p) => simulatePing(p.id, router.ipConfig.ip, devices, connections).success
      );
    }
    checks.push({
      id: 'ping',
      label: 'Ping dari PC ke Gateway (Router) berhasil',
      passed: pingGwOk,
      detail: pingGwOk
        ? 'Komunikasi LAN ke Gateway Router sukses.'
        : 'Tes ping ke IP Router belum berhasil.',
    });
  } else if (mission.id === 'misi-4') {
    const hasAp = aps.length >= 1;
    const hasWireless = wirelessClients.length >= 2;
    checks.push({
      id: 'dev',
      label: '1 Access Point dan minimal 2 perangkat WiFi (Laptop/Smartphone)',
      passed: hasAp && hasWireless,
      detail:
        hasAp && hasWireless
          ? 'Perangkat WiFi lengkap.'
          : 'Tambahkan 1 Access Point serta minimal 2 Laptop/Smartphone.',
    });

    const ap = aps[0];
    const apConfigured = Boolean(
      ap?.wifiApConfig &&
        ap.wifiApConfig.ssid.trim().length >= 3 &&
        (ap.wifiApConfig.security === 'WPA2' || ap.wifiApConfig.security === 'WPA3') &&
        ap.wifiApConfig.password.length >= 8
    );
    checks.push({
      id: 'sec',
      label: 'Access Point memakai SSID dan keamanan WPA2/WPA3 (min 8 karakter)',
      passed: apConfigured,
      detail: apConfigured
        ? `SSID "${ap?.wifiApConfig?.ssid}" aman dengan ${ap?.wifiApConfig?.security}.`
        : 'Atur SSID Access Point, pilih keamanan WPA2/WPA3, dan password minimal 8 karakter.',
    });

    const connectedClients = wirelessClients.filter(
      (c) => c.wifiClientConfig?.connected && validateDeviceIpConfig(c.ipConfig, c.type).valid
    );
    checks.push({
      id: 'wifi',
      label: 'Minimal 2 perangkat WiFi berstatus Connected & mendapat IP',
      passed: connectedClients.length >= 2 && noConflicts,
      detail:
        connectedClients.length >= 2 && noConflicts
          ? `${connectedClients.length} perangkat terhubung dalam jangkauan sinyal.`
          : 'Pastikan Laptop & Smartphone berada di dalam lingkaran sinyal AP dengan SSID & password benar.',
    });

    let wifiPingOk = false;
    if (connectedClients.length >= 2 && ap && noConflicts) {
      wifiPingOk = simulatePing(
        connectedClients[0].id,
        connectedClients[1].ipConfig.ip,
        devices,
        connections
      ).success;
    }
    checks.push({
      id: 'ping',
      label: 'Uji Ping antarperangkat WiFi berhasil',
      passed: wifiPingOk,
      detail: wifiPingOk
        ? 'Komunikasi antarperangkat nirkabel berhasil.'
        : 'Pastikan kedua perangkat WiFi dapat saling melakukan Ping.',
    });
  } else {
    // Misi 5: Jaringan Gabungan LAN & WiFi untuk Lab Sekolah
    const hasRouter = routers.length >= 1;
    const hasSwitch = switches.length >= 1;
    const hasAp = aps.length >= 1;
    const wiredEnd = devices.filter((d) => d.type === 'pc' || d.type === 'server' || d.type === 'printer');
    const hasWiredAndWifi = wiredEnd.length >= 2 && wirelessClients.length >= 1;

    checks.push({
      id: 'dev',
      label: 'Topologi Lab lengkap: Router, Switch, Access Point, PC/Server, & Klien WiFi',
      passed: hasRouter && hasSwitch && hasAp && hasWiredAndWifi,
      detail:
        hasRouter && hasSwitch && hasAp && hasWiredAndWifi
          ? 'Seluruh komponen utama laboratorium sekolah tersedia.'
          : 'Siapkan minimal 1 Router, 1 Switch, 1 Access Point, 2 perangkat kabel (PC/Server/Printer), dan 1 perangkat WiFi.',
    });

    const sw = switches[0];
    const ap = aps[0];
    const r = routers[0];
    const apToSwitch = Boolean(
      sw &&
        ap &&
        validCables.some(
          (c) =>
            c.cableType === 'straight' &&
            ((c.fromDeviceId === ap.id && c.toDeviceId === sw.id) ||
              (c.toDeviceId === ap.id && c.fromDeviceId === sw.id))
        )
    );
    const routerToSwitch = Boolean(
      sw &&
        r &&
        validCables.some(
          (c) =>
            c.cableType === 'straight' &&
            ((c.fromDeviceId === r.id && c.toDeviceId === sw.id) ||
              (c.toDeviceId === r.id && c.fromDeviceId === sw.id))
        )
    );
    checks.push({
      id: 'backbone',
      label: 'Router dan Access Point terhubung ke Switch (kabel Straight)',
      passed: apToSwitch && routerToSwitch && invalidCables.length === 0,
      detail:
        apToSwitch && routerToSwitch
          ? 'Backbone Switch ↔ Router dan Switch ↔ Access Point aktif.'
          : 'Hubungkan Router dan Access Point ke Switch menggunakan kabel Straight.',
    });

    const validWired = wiredEnd.filter((d) => validateDeviceIpConfig(d.ipConfig, d.type).valid);
    const validWifi = wirelessClients.filter(
      (c) => c.wifiClientConfig?.connected && validateDeviceIpConfig(c.ipConfig, c.type).valid
    );
    checks.push({
      id: 'clients',
      label: 'Perangkat kabel & nirkabel terkonfigurasi IP tanpa konflik',
      passed: validWired.length >= 2 && validWifi.length >= 1 && noConflicts,
      detail:
        validWired.length >= 2 && validWifi.length >= 1 && noConflicts
          ? 'Alamat IP perangkat LAN dan WiFi siap berkomunikasi.'
          : 'Pastikan minimal 2 perangkat kabel dan 1 klien WiFi memiliki IP valid tanpa konflik.',
    });

    let hybridPingOk = false;
    if (validWired.length >= 2 && validWifi.length >= 1 && noConflicts) {
      hybridPingOk = simulatePing(
        validWifi[0].id,
        validWired[0].ipConfig.ip,
        devices,
        connections
      ).success;
    }
    checks.push({
      id: 'hybrid_ping',
      label: 'Ping lintas media (Klien WiFi → PC/Server Kabel) berhasil',
      passed: hybridPingOk,
      detail: hybridPingOk
        ? 'Jaringan gabungan LAN dan WiFi laboratorium sekolah berfungsi penuh!'
        : 'Pastikan klien WiFi dapat melakukan Ping ke PC/Server kabel melalui Access Point dan Switch.',
    });
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const passed = passedCount === checks.length;
  const score = Math.round((passedCount / checks.length) * mission.maxScore);

  const failedDetails = checks.filter((c) => !c.passed).map((c) => c.detail);
  const summaryFeedback = passed
    ? `Selamat! ${mission.title} berhasil diselesaikan dengan skor penuh ${score}/${mission.maxScore}.`
    : `Terdapat ${failedDetails.length} syarat yang belum terpenuhi: ${failedDetails[0]}`;

  return {
    missionId: mission.id,
    passed,
    score,
    maxScore: mission.maxScore,
    checks,
    summaryFeedback,
  };
}
