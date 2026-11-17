import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyWifiAndDhcpState,
  detectIpConflicts,
  evaluateMission,
  isSameSubnet,
  simulatePing,
  validateCableConnection,
  validateDeviceIpConfig,
  validateIpv4,
  validateSubnetMask,
} from './networkEngine';
import { MISSIONS } from '../data/missions';
import { NetworkConnection, NetworkDevice } from '../types/network';

function makePc(id: string, name: string, ip: string, x = 100, y = 100, gw = '192.168.1.1'): NetworkDevice {
  return {
    id,
    type: 'pc',
    name,
    x,
    y,
    ports: [{ id: 'eth0', label: 'Eth0', kind: 'eth' }],
    ipConfig: {
      mode: 'static',
      ip,
      subnetMask: '255.255.255.0',
      gateway: gw,
      dns: '8.8.8.8',
    },
  };
}

function makeSwitch(id: string, name = 'Switch-1'): NetworkDevice {
  return {
    id,
    type: 'switch',
    name,
    x: 300,
    y: 200,
    ports: [
      { id: 'fa1', label: 'Fa0/1', kind: 'eth' },
      { id: 'fa2', label: 'Fa0/2', kind: 'eth' },
      { id: 'fa3', label: 'Fa0/3', kind: 'eth' },
      { id: 'fa4', label: 'Fa0/4', kind: 'eth' },
      { id: 'fa5', label: 'Fa0/5', kind: 'eth' },
    ],
    ipConfig: { mode: 'static', ip: '', subnetMask: '255.255.255.0', gateway: '', dns: '' },
  };
}

test('IPv4 and Subnet Mask validation rejects invalid inputs', () => {
  assert.equal(validateIpv4('192.168.1.2').valid, true);
  assert.equal(validateIpv4('999.168.1.2').valid, false);
  assert.equal(validateIpv4('192.168.1').valid, false);
  assert.equal(validateIpv4('127.0.0.1').valid, false);
  assert.equal(validateSubnetMask('255.255.255.0').valid, true);
  assert.equal(validateSubnetMask('255.255.123.0').valid, false);
  assert.equal(
    validateDeviceIpConfig(
      { mode: 'static', ip: '192.168.1.0', subnetMask: '255.255.255.0', gateway: '', dns: '' },
      'pc'
    ).valid,
    false
  );
  assert.equal(
    validateDeviceIpConfig(
      { mode: 'static', ip: '192.168.1.255', subnetMask: '255.255.255.0', gateway: '', dns: '' },
      'pc'
    ).valid,
    false
  );
});

test('Same subnet check and IP conflict detection work accurately', () => {
  assert.equal(isSameSubnet('192.168.1.2', '255.255.255.0', '192.168.1.50', '255.255.255.0'), true);
  assert.equal(isSameSubnet('192.168.1.2', '255.255.255.0', '192.168.2.2', '255.255.255.0'), false);

  const pc1 = makePc('pc1', 'PC 1', '192.168.1.2');
  const pc2 = makePc('pc2', 'PC 2', '192.168.1.2');
  const conflicts = detectIpConflicts([pc1, pc2]);
  assert.ok(conflicts['pc1']);
  assert.ok(conflicts['pc2']);
});

test('Cable validation enforces Straight vs Crossover rules', () => {
  const pc1 = makePc('pc1', 'PC 1', '192.168.1.2');
  const pc2 = makePc('pc2', 'PC 2', '192.168.1.3');
  const sw = makeSwitch('sw1');

  // PC to PC requires Crossover
  assert.equal(validateCableConnection(pc1, 'eth0', pc2, 'eth0', 'straight', []).isValid, false);
  assert.equal(validateCableConnection(pc1, 'eth0', pc2, 'eth0', 'crossover', []).isValid, true);

  // PC to Switch requires Straight
  assert.equal(validateCableConnection(pc1, 'eth0', sw, 'fa1', 'crossover', []).isValid, false);
  assert.equal(validateCableConnection(pc1, 'eth0', sw, 'fa1', 'straight', []).isValid, true);
});

test('Ping succeeds over valid LAN path and fails on IP conflict or wrong subnet', () => {
  const pc1 = makePc('pc1', 'PC 1', '192.168.1.2');
  const pc2 = makePc('pc2', 'PC 2', '192.168.1.3');
  const sw = makeSwitch('sw1');
  const conns: NetworkConnection[] = [
    {
      id: 'c1',
      fromDeviceId: 'pc1',
      fromPortId: 'eth0',
      toDeviceId: 'sw1',
      toPortId: 'fa1',
      cableType: 'straight',
      isValid: true,
      validationMessage: 'OK',
    },
    {
      id: 'c2',
      fromDeviceId: 'pc2',
      fromPortId: 'eth0',
      toDeviceId: 'sw1',
      toPortId: 'fa2',
      cableType: 'straight',
      isValid: true,
      validationMessage: 'OK',
    },
  ];

  const okPing = simulatePing('pc1', '192.168.1.3', [pc1, pc2, sw], conns);
  assert.equal(okPing.success, true);
  assert.deepEqual(okPing.pathDeviceIds, ['pc1', 'sw1', 'pc2']);

  // Different subnet without router fails
  const pc3 = makePc('pc3', 'PC 3', '192.168.2.3', 100, 100, '192.168.2.1');
  const badPing = simulatePing('pc1', '192.168.2.3', [pc1, pc3, sw], [
    conns[0],
    { ...conns[1], fromDeviceId: 'pc3' },
  ]);
  assert.equal(badPing.success, false);
});

test('WiFi range, WPA2 password, and DHCP assignment behave accurately', () => {
  const ap: NetworkDevice = {
    id: 'ap1',
    type: 'access_point',
    name: 'AP Lab',
    x: 400,
    y: 300,
    ports: [
      { id: 'eth0', label: 'Uplink', kind: 'eth' },
      { id: 'wlan0', label: 'WLAN', kind: 'wifi' },
    ],
    ipConfig: { mode: 'static', ip: '192.168.1.254', subnetMask: '255.255.255.0', gateway: '192.168.1.1', dns: '8.8.8.8' },
    wifiApConfig: {
      ssid: 'LabSMK',
      password: 'password123',
      security: 'WPA2',
      radiusPx: 180,
      dhcpEnabled: true,
      dhcpStart: '192.168.1.100',
      dhcpEnd: '192.168.1.150',
      apIp: '192.168.1.254',
      subnetMask: '255.255.255.0',
      interferenceLevel: 'none',
    },
  };

  const laptopInRange: NetworkDevice = {
    id: 'lap1',
    type: 'laptop',
    name: 'Laptop 1',
    x: 450,
    y: 330,
    ports: [{ id: 'eth0', label: 'Eth0', kind: 'eth' }, { id: 'wlan0', label: 'WiFi', kind: 'wifi' }],
    ipConfig: { mode: 'dhcp', ip: '', subnetMask: '', gateway: '', dns: '' },
    wifiClientConfig: {
      targetApId: 'ap1',
      targetSsid: 'LabSMK',
      enteredPassword: 'password123',
      connected: false,
      signalPercent: 0,
      signalDbm: -90,
      statusReason: '',
    },
  };

  const updated = applyWifiAndDhcpState([ap, laptopInRange]);
  assert.equal(updated[1].wifiClientConfig?.connected, true);
  assert.equal(updated[1].ipConfig.ip, '192.168.1.100');

  // Move out of range
  const outOfRange = applyWifiAndDhcpState([ap, { ...laptopInRange, x: 800, y: 800 }]);
  assert.equal(outOfRange[1].wifiClientConfig?.connected, false);
  assert.equal(outOfRange[1].ipConfig.ip, '');
});

test('Mission 1 evaluator passes valid direct Crossover setup and fails Straight setup', () => {
  const pc1 = makePc('pc1', 'PC 1', '192.168.1.2');
  const pc2 = makePc('pc2', 'PC 2', '192.168.1.3');
  const mission1 = MISSIONS[0];

  const passEval = evaluateMission(mission1, [pc1, pc2], [
    {
      id: 'c1',
      fromDeviceId: 'pc1',
      fromPortId: 'eth0',
      toDeviceId: 'pc2',
      toPortId: 'eth0',
      cableType: 'crossover',
      isValid: true,
      validationMessage: 'OK',
    },
  ]);
  assert.equal(passEval.passed, true);
  assert.equal(passEval.score, 100);

  const failEval = evaluateMission(mission1, [pc1, pc2], [
    {
      id: 'c1',
      fromDeviceId: 'pc1',
      fromPortId: 'eth0',
      toDeviceId: 'pc2',
      toPortId: 'eth0',
      cableType: 'straight',
      isValid: false,
      validationMessage: 'Wrong cable',
    },
  ]);
  assert.equal(failEval.passed, false);
});
