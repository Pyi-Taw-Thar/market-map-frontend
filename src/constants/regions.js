// Myanmar States and Regions List (၁၄ တိုင်းဒေသကြီးနှင့် ပြည်နယ်များ + နေပြည်တော် ပြည်ထောင်စုနယ်မြေ)
export const MYANMAR_STATES = [
  { id: 'kachin', nameEn: 'Kachin State', nameMm: 'ကချင်ပြည်နယ်' },
  { id: 'kayah', nameEn: 'Kayah State', nameMm: 'ကယားပြည်နယ်' },
  { id: 'kayin', nameEn: 'Kayin State', nameMm: 'ကရင်ပြည်နယ်' },
  { id: 'chin', nameEn: 'Chin State', nameMm: 'ချင်းပြည်နယ်' },
  { id: 'sagaing', nameEn: 'Sagaing Region', nameMm: 'စစ်ကိုင်းတိုင်းဒေသကြီး' },
  { id: 'tanintharyi', nameEn: 'Tanintharyi Region', nameMm: 'တနင်္သာရီတိုင်းဒေသကြီး' },
  { id: 'bago', nameEn: 'Bago Region', nameMm: 'ပဲခူးတိုင်းဒေသကြီး' },
  { id: 'magway', nameEn: 'Magway Region', nameMm: 'မကွေးတိုင်းဒေသကြီး' },
  { id: 'mandalay', nameEn: 'Mandalay Region', nameMm: 'မန္တလေးတိုင်းဒေသကြီး' },
  { id: 'mon', nameEn: 'Mon State', nameMm: 'မွန်ပြည်နယ်' },
  { id: 'rakhine', nameEn: 'Rakhine State', nameMm: 'ရခိုင်ပြည်နယ်' },
  { id: 'yangon', nameEn: 'Yangon Region', nameMm: 'ရန်ကုန်တိုင်းဒေသကြီး' },
  { id: 'shan', nameEn: 'Shan State', nameMm: 'ရှမ်းပြည်နယ်' },
  { id: 'ayeyarwady', nameEn: 'Ayeyarwady Region', nameMm: 'ဧရာဝတီတိုင်းဒေသကြီး' },
  { id: 'naypyidaw', nameEn: 'Naypyidaw Union Territory', nameMm: 'နေပြည်တော် ပြည်ထောင်စုနယ်မြေ' },
];

/**
 * Match address component name from Google Maps Geocoder to standard Myanmar State/Region
 */
export function matchStateFromGeocoder(geocoderStateName) {
  if (!geocoderStateName) return '';
  const normalized = geocoderStateName.toLowerCase().replace(/region|division|state|union territory/gi, '').trim();

  const found = MYANMAR_STATES.find(s => {
    const sNorm = s.nameEn.toLowerCase().replace(/region|division|state|union territory/gi, '').trim();
    return normalized.includes(sNorm) || sNorm.includes(normalized) || geocoderStateName.includes(s.nameEn);
  });

  return found ? found.nameEn : geocoderStateName;
}
