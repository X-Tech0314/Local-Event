export default function AddressDetails({
  houseNo, setHouseNo,
  streetName, setStreetName,
  subdivision, setSubdivision,
  zipCode, setZipCode,
  regions, provinces, cities, barangays,
  psgcLoading, noProvinceRegion, psgcSel,
  selectRegion, selectProvince, selectCity, selectBarangay,
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
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              onBlur={() => touch('streetName')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                touched.streetName && !streetName.trim()
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
              placeholder="Lily St."
            />
            {touched.streetName && !streetName.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Street name is required.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Zip Code</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onBlur={() => touch('zipCode')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                touched.zipCode && !zipCode.trim()
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
              placeholder="1121"
            />
            {touched.zipCode && !zipCode.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Zip Code is required.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1">
              Region {psgcLoading.regions && <span className="text-[10px] text-[#A855F7] animate-pulse">Loading...</span>}
            </label>
            <select
              value={psgcSel.regionCode}
              onChange={(e) => {
                selectRegion(e.target.value);
                touch('region');
              }}
              onBlur={() => touch('region')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 ${
                touched.region && !psgcSel.regionCode
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
            {touched.region && !psgcSel.regionCode && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a region.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1">
              Province {psgcLoading.provinces && <span className="text-[10px] text-[#A855F7] animate-pulse">Loading...</span>}
            </label>
            <select
              value={psgcSel.provinceCode}
              disabled={!psgcSel.regionCode || noProvinceRegion}
              onChange={(e) => {
                selectProvince(e.target.value);
                touch('province');
              }}
              onBlur={() => touch('province')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 disabled:bg-slate-900/30 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed ${
                touched.province && psgcSel.regionCode && !psgcSel.provinceCode && !noProvinceRegion
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            {touched.province && psgcSel.regionCode && !psgcSel.provinceCode && !noProvinceRegion && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a province.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1">
              City / Municipality {psgcLoading.cities && <span className="text-[10px] text-[#A855F7] animate-pulse">Loading...</span>}
            </label>
            <select
              value={psgcSel.cityMunCode}
              disabled={!psgcSel.provinceCode && !noProvinceRegion}
              onChange={(e) => {
                selectCity(e.target.value);
                touch('city');
              }}
              onBlur={() => touch('city')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 disabled:bg-slate-900/30 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed ${
                touched.city && (psgcSel.provinceCode || noProvinceRegion) && !psgcSel.cityMunCode
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select City / Mun.</option>
              {cities.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            {touched.city && (psgcSel.provinceCode || noProvinceRegion) && !psgcSel.cityMunCode && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a city or municipality.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1">
              Barangay {psgcLoading.barangays && <span className="text-[10px] text-[#A855F7] animate-pulse">Loading...</span>}
            </label>
            <select
              value={psgcSel.barangayCode}
              disabled={!psgcSel.cityMunCode}
              onChange={(e) => { selectBarangay(e.target.value); touch('barangay'); }}
              onBlur={() => touch('barangay')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 disabled:bg-slate-900/30 disabled:text-white/30 disabled:border-white/5 disabled:cursor-not-allowed ${
                touched.barangay && psgcSel.cityMunCode && !psgcSel.barangayCode
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
            >
              <option value="">Select Barangay</option>
              {barangays.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
            {touched.barangay && psgcSel.cityMunCode && !psgcSel.barangayCode && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please select a barangay.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
