"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, Plus, Trash2, Tag, BookOpen, Bug, CheckSquare, 
  Award, AlertCircle, Eye, X, ChevronRight, Info
} from "lucide-react";

export default function WorkItemsPage() {
  const [types, setTypes] = useState<any[]>([
    { id: '1', name: 'Bug', icon: 'bug', color: '#ef4444', count: '24 Issues' },
    { id: '2', name: 'Feature', icon: 'zap', color: '#10b981', count: '83 Items' },
    { id: '3', name: 'Epic', icon: 'award', color: '#8b5cf6', count: '12 Items' },
    { id: '4', name: 'Task', icon: 'check-square', color: '#3b82f6', count: '421 Items' }
  ]);

  const [fields, setFields] = useState<any[]>([
    { id: '1', name: 'Severity', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    { id: '2', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
    { id: '3', name: 'Sprint', type: 'number' },
    { id: '4', name: 'Owner', type: 'text' },
    { id: '5', name: 'Estimate', type: 'number' },
    { id: '6', name: 'SLA', type: 'text' }
  ]);

  const [loading, setLoading] = useState(false);

  // Drawer states
  const [isTypeDrawerOpen, setIsTypeDrawerOpen] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);

  // Form states for Work Item Types
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeIcon, setNewTypeIcon] = useState("tag");
  const [newTypeColor, setNewTypeColor] = useState("#5B8CFF");

  // Form states for Custom Field Definitions
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldOptionsString, setNewFieldOptionsString] = useState("");

  // Live preview selected card states
  const [previewType, setPreviewType] = useState('Feature');
  const [previewColor, setPreviewColor] = useState('#10b981');
  const [previewIcon, setPreviewIcon] = useState('zap');
  const [previewPriority, setPreviewPriority] = useState('High');
  const [previewSprint, setPreviewSprint] = useState('15');
  const [previewOwner, setPreviewOwner] = useState('Sarah');
  const [previewSeverity, setPreviewSeverity] = useState('Critical');

  const iconsList = [
    { name: "tag", label: "🏷️ Tag" },
    { name: "bug", label: "🐞 Bug" },
    { name: "zap", label: "✨ Zap" },
    { name: "check-square", label: "✓ Task" },
    { name: "award", label: "🚀 Award" },
    { name: "alert-circle", label: "⚠️ Alert" }
  ];

  const colorsList = ["#5B8CFF", "#a855f7", "#ef4444", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

  const handleCreateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name: newTypeName,
      icon: newTypeIcon,
      color: newTypeColor,
      count: '0 Items'
    };

    setTypes([...types, newItem]);
    setNewTypeName("");
    setIsTypeDrawerOpen(false);
  };

  const handleDeleteType = (id: string) => {
    setTypes(types.filter(t => t.id !== id));
  };

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const options = newFieldOptionsString
      ? newFieldOptionsString.split(",").map(o => o.trim()).filter(Boolean)
      : [];

    const newField = {
      id: Date.now().toString(),
      name: newFieldName,
      type: newFieldType,
      options
    };

    setFields([...fields, newField]);
    setNewFieldName("");
    setNewFieldOptionsString("");
    setIsFieldDrawerOpen(false);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  // Get matching icon character
  const getIconChar = (iconName: string) => {
    if (iconName === 'bug') return '🐞';
    if (iconName === 'zap') return '✨';
    if (iconName === 'award') return '🚀';
    if (iconName === 'check-square') return '✓';
    return '🏷️';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-100 p-2 relative min-h-screen">
      
      {/* Header */}
      <div className="border-b border-[#1c1c1c] pb-6">
        <h1 className="text-3xl font-bold font-heading text-white tracking-tight">Work Items</h1>
        <p className="text-slate-400 text-sm mt-1">Customize how your workspace tracks and visualizes project deliverables.</p>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left side panel (8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Work Item Types Cards Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-wider uppercase text-slate-400 font-heading">Work Item Types</h2>
              <button 
                onClick={() => setIsTypeDrawerOpen(true)}
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <Plus size={14} /> New Type
              </button>
            </div>

            {/* Grid of types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {types.map((type) => (
                <div 
                  key={type.id}
                  onClick={() => {
                    setPreviewType(type.name);
                    setPreviewColor(type.color);
                    setPreviewIcon(type.icon);
                  }}
                  className="bg-[#111113] border border-[#27272a] rounded-xl p-5 hover:-translate-y-0.5 hover:border-slate-700 transition-all duration-300 shadow-card flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getIconChar(type.icon)}</span>
                    <div>
                      <h4 className="font-bold font-heading text-white text-sm">{type.name}</h4>
                      <p className="text-xs text-slate-500">{type.count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteType(type.id); }}
                      className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Type card trigger */}
              <div 
                onClick={() => setIsTypeDrawerOpen(true)}
                className="border border-dashed border-[#27272a] hover:border-slate-600 rounded-xl p-5 flex items-center justify-center gap-2 cursor-pointer transition-all text-slate-500 hover:text-slate-300"
              >
                <Plus size={16} />
                <span className="text-xs font-semibold font-heading">Add Custom Type</span>
              </div>
            </div>
          </div>

          {/* Fields / Metadata Section */}
          <div className="space-y-4 pt-6 border-t border-[#1c1c1c]">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-wider uppercase text-slate-400 font-heading">Metadata Fields</h2>
              <button 
                onClick={() => setIsFieldDrawerOpen(true)}
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <Plus size={14} /> Add Field
              </button>
            </div>

            <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6 shadow-card space-y-4">
              <div className="flex flex-wrap gap-2">
                {fields.map((field) => (
                  <div 
                    key={field.id}
                    className="px-3.5 py-2 bg-[#18181b] border border-[#27272a] hover:border-slate-600 rounded-lg flex items-center gap-2 transition-all group"
                  >
                    <span className="text-xs font-medium text-slate-300">{field.name}</span>
                    <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 text-slate-500 px-1 rounded uppercase">
                      {field.type}
                    </span>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right side preview panel (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-[#111113] border border-[#27272a] rounded-xl space-y-6 shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#5B8CFF]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 border-b border-[#27272a] pb-3">
              <Eye size={14} className="text-[#5B8CFF]" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-white font-heading">Live Preview</h3>
            </div>

            {/* Simulated Work Card Item */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 space-y-4 shadow-elevated">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold">
                  <span>{getIconChar(previewIcon)}</span>
                  <span>{previewType}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">G-101</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white leading-normal">Implement customizable metadata views</h4>
                <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                  Allow developers to map custom estimate matrices and SLA alert points dynamically.
                </p>
              </div>

              {/* Attributes grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#27272a] text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Priority</span>
                  <p className="text-slate-300 font-semibold">{previewPriority}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Sprint</span>
                  <p className="text-slate-300 font-semibold">{previewSprint}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Owner</span>
                  <p className="text-slate-300 font-semibold">{previewOwner}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-500 font-medium">Severity</span>
                  <p className="text-red-400 font-semibold">{previewSeverity}</p>
                </div>
              </div>
            </div>

            {/* Quick interactive controls for the live preview */}
            <div className="space-y-3 pt-3 border-t border-[#27272a]">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Interactive Controls</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Priority</label>
                  <select 
                    value={previewPriority} 
                    onChange={e => setPreviewPriority(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded px-2.5 py-1 text-slate-300 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase mb-1">Severity</label>
                  <select 
                    value={previewSeverity} 
                    onChange={e => setPreviewSeverity(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded px-2.5 py-1 text-slate-300 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* DRAWER: New Work Item Type */}
      {isTypeDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsTypeDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Panel */}
          <div className="relative w-96 bg-[#111113] border-l border-[#27272a] h-full flex flex-col p-6 shadow-2xl z-10 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-4 mb-6">
              <h3 className="text-base font-bold font-heading text-white">New Work Item Type</h3>
              <button 
                onClick={() => setIsTypeDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateType} className="space-y-5 flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Name</label>
                <input 
                  value={newTypeName}
                  onChange={e => setNewTypeName(e.target.value)}
                  placeholder="e.g. Subtask, Spike"
                  className="input"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Color Tag</label>
                <div className="flex gap-2">
                  {colorsList.map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => setNewTypeColor(c)}
                      className={`w-6 h-6 rounded-full border transition-all ${
                        newTypeColor === c ? 'border-white scale-110' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Select Icon</label>
                <div className="grid grid-cols-3 gap-2">
                  {iconsList.map(ico => (
                    <button 
                      key={ico.name}
                      type="button"
                      onClick={() => setNewTypeIcon(ico.name)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        newTypeIcon === ico.name 
                          ? 'bg-[#5B8CFF]/20 text-[#5B8CFF] border-[#5B8CFF]/40' 
                          : 'bg-[#18181b] border-[#27272a] text-slate-400 hover:text-white'
                      }`}
                    >
                      {ico.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full justify-center h-10 mt-6"
              >
                Save Work Item Type
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: New Field */}
      {isFieldDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsFieldDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          {/* Panel */}
          <div className="relative w-96 bg-[#111113] border-l border-[#27272a] h-full flex flex-col p-6 shadow-2xl z-10 animate-fade-in">
            <div className="flex justify-between items-center border-b border-[#27272a] pb-4 mb-6">
              <h3 className="text-base font-bold font-heading text-white">Add Custom Field</h3>
              <button 
                onClick={() => setIsFieldDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateField} className="space-y-5 flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Field Name</label>
                <input 
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  placeholder="e.g. Browser, Impact"
                  className="input"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase block">Field Type</label>
                <select 
                  value={newFieldType}
                  onChange={e => setNewFieldType(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-slate-300 outline-none"
                >
                  <option value="text">Text Field</option>
                  <option value="number">Number Field</option>
                  <option value="date">Date Field</option>
                  <option value="boolean">Checkbox Boolean</option>
                  <option value="select">Dropdown Select</option>
                </select>
              </div>

              {newFieldType === 'select' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">Select Options (comma-separated)</label>
                  <input 
                    value={newFieldOptionsString}
                    onChange={e => setNewFieldOptionsString(e.target.value)}
                    placeholder="Low, Medium, High"
                    className="input"
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary w-full justify-center h-10 mt-6"
              >
                Save Custom Field
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
