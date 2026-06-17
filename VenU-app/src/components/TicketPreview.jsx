import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Lock } from 'lucide-react';

export default function TicketPreview({ themeColor = '#a855f7', eventData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // If no ticket tiers exist, fallback to a single default tier for the preview
  const tiers = eventData?.ticketTiers && eventData.ticketTiers.length > 0 
    ? eventData.ticketTiers 
    : [{ TierName: eventData?.tierName || 'Standard', ValidityScope: eventData?.validityScope }];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % tiers.length);
  };

  return (
    <div className="relative w-80 h-[480px] select-none" onClick={handleNext}>
      {tiers.map((tier, index) => {
        // Calculate stacking order
        const distance = (index - activeIndex + tiers.length) % tiers.length;
        
        // Only show top 3 cards to prevent performance issues and visual clutter
        if (distance > 2) return null;

        const isTop = distance === 0;
        const translateY = distance * 20; // Move down 20px per card
        const scale = 1 - (distance * 0.05); // Shrink 5% per card
        const zIndex = 30 - distance;
        const opacity = 1 - (distance * 0.2);

        return (
          <div 
            key={index}
            className="absolute top-0 left-0 w-80 h-[480px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-500 ease-in-out cursor-pointer"
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              zIndex: zIndex,
              opacity: opacity
            }}
          >
      
      {/* Top Section: Event Banner & Image */}
      <div className="relative w-full h-44 bg-slate-900 overflow-hidden">
        {eventData?.image ? (
            <img 
              src={eventData.image} 
              alt="Event Banner" 
              className="w-full h-full object-cover opacity-80"
            />
        ) : (
            <div 
              className="w-full h-full opacity-80" 
              style={{ background: `linear-gradient(to bottom right, ${themeColor}, #312e81)` }} 
            />
        )}
        {/* Dynamic Accent Overlay */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-multiply" 
          style={{ backgroundColor: themeColor }}
        />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="text-[10px] tracking-widest text-white uppercase font-bold bg-black/40 px-2 py-0.5 rounded">
            {eventData?.category || 'Concerts'}
          </span>
          <h3 className="text-white font-black text-lg uppercase tracking-tight mt-1 truncate">
            {eventData?.title || 'Event Title'}
          </h3>
        </div>
      </div>

      {/* Ticket Stub Notch Separator */}
      <div className="relative flex items-center justify-between px-0 -my-3 z-10">
        <div className="w-5 h-6 bg-slate-950 rounded-r-full shadow-inner" />
        <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
        <div className="w-5 h-6 bg-slate-950 rounded-l-full shadow-inner" />
      </div>

      {/* Bottom Section: Info & QR Code */}
      <div className="p-5 flex flex-col items-center justify-between flex-grow bg-white">
        {/* Logistics Row */}
        <div className="w-full flex justify-between text-center mb-2">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date</p>
            <p className="text-sm font-black text-slate-800">{eventData?.date || 'TBD'}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Time</p>
            <p className="text-sm font-black text-slate-800">{eventData?.time || 'TBD'}</p>
          </div>
        </div>

        {/* Location Info */}
        <div className="w-full text-center mb-2 px-2">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
          <p className="text-xs font-black text-slate-800 leading-tight truncate">
            {eventData?.venueType === 'Mall / Commercial Complex' || eventData?.venueType === 'Exhibition Hall / Convention Center' 
              ? `${eventData?.proximityAnchor || 'Venue'} - ${eventData?.floorLevel || 'Floor'}`
              : eventData?.streetAddress || 'Street Address'
            }
          </p>
          {(eventData?.venueType === 'Mall / Commercial Complex' || eventData?.venueType === 'Exhibition Hall / Convention Center') && eventData?.wingSection && (
            <span className="inline-block px-2 py-[1px] mt-0.5 bg-slate-100 rounded-md text-[8px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
              {eventData.wingSection}
            </span>
          )}
        </div>

        {/* Center: Styled QR Code Container or Invite Code */}
        <div 
          className="p-3 rounded-2xl bg-slate-50 transition-all duration-300 border-2 flex flex-col items-center justify-center w-32 h-32"
          style={{ borderColor: `${themeColor}20` }}
        >
          {eventData?.accessType === 'Private' ? (
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <Lock className="w-8 h-8 text-slate-700" />
              <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Invite Code</div>
              <div className="text-lg font-black text-slate-800 tracking-widest">A7X9-B2</div>
            </div>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center">
              <QRCode
                value={eventData?.ticketId || "https://yourplatform.com/verify/ticket-123"}
                size={96}
                level="H"
                fgColor="#0f172a"
                bgColor="transparent"
              />
            </div>
          )}
        </div>

         {/* Footer: Dynamic Ticket Tier Label */}
        <div className="text-center mt-2">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            {eventData?.accessType || 'Public Admission'}
          </p>
          <p 
            className="text-base font-black uppercase tracking-widest transition-colors duration-300"
            style={{ color: themeColor }}
          >
            {tier.TierName || tier.tierName || 'Standard'}
          </p>
          {(tier.ValidityScope || tier.validityScope) && (
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-full mt-1">
                  <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest">
                      🎟️ {
                          (tier.ValidityScope || tier.validityScope) === 'Full Event Multi-Pass (All Days)' ? 'FULL TOUR PASS' :
                          (tier.ValidityScope || tier.validityScope) === 'Day 1 Access Only' ? 'DAY 1 PASS' :
                          (tier.ValidityScope || tier.validityScope) === 'Day 2 Access Only' ? 'DAY 2 PASS' : 'SINGLE SESSION'
                      }
                  </span>
              </div>
          )}
        </div>
      </div>
    </div>
        );
      })}
      
      {tiers.length > 1 && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1.5 z-40">
          {tiers.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-purple-500' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
