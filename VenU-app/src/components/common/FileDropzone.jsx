import React from 'react';
import { UploadCloud } from 'lucide-react';

const FileDropzone = ({ label, file, onFileChange, onRemove }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-dashed border-white/10 hover:border-[#A855F7]/50 rounded-xl bg-slate-950/40 transition-colors relative min-h-[140px] text-center w-full">
      {file ? (
        <div className="flex flex-col items-center">
          <img
            src={URL.createObjectURL(file)}
            alt={label}
            className="h-20 w-auto object-contain rounded border border-slate-800 mb-2 shadow"
          />
          <span className="text-[10px] text-slate-300 font-medium truncate max-w-[150px] mb-1">{file.name}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition-colors mt-1 cursor-pointer"
          >
            Remove or Replace
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-4 text-white/40 hover:text-white/70">
          <UploadCloud className="h-5 w-5 text-white/30 mb-2" />
          <span className="text-xs font-semibold">{label}</span>
          <span className="text-[9px] text-white/20 mt-0.5">Click to browse file</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files[0];
              if (selected) onFileChange(selected);
            }}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};

export default FileDropzone;
