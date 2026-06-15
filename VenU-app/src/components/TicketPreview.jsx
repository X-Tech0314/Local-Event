import React from 'react';
import QRCode from 'react-qr-code';

export default function TicketPreview({ themeColor = '#a855f7', eventData }) {
  return (
    <div className="relative w-80 h-[480px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none">
      
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

        {/* Center: Styled QR Code Container */}
        <div 
          className="p-3 rounded-2xl bg-slate-50 transition-all duration-300 border-2"
          style={{ borderColor: `${themeColor}20` }}
        >
          <div className="w-24 h-24 flex items-center justify-center">
            <QRCode
              value={eventData?.ticketId || "https://yourplatform.com/verify/ticket-123"}
              size={96}
              level="H"
              fgColor="#0f172a"
              bgColor="transparent"
            />
          </div>
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
            {eventData?.tierName || 'Standard'}
          </p>
          {eventData?.validityScope && (
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-full mt-1">
                  <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest">
                      🎟️ {
                          eventData.validityScope === 'Full Event Multi-Pass (All Days)' ? 'FULL TOUR PASS' :
                          eventData.validityScope === 'Day 1 Access Only' ? 'DAY 1 PASS' :
                          eventData.validityScope === 'Day 2 Access Only' ? 'DAY 2 PASS' : 'SINGLE SESSION'
                      }
                  </span>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
