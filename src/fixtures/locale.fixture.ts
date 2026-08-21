/**
 * ============================================================================
 * LOCALE, DEVANAGARI & CALENDAR TEST FIXTURES (R6-1)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * RideJaunm is built specifically for Nepal and the Himalayan riding community.
 * The UI must support:
 * 1. Multilingual labels: English (EN), Nepali (NE), and Hindi (HI).
 * 2. Long Devanagari strings to ensure layout elements do not break or clip when
 *    displaying lengthy Nepali ward and district addresses under dynamic type scale.
 * 3. Nepal Standard Timezone: `Asia/Kathmandu` (+05:45 offset, 345 minutes).
 * 4. Dual Calendar Formats: Gregorian (AD) and Bikram Sambat (BS: e.g. २०८३ भाद्र ०४).
 */

export interface LocaleTestSet {
  code: 'en' | 'ne' | 'hi';
  name: string;
  labels: {
    startRide: string;
    endRide: string;
    cancelSos: string;
    curvyRoute: string;
    supercurvyRoute: string;
    hazardWarning: string;
    offlinePack: string;
  };
}

/** English baseline UI labels */
export const localeEnFixture: LocaleTestSet = {
  code: 'en',
  name: 'English',
  labels: {
    startRide: 'START RIDE',
    endRide: 'END RIDE',
    cancelSos: 'CANCEL SOS',
    curvyRoute: 'Curvy',
    supercurvyRoute: 'Supercurvy',
    hazardWarning: 'Monsoon Landslide Hazard',
    offlinePack: 'Offline Map Pack',
  },
};

/** Nepali (Devanagari) baseline UI labels */
export const localeNeFixture: LocaleTestSet = {
  code: 'ne',
  name: 'नेपाली (Nepali)',
  labels: {
    startRide: 'राइड सुरु गर्नुहोस्',
    endRide: 'राइड समाप्त गर्नुहोस्',
    cancelSos: 'आपतकाल रद्द गर्नुहोस्',
    curvyRoute: 'घुमाउरो',
    supercurvyRoute: 'अत्यन्त घुमाउरो',
    hazardWarning: 'पहिरोको उच्च जोखिम',
    offlinePack: 'अफलाइन नक्सा प्याक',
  },
};

/** Hindi (Devanagari) baseline UI labels */
export const localeHiFixture: LocaleTestSet = {
  code: 'hi',
  name: 'हिन्दी (Hindi)',
  labels: {
    startRide: 'सवारी शुरू करें',
    endRide: 'सवारी समाप्त करें',
    cancelSos: 'आपातकाल रद्द करें',
    curvyRoute: 'मोड़दार',
    supercurvyRoute: 'अत्यधिक मोड़दार',
    hazardWarning: 'भूस्खलन की चेतावनी',
    offlinePack: 'ऑफ़लाइन मानचित्र पैक',
  },
};

/** Long Devanagari address strings for visual layout stress testing */
export const longDevanagariAddressFixture = {
  shortName: 'Koteshwor Chowk',
  shortNameNepali: 'कोटेश्वर चोक',
  fullAddressNepali:
    'काठमाडौँ महानगरपालिका वडा नं. ३२, कोटेश्वर जडीबुटी करिडोर, बागमती प्रदेश, नेपाल',
  remoteHimalayanAddressNepali:
    'लोमान्थाङ गाउँपालिका वडा नं. ०१, कोरला नाका सडक खण्ड, उपल्लो मुस्ताङ, गण्डकी प्रदेश',
};

/** Nepal timezone constants (+05:45 / 345 minutes offset) */
export const nepalTimezoneFixture = {
  ianaTimezone: 'Asia/Kathmandu',
  utcOffsetMinutes: 345, // UTC+5:45
  formattedOffset: '+05:45',
};

/** Dual Calendar AD/BS test fixtures */
export interface DualCalendarFixture {
  isoUtc: string;
  gregorianDateAd: string;     // Gregorian YYYY-MM-DD
  bikramSambatBs: string;      // Bikram Sambat in Nepali numerals/script
  bikramSambatRomanBs: string; // Bikram Sambat in Roman English script
}

export const calendarTestFixtures: DualCalendarFixture[] = [
  {
    isoUtc: '2026-08-20T17:45:00Z',
    gregorianDateAd: '2026-08-20',
    bikramSambatBs: '२०८३ भाद्र ०४',
    bikramSambatRomanBs: '2083 Bhadra 04',
  },
  {
    isoUtc: '2026-04-14T06:00:00Z', // Nepali New Year
    gregorianDateAd: '2026-04-14',
    bikramSambatBs: '२०८३ वैशाख ०१',
    bikramSambatRomanBs: '2083 Baisakh 01',
  },
  {
    isoUtc: '2026-10-20T10:30:00Z', // Dashain festival period
    gregorianDateAd: '2026-10-20',
    bikramSambatBs: '२०८३ कार्तिक ०३',
    bikramSambatRomanBs: '2083 Kartik 03',
  },
];
