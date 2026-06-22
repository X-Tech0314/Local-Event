/**
 * LocationEventFilter.jsx
 *
 * A fully self-contained dropdown filter panel used by both VenuesPanel
 * and EventsPanel.  Powered by the already-installed `phil-reg-prov-mun-brgy`
 * PSGC package — no new installs needed.
 *
 * Props
 * ─────
 *  mode       : 'venues' | 'events'
 *  filters    : { region, province, city, category, status }
 *  onChange   : (updatedFilters) => void
 *  onClear    : () => void
 *  activeCount: number of active filters (for badge)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, MapPin, Tag, CheckCircle } from 'lucide-react';
import usePsgc from '../hooks/usePsgc';

// ── Event categories (matches your CreateEventPanel category list) ──
const EVENT_CATEGORIES = [
  'Technology',
  'Arts & Culture',
  'Music & Concerts',
  'Sports & Fitness',
  'Food & Beverage',
  'Business & Networking',
  'Education & Training',
  'Government & Civic',
  'Health & Wellness',
  'Entertainment',
  'Private Gatherings',
  'Religious',
  'Environmental',
  'Charity & Fundraising',
  'Other',
];

// ── Venue types (matches your AddVenueForm / Venue model type field) ──
const VENUE_TYPES = [
  'Indoor Hall',
  'Outdoor Field',
  'Covered Court',
  'Gymnasium',
  'Auditorium',
  'Conference Room',
  'Hotel Ballroom',
  'Restaurant / Function Room',
  'Open Air / Park',
  'Beach / Resort',
  'Rooftop',
  'Standalone Building / Street Address',
  'Other',
];

// ── Event statuses ──
const EVENT_STATUSES = [
  'Published',
  'Pending',
  'Done',
  'Full',
  'Discontinued',
  'Rescheduled',
];

// ── Small labelled select ──────────────────────────────────────────
function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function LocationEventFilter({ mode = 'events', filters, onChange, onClear, activeCount = 0 }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Use the new 2026 PSGC hook!
  const { regions, provinces, cities, setPsgcSel } = usePsgc({
    regionCode: filters.region,
    provinceCode: filters.province,
    cityMunCode: filters.city,
  });

  // Sync the hook state when filters change externally (e.g. on clear)
  useEffect(() => {
    setPsgcSel({
      regionCode: filters.region || '',
      provinceCode: filters.province || '',
      cityMunCode: filters.city || '',
      barangayCode: ''
    });
  }, [filters.region, filters.province, filters.city, setPsgcSel]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const regionOptions = regions.map((r) => ({ value: r.code, label: r.name }));
  const provinceOptions = provinces.map((p) => ({ value: p.code, label: p.name }));
  const cityOptions = cities.map((c) => ({ value: c.code, label: c.name }));

  const handleChange = (key, value) => {
    let updated = { ...filters, [key]: value };
    // Cascade reset and attach names for parent filtering
    if (key === 'region') {
      updated.province = ''; updated.city = '';
      updated.regionName = value ? regions.find(r => r.code === value)?.name : '';
      updated.provinceName = ''; updated.cityName = '';
    }
    if (key === 'province') {
      updated.city = '';
      updated.provinceName = value ? provinces.find(p => p.code === value)?.name : '';
      updated.cityName = '';
    }
    if (key === 'city') {
      updated.cityName = value ? cities.find(c => c.code === value)?.name : '';
    }
    if (key === 'category' || key === 'status') {
      // standard handling
    }
    onChange(updated);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-5 py-3 rounded border text-sm font-bold transition-all active:scale-95 ${
          open || activeCount > 0
            ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <Filter size={16} />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-white text-purple-700 text-[10px] font-black">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-[500] w-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in origin-top-right">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-purple-600" />
              <span className="text-sm font-black text-slate-900 dark:text-white">Filter {mode === 'venues' ? 'Venues' : 'Events'}</span>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-full">
                  {activeCount} active
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* ── Location Section ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={13} className="text-purple-500" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Location</span>
              </div>
              <div className="space-y-3">
                <FilterSelect
                  label="Region"
                  value={filters.region}
                  onChange={(v) => handleChange('region', v)}
                  options={regionOptions}
                  placeholder="All Regions"
                />
                <FilterSelect
                  label="Province"
                  value={filters.province}
                  onChange={(v) => handleChange('province', v)}
                  options={provinceOptions}
                  placeholder={filters.region ? 'All Provinces' : 'Select a region first'}
                />
                <FilterSelect
                  label="City / Municipality"
                  value={filters.city}
                  onChange={(v) => handleChange('city', v)}
                  options={cityOptions}
                  placeholder={filters.province ? 'All Cities' : 'Select a province first'}
                />
              </div>
            </div>

            {/* ── Category / Type Section ── */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={13} className="text-purple-500" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {mode === 'venues' ? 'Venue Type' : 'Event Category'}
                </span>
              </div>

              {mode === 'venues' ? (
                <FilterSelect
                  label="Type"
                  value={filters.category}
                  onChange={(v) => handleChange('category', v)}
                  options={VENUE_TYPES}
                  placeholder="All Types"
                />
              ) : (
                <>
                  <FilterSelect
                    label="Category"
                    value={filters.category}
                    onChange={(v) => handleChange('category', v)}
                    options={EVENT_CATEGORIES}
                    placeholder="All Categories"
                  />
                  <div className="mt-3">
                    <FilterSelect
                      label="Status"
                      value={filters.status}
                      onChange={(v) => handleChange('status', v)}
                      options={EVENT_STATUSES}
                      placeholder="All Statuses"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <button
              onClick={() => { onClear(); }}
              disabled={activeCount === 0}
              className="text-sm font-bold text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <X size={14} /> Clear all
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors"
            >
              <CheckCircle size={14} /> Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
