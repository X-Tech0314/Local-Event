import { useState, useEffect, useCallback } from 'react';

const BASE = 'https://psgc.gitlab.io/api';
const cache = {};

/**
 * Popular name aliases for PSGC barangays whose official names
 * differ from how locals commonly refer to them.
 * Key = official PSGC code, Value = array of alternate search terms.
 */
const BRGY_ALIASES = {
  '137404124': ['diliman', 'up diliman', 'u.p. diliman'],   // U.P. Campus, QC
  '137404125': ['up village', 'diliman village'],            // U.P. Village, QC
  '137401006': ['dasmarinas village', 'dasma village', 'dasmarinas'],  // Dasmariñas, Makati
  '137601011': ['fort bonifacio', 'bgc', 'bonifacio global city', 'the fort'],  // Fort Bonifacio, Taguig
  '137601012': ['western bicutan', 'south supermarket'],     // Western Bicutan, Taguig
  '133901003': ['ayala alabang', 'alabang', 'filinvest'],    // Ayala Alabang, Muntinlupa
};

async function psgcFetch(path) {
  if (cache[path]) return cache[path];
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`PSGC fetch failed: ${path}`);
  const data = await res.json();
  // Attach alias array to each barangay for enhanced search
  const enriched = data.map(item => ({
    ...item,
    aliases: BRGY_ALIASES[item.code] || [],
  }));
  const sorted = enriched.sort((a, b) => a.name.localeCompare(b.name));
  cache[path] = sorted;
  return sorted;
}

// Sentinel value used when a region has no provinces (e.g. NCR, BARMM)
const DIRECT_REGION = '__direct__';

/**
 * usePsgc — cascading PSGC location hook
 *
 * Handles province-less regions (NCR, BARMM, etc.) automatically:
 * when a region has no provinces, cities are fetched directly from
 * the region endpoint and the province step is skipped.
 *
 * Returns:
 *   regions, provinces, cities, barangays — arrays of { code, name }
 *   loading  — { regions, provinces, cities, barangays }
 *   noProvinceRegion — true when selected region has no provinces
 *   psgcSel  — { regionCode, provinceCode, cityMunCode, barangayCode }
 *   selectRegion / selectProvince / selectCity / selectBarangay
 *   getRegionName / getProvinceName / getCityName / getBarangayName
 */
export default function usePsgc(initial = {}) {
  const [psgcSel, setPsgcSel] = useState({
    regionCode:   initial.regionCode   || '',
    provinceCode: initial.provinceCode || '',
    cityMunCode:  initial.cityMunCode  || '',
    barangayCode: initial.barangayCode || '',
  });

  const [regions,   setRegions]   = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities,    setCities]    = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [noProvinceRegion, setNoProvinceRegion] = useState(false);
  const [loading, setLoading] = useState({
    regions: true, provinces: false, cities: false, barangays: false,
  });

  // ── Load regions on mount ─────────────────────────────────────────
  useEffect(() => {
    psgcFetch('/regions/')
      .then(data => { setRegions(data); setLoading(l => ({ ...l, regions: false })); })
      .catch(() => setLoading(l => ({ ...l, regions: false })));
  }, []);

  // ── Load provinces when region changes ────────────────────────────
  useEffect(() => {
    if (!psgcSel.regionCode) {
      setProvinces([]); setCities([]); setBarangays([]);
      setNoProvinceRegion(false);
      return;
    }

    setLoading(l => ({ ...l, provinces: true }));
    setProvinces([]); setCities([]); setBarangays([]);
    setNoProvinceRegion(false);

    psgcFetch(`/regions/${psgcSel.regionCode}/provinces/`)
      .then(data => {
        setLoading(l => ({ ...l, provinces: false }));

        if (data.length === 0) {
          // Province-less region (e.g. NCR, BARMM) — skip to city level
          setNoProvinceRegion(true);
          setProvinces([]);
          // Auto-set sentinel provinceCode so the city effect fires
          setPsgcSel(s => ({ ...s, provinceCode: DIRECT_REGION, cityMunCode: '', barangayCode: '' }));
        } else {
          setNoProvinceRegion(false);
          setProvinces(data);
        }
      })
      .catch(() => setLoading(l => ({ ...l, provinces: false })));
  }, [psgcSel.regionCode]);

  // ── Load cities when province changes ─────────────────────────────
  useEffect(() => {
    if (!psgcSel.provinceCode) { setCities([]); setBarangays([]); return; }

    setLoading(l => ({ ...l, cities: true }));
    setCities([]); setBarangays([]);

    // If sentinel: fetch from region directly; otherwise from province
    const path = psgcSel.provinceCode === DIRECT_REGION
      ? `/regions/${psgcSel.regionCode}/cities-municipalities/`
      : `/provinces/${psgcSel.provinceCode}/cities-municipalities/`;

    psgcFetch(path)
      .then(data => { setCities(data); setLoading(l => ({ ...l, cities: false })); })
      .catch(() => setLoading(l => ({ ...l, cities: false })));
  }, [psgcSel.provinceCode, psgcSel.regionCode]);

  // ── Load barangays when city changes ──────────────────────────────
  useEffect(() => {
    if (!psgcSel.cityMunCode) { setBarangays([]); return; }
    setLoading(l => ({ ...l, barangays: true }));
    setBarangays([]);
    psgcFetch(`/cities-municipalities/${psgcSel.cityMunCode}/barangays/`)
      .then(data => { setBarangays(data); setLoading(l => ({ ...l, barangays: false })); })
      .catch(() => setLoading(l => ({ ...l, barangays: false })));
  }, [psgcSel.cityMunCode]);

  // ── Selectors ─────────────────────────────────────────────────────
  const selectRegion = useCallback((code) => {
    setPsgcSel({ regionCode: code, provinceCode: '', cityMunCode: '', barangayCode: '' });
  }, []);

  const selectProvince = useCallback((code) => {
    setPsgcSel(s => ({ ...s, provinceCode: code, cityMunCode: '', barangayCode: '' }));
  }, []);

  const selectCity = useCallback((code) => {
    setPsgcSel(s => ({ ...s, cityMunCode: code, barangayCode: '' }));
  }, []);

  const selectBarangay = useCallback((code) => {
    setPsgcSel(s => ({ ...s, barangayCode: code }));
  }, []);

  // ── Name helpers ──────────────────────────────────────────────────
  const getRegionName   = (code) => regions.find(r => r.code === code)?.name || '';
  const getProvinceName = (code) => {
    if (code === DIRECT_REGION) return '';
    return provinces.find(p => p.code === code)?.name || '';
  };
  const getCityName     = (code) => cities.find(c => c.code === code)?.name || '';
  const getBarangayName = (code) => barangays.find(b => b.code === code)?.name || '';

  return {
    regions, provinces, cities, barangays,
    loading,
    noProvinceRegion,
    psgcSel, setPsgcSel,
    selectRegion, selectProvince, selectCity, selectBarangay,
    getRegionName, getProvinceName, getCityName, getBarangayName,
  };
}
