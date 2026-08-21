/**
 * ============================================================================
 * SOS CONSOLE & SAFETY CAPABILITY GATE STABLE FIXTURES (R15)
 * ============================================================================
 *
 * Scope boundary:
 * Deterministic pre-authored fixture data for safety capability snapshots,
 * channel evidence cascades, and synthetic location labels.
 *
 * TRUTH & EVIDENCE INVARIANTS:
 * 1. Never use 'sent', 'delivered', 'received', 'notified', or 'dispatched'.
 * 2. Every channel is 'unavailable', 'local_observation', 'device_reported', or 'simulated_preview'.
 * 3. Pre-authored synthetic locations only; zero live clock or real device coordinates.
 */

import {
  FixtureSafetyCapabilitySnapshot,
  FixtureSafetyEvidenceItem,
} from '../domain/sosConsole';

export const defaultSafetyEvidenceItems: FixtureSafetyEvidenceItem[] = [
  {
    id: 'ev-gps',
    channelName: '1. Local Device GPS',
    channelNameNepali: '१. स्थानीय जीपीएस',
    evidenceState: 'local_observation',
    statusLabel: 'LOCAL FIXTURE (±15m)',
    statusLabelNepali: 'स्थानीय फिक्स्चर',
    detail: 'Synthetic coordinates rendered from local fixture metadata.',
    detailNepali: 'स्थानीय फिक्स्चर विवरणबाट लिइएको काल्पनिक स्थान।',
    sourceVersion: 'NP-SOS-2026.08.15',
    syntheticDisclosure: 'Local observation only · Not broadcasted to emergency responders',
  },
  {
    id: 'ev-mesh',
    channelName: '2. BLE Multi-Hop Mesh',
    channelNameNepali: '२. ब्लुटुथ मेस नेटवर्क',
    evidenceState: 'device_reported',
    statusLabel: 'MESH: ZERO PEERS',
    statusLabelNepali: 'मेस: शून्य पियर',
    detail: 'BLE radio observation idle · Zero relay peers connected in fixture preview.',
    detailNepali: 'ब्लुटुथ मेसमा कुनै पियर फेला परेन।',
    sourceVersion: 'NP-SOS-2026.08.15',
    syntheticDisclosure: 'Device-reported state · No relay packets transmitted',
  },
  {
    id: 'ev-cellular',
    channelName: '3. Nepal Cellular (NTC/Ncell)',
    channelNameNepali: '३. नेपाल टेलिकम / एनसेल',
    evidenceState: 'local_observation',
    statusLabel: 'CELLULAR OBSERVED',
    statusLabelNepali: 'सेलुलर संकेत उपलब्ध',
    detail: 'Carrier signal observed · No emergency service dispatch integration.',
    detailNepali: 'नेटवर्क संकेत उपलब्ध तर आपतकालीन सेवामा जडान गरिएको छैन।',
    sourceVersion: 'NP-SOS-2026.08.15',
    syntheticDisclosure: 'Local observation · No SMS or call was initiated',
  },
  {
    id: 'ev-satellite',
    channelName: '4. Satellite Uplink',
    channelNameNepali: '४. भू-उपग्रह जडान',
    evidenceState: 'unavailable',
    statusLabel: 'UNAVAILABLE',
    statusLabelNepali: 'अनुपलब्ध',
    detail: 'Direct-to-satellite emergency hardware unavailable on device.',
    detailNepali: 'यस उपकरणमा स्याटेलाइट हार्डवेयर उपलब्ध छैन।',
    sourceVersion: 'NP-SOS-2026.08.15',
    syntheticDisclosure: 'Capability unavailable on current hardware',
  },
  {
    id: 'ev-dispatch',
    channelName: '5. Public Service Delivery Proof',
    channelNameNepali: '५. आपतकालीन उद्धार प्राप्ति प्रमाण',
    evidenceState: 'unavailable',
    statusLabel: 'UNVERIFIED / NO CLAIM',
    statusLabelNepali: 'अपुष्ट / कुनै दाबी छैन',
    detail: 'Never claims false delivery · No responder receipt verified.',
    detailNepali: 'कुनै पनि आपतकालीन सेवा वा उद्धारकर्तालाई जानकारी पुगेको छैन।',
    sourceVersion: 'NP-SOS-2026.08.15',
    syntheticDisclosure: 'Zero delivery claim invariant strictly enforced',
  },
];

export const defaultSafetyCapabilitySnapshot: FixtureSafetyCapabilitySnapshot = {
  id: 'sos-cap-default',
  cellularObserved: true,
  cellularCarrierLabel: 'Nepal Telecom (NTC 4G) · Integration Unverified',
  gpsFreshness: 'fresh',
  lastKnownLocationSynthetic: '27.7172° N, 85.3240° E · Prithvi Highway Sector KM-42 (Synthetic Fix)',
  meshCapability: 'zero_peers',
  satelliteAvailable: false,
  batteryHealth: 'normal',
  batteryPercent: 82,
  evidenceItems: defaultSafetyEvidenceItems,
  sourceVersion: 'NP-SOS-2026.08.15',
  syntheticDisclosure: 'Safety preview only — this build cannot contact emergency services or your contacts',
};

export const deadZoneSafetyCapabilitySnapshot: FixtureSafetyCapabilitySnapshot = {
  id: 'sos-cap-deadzone',
  cellularObserved: false,
  cellularCarrierLabel: 'Cellular Dead Zone · Zero Carrier Signal',
  gpsFreshness: 'last_known',
  lastKnownLocationSynthetic: '28.2096° N, 83.9856° E · Pokhara-Baglung Sector (Synthetic Fix)',
  meshCapability: 'zero_peers',
  satelliteAvailable: false,
  batteryHealth: 'low',
  batteryPercent: 18,
  evidenceItems: [
    {
      id: 'ev-gps-deadzone',
      channelName: '1. Local Device GPS',
      channelNameNepali: '१. स्थानीय जीपीएस',
      evidenceState: 'local_observation',
      statusLabel: 'LAST-KNOWN FIXTURE (±45m)',
      statusLabelNepali: 'पछिल्लो ज्ञात फिक्स्चर',
      detail: 'Last-known synthetic coordinate from offline cache.',
      detailNepali: 'अफलाइन क्यासबाट प्राप्त पछिल्लो काल्पनिक स्थान।',
      sourceVersion: 'NP-SOS-2026.08.15',
      syntheticDisclosure: 'Local observation only',
    },
    {
      id: 'ev-mesh-deadzone',
      channelName: '2. BLE Multi-Hop Mesh',
      channelNameNepali: '२. ब्लुटुथ मेस',
      evidenceState: 'device_reported',
      statusLabel: 'MESH: ZERO PEERS',
      statusLabelNepali: 'मेस: शून्य पियर',
      detail: 'Zero mesh peers within radio range.',
      detailNepali: 'कुनै पनि मेस पियर सम्पर्कमा छैन।',
      sourceVersion: 'NP-SOS-2026.08.15',
      syntheticDisclosure: 'Device-reported state',
    },
    {
      id: 'ev-cellular-deadzone',
      channelName: '3. Nepal Cellular',
      channelNameNepali: '३. सेलुलर नेटवर्क',
      evidenceState: 'unavailable',
      statusLabel: 'DEAD ZONE (UNAVAILABLE)',
      statusLabelNepali: 'डेड जोन (अनुपलब्ध)',
      detail: 'Zero cellular towers detected in mountain corridor.',
      detailNepali: 'पहाडी क्षेत्रमा कुनै पनि मोबाइल टावर फेला परेन।',
      sourceVersion: 'NP-SOS-2026.08.15',
      syntheticDisclosure: 'Carrier signal unavailable',
    },
    {
      id: 'ev-satellite-deadzone',
      channelName: '4. Satellite Uplink',
      channelNameNepali: '४. स्याटेलाइट',
      evidenceState: 'unavailable',
      statusLabel: 'UNAVAILABLE',
      statusLabelNepali: 'अनुपलब्ध',
      detail: 'Direct-to-satellite hardware unavailable.',
      detailNepali: 'स्याटेलाइट हार्डवेयर अनुपलब्ध।',
      sourceVersion: 'NP-SOS-2026.08.15',
      syntheticDisclosure: 'Hardware unavailable',
    },
    {
      id: 'ev-dispatch-deadzone',
      channelName: '5. Public Service Delivery Proof',
      channelNameNepali: '५. उद्धार प्राप्ति प्रमाण',
      evidenceState: 'unavailable',
      statusLabel: 'UNVERIFIED / NO CLAIM',
      statusLabelNepali: 'अपुष्ट / कुनै दाबी छैन',
      detail: 'No public service or responder dispatch claim.',
      detailNepali: 'कुनै पनि आपतकालीन सेवामा जानकारी पुगेको छैन।',
      sourceVersion: 'NP-SOS-2026.08.15',
      syntheticDisclosure: 'Zero delivery claim invariant',
    },
  ],
  sourceVersion: 'NP-SOS-2026.08.15',
  syntheticDisclosure: 'Safety preview only — this build cannot contact emergency services or your contacts',
};
