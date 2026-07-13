"use client";

import { useState, useRef } from "react";
import { FolderOpen, FileText, FileImage, Download, Plus, Trash2 } from "lucide-react";

export default function FilesPage() {
  const [files, setFiles] = useState([
    { id: "file_1", name: "Architecture Diagram.png", size: "2.4 MB", type: "image", date: "2026-07-08T15:00:00Z" },
    { id: "file_2", name: "Sprint Specifications.docx", size: "850 KB", type: "document", date: "2026-07-08T12:30:00Z" },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Convert file size to human readable format
    const sizeInKb = selectedFile.size / 1024;
    const formattedSize = sizeInKb > 1024 
      ? `${(sizeInKb / 1024).toFixed(1)} MB` 
      : `${sizeInKb.toFixed(0)} KB`;

    const newFile = {
      id: `file_${Math.random().toString(36).substring(7)}`,
      name: selectedFile.name,
      size: formattedSize,
      type: selectedFile.type.startsWith("image/") ? "image" : "document",
      date: new Date().toISOString(),
    };

    setFiles(prev => [newFile, ...prev]);
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Workspace Assets</h1>
          <p className="text-slate-400 text-sm mt-1">Upload and access architectural layouts, specs, and design templates.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue text-white text-xs font-bold font-heading rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={14} /> Upload File
        </button>
      </div>

      {/* Grid of files cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div key={file.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] backdrop-blur-[24px] flex flex-col justify-between space-y-4 hover:border-accent-purple/20 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <span className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white">
                {file.type === "image" ? <FileImage size={20} /> : <FileText size={20} />}
              </span>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white font-heading truncate max-w-[180px]">{file.name}</h3>
                <p className="text-[10px] text-slate-500 font-mono">{file.size} • {new Date(file.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5 relative z-10">
              <button 
                onClick={() => handleDelete(file.id)}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-heading font-semibold rounded-xl transition-all cursor-pointer">
                <Download size={12} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
