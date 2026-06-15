import React from 'react';
import { philippineAddressData } from '../../../utils/constants.js';

export default function AddressDetails({
  houseNo, setHouseNo,
  street, setStreet,
  subdivision, setSubdivision,
  region, setRegion,
  province, setProvince,
  city, setCity,
  barangay, setBarangay,
  touched, touch
}) {
  return (
    <div>
      <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4">2. Address Details</h4>
      <div className="space-y-4 text-slate-800">
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1.5">Country</label>
          <input
            type="text"
            value="Philippines"
            disabled
            className="w-full rounded-lg border border-white/5 bg-slate-900/20 px-3 py-2 text-white/30 text-sm outline-none cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">House / Unit / Bldg. No.</label>
            <input
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              onBlur={() => touch('houseNo')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                touched.houseNo && !houseNo.trim()
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
              placeholder="Block 1 Lot 2"
            />
            {touched.houseNo && !houseNo.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">House / Unit No. is required.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Street Name</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              onBlur={() => touch('street')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                touched.street && !street.trim()
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
              placeholder="Lily St."
            />
            {touched.street && !street.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Street name is required.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1.5">Subdivision / Village / Bldg. (Optional)</label>
          <input
            type="text"
            value={subdivision}
            onChange={(e) => setSubdivision(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm outline-none focus:border-[#A855F7]/50 transition-colors placeholder:text-white/25"
            placeholder="Phase 3, Meadow Ville"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Region</label>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setProvince('');
                setCity('');
                setBarangay('');
                touch('region');
              }}
              onBlur={() => touch('region')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 ${
                touched.region && !region
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select Region</option>
              {Object.keys(philippineAddressData).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {touched.region && !region && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a region.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Province</label>
            <select
              value={province}
              disabled={!region}
              onChange={(e) => {
                setProvince(e.target.value);
                setCity('');
                setBarangay('');
                touch('province');
              }}
              onBlur={() => touch('province')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 disabled:bg-slate-900/30 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed ${
                touched.province && region && !province
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select Province</option>
              {region &&
                Object.keys(philippineAddressData[region].provinces).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
            </select>
            {touched.province && region && !province && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a province.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">City / Municipality</label>
            <select
              value={city}
              disabled={!province}
              onChange={(e) => {
                setCity(e.target.value);
                setBarangay('');
                touch('city');
              }}
              onBlur={() => touch('city')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 disabled:bg-slate-900/30 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed ${
                touched.city && province && !city
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select City / Mun.</option>
              {region && province &&
                Object.keys(philippineAddressData[region].provinces[province].cities).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
            </select>
            {touched.city && province && !city && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a city or municipality.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Barangay</label>
            <select
              value={barangay}
              disabled={!city}
              onChange={(e) => { setBarangay(e.target.value); touch('barangay'); }}
              onBlur={() => touch('barangay')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 disabled:bg-slate-900/30 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed ${
                touched.barangay && city && !barangay
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select Barangay</option>
              {region && province && city &&
                philippineAddressData[region].provinces[province].cities[city].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
            </select>
            {touched.barangay && city && !barangay && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a barangay.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
