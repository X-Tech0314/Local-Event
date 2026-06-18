import React from 'react';
import { X, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

export default function TermsAndPrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-700/50 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col relative overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">Terms of Service & Privacy Policy</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-purple-400" /> 1. Terms of Service
            </h3>
            <p className="text-sm leading-relaxed">
              Welcome to VenU. By accessing our platform, registering an account, or availing tickets for any event, you agree to comply with and be bound by the following Terms of Service ("TOS"). VenU acts purely as an intermediary platform facilitating event discovery, ticketing, and check-ins between Organizers and Attendees.
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2 text-slate-400">
              <li><strong>Ticketing & Purchases:</strong> All ticket sales are final unless explicitly stated otherwise by the Event Organizer. VenU does not handle refunds directly; disputes must be resolved between the Attendee and the Organizer.</li>
              <li><strong>Event Ownership:</strong> Organizers retain full liability and ownership of their events. VenU is not liable for event cancellations, delays, injuries, or discrepancies regarding the venue or program.</li>
              <li><strong>Private Events:</strong> Certain events require an Access Code. Unauthorized sharing or distribution of access codes violates our TOS and may result in an immediate account ban.</li>
            </ul>
          </section>

          {/* Section 2: DPA 2012 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-400" /> 2. Data Privacy Act of 2012 (RA 10173)
            </h3>
            <p className="text-sm leading-relaxed">
              In strict compliance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173) and the National Privacy Commission (NPC) guidelines, we are committed to protecting your Personally Identifiable Information (PII).
            </p>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-semibold text-white">What we collect and why:</h4>
              <ul className="list-disc pl-5 text-sm space-y-2 text-slate-400">
                <li><strong>Identity Verification:</strong> We collect Government IDs strictly for account verification (especially for Organizers) to prevent fraud. IDs are encrypted at rest and are never shared with third parties.</li>
                <li><strong>QR Check-ins:</strong> When an Organizer scans an Attendee's QR ticket, PII is explicitly masked on the Organizer's screen. Only the verification status (Valid/Invalid) and basic ticket details are displayed.</li>
                <li><strong>Analytics Data:</strong> Event analytics provided to Organizers are heavily anonymized and aggregated. No individual tracking metrics are exposed.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: User Responsibilities */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" /> 3. Code of Conduct & Responsibilities
            </h3>
            <p className="text-sm leading-relaxed">
              Users must not upload malicious files, attempt to reverse-engineer the ticket validation system, or engage in ticket scalping. Organizers are required to verify the physical venue's occupancy limits and ensure compliance with local Barangay regulations. Failure to adhere to these rules empowers VenU to suspend accounts without prior notice.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/20 transition-colors"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
