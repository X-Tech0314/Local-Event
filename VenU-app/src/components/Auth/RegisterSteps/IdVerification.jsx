import React from 'react';
import { PHILIPPINE_GOVERNMENT_IDS } from '../../../utils/constants.js';
import { isIdNumberValid } from '../../../utils/validation.js';
import FileDropzone from '../../common/FileDropzone.jsx';

export default function IdVerification({
  idType, setIdType,
  idFrontFile, setIdFrontFile,
  idBackFile, setIdBackFile,
  idReferenceNumber, setIdReferenceNumber,
  touched, touch,
  idRequiresBack
}) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4">3. ID Verification</h4>
      
      {/* Select ID Type */}
      <div className="w-full text-slate-800">
        <label className="block text-xs font-semibold text-white/70 mb-1.5">Select ID Type</label>
        <select
          value={idType}
          onChange={(e) => {
            setIdType(e.target.value);
            setIdFrontFile(null);
            setIdBackFile(null);
            setIdReferenceNumber('');
            touch('idType');
          }}
          onBlur={() => touch('idType')}
          className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors [&>option]:bg-slate-950 [&>option]:text-white bg-slate-950/80 ${
            touched.idType && !idType
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-white/10 focus:border-[#A855F7]/50'
          }`}
        >
          <option value="">Choose ID Type</option>
          {PHILIPPINE_GOVERNMENT_IDS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        {touched.idType && !idType && (
          <p className="text-[10px] text-red-400 mt-1 font-medium">Please select an ID type to verify.</p>
        )}
      </div>

      {/* Dynamic Guide Samples & Description */}
      {idType && PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType) && (
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start mb-4 animate-fadeIn">
          <img
            src={PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).sampleUrl}
            alt={PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).name}
            className="w-40 h-28 object-contain rounded-md border border-slate-200 bg-white shadow-sm flex-shrink-0"
          />
          <div className="text-left">
            <h5 className="font-semibold text-xs text-slate-800 uppercase tracking-wide mb-1">
              {PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).name} Reference
            </h5>
            <p className="text-slate-500 text-xs leading-relaxed">
              {PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).description}
            </p>
          </div>
        </div>
      )}

      {/* Upload Zones & Input */}
      {idType && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileDropzone
              label={`Upload Front of ${PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType)?.name || 'ID'}`}
              file={idFrontFile}
              onFileChange={(file) => {
                setIdFrontFile(file);
                touch('idFrontFile');
              }}
              onRemove={() => setIdFrontFile(null)}
            />
            {idRequiresBack ? (
              <FileDropzone
                label={`Upload Back of ${PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType)?.name || 'ID'}`}
                file={idBackFile}
                onFileChange={(file) => {
                  setIdBackFile(file);
                  touch('idBackFile');
                }}
                onRemove={() => setIdBackFile(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/20 border border-white/5 text-center text-xs text-white/30 text-balance h-full min-h-[140px]">
                This ID type (Passport/UMID) does not require a Back Side image.
              </div>
            )}
          </div>

          {/* Reference Number */}
          <div className="text-slate-800">
            <label className="block text-xs font-semibold text-white/70 mb-1.5">ID Reference / Serial Number</label>
            <input
              type="text"
              value={idReferenceNumber}
              onChange={(e) => {
                setIdReferenceNumber(e.target.value);
                touch('idReferenceNumber');
              }}
              onBlur={() => touch('idReferenceNumber')}
              className={`w-full rounded-lg border px-3 py-2.5 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                touched.idReferenceNumber && (!idReferenceNumber.trim() || !isIdNumberValid(idType, idReferenceNumber))
                  ? 'border-red-500/60 focus:border-red-400'
                  : 'border-white/10 focus:border-[#A855F7]/50'
              }`}
              placeholder={PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType)?.placeholder || 'Enter ID number'}
            />
            {touched.idReferenceNumber && !idReferenceNumber.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">ID reference number is required.</p>
            )}
            {touched.idReferenceNumber && idReferenceNumber.trim() && !isIdNumberValid(idType, idReferenceNumber) && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                Invalid format. Expected: {PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType)?.placeholder}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
