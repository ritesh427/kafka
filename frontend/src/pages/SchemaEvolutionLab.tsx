import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileJson, ShieldCheck, ShieldAlert, 
  History, GitBranch, AlertTriangle, 
  ArrowRight, Info, BookOpen, Layers, RefreshCw
} from 'lucide-react';

interface SchemaVersion {
  version: number;
  content: string;
  type: 'Backward' | 'Forward' | 'Full' | 'None';
}

const versions: SchemaVersion[] = [
  { 
    version: 1, 
    type: 'Full',
    content: `{
  "type": "record",
  "name": "Order",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "amount", "type": "double"}
  ]
}` 
  },
  { 
    version: 2, 
    type: 'Backward',
    content: `{
  "type": "record",
  "name": "Order",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "amount", "type": "double"},
    {"name": "currency", "type": "string", "default": "USD"}
  ]
}` 
  },
  { 
    version: 3, 
    type: 'None',
    content: `{
  "type": "record",
  "name": "Order",
  "fields": [
    {"name": "order_id", "type": "int"},
    {"name": "total", "type": "double"}
  ]
}` 
  }
];

const SchemaEvolutionLab: React.FC = () => {
  const [activeVersion, setActiveVersion] = useState(1);
  const [proposedSchema, setProposedSchema] = useState(versions[0].content);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<'success' | 'blocked' | null>(null);

  const handleVersionSelect = (v: SchemaVersion) => {
    setActiveVersion(v.version);
    setProposedSchema(v.content);
    setResult(null);
  };

  const simulateEvolution = () => {
    setIsSimulating(true);
    setResult(null);
    
    setTimeout(() => {
      setIsSimulating(false);
      // Basic simulation logic: if they rename "id" to something else, block it as incompatible
      // This allows the user to actually test their manual edits!
      if (proposedSchema.includes('"id"') || proposedSchema.includes('"ID"')) {
        setResult('success');
      } else {
        setResult('blocked');
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1400px] mx-auto p-4 select-none">
      
      {/* Header */}
      <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 flex justify-between items-center backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <ShieldCheck className="text-blue-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Schema Registry Lab</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Event Contract Governance & Compatibility Testing</p>
          </div>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-black/40 rounded-full border border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Registry Online</span>
           </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left: Version History & Evolution Control */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-[#121214] rounded-[32px] border border-white/5 p-6 flex-1 flex flex-col">
             <div className="flex items-center gap-2 mb-6">
                <History size={16} className="text-blue-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Evolution Timeline</h3>
             </div>

             <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {versions.map((v) => (
                  <button 
                    key={v.version}
                    onClick={() => handleVersionSelect(v)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${activeVersion === v.version ? 'bg-blue-500/5 border-blue-500' : 'bg-black/20 border-white/5 hover:border-white/10 opacity-70'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black ${activeVersion === v.version ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                      v{v.version}
                    </div>
                    <div className="flex-1">
                       <div className="text-[10px] font-black text-white uppercase">Schema Update</div>
                       <div className={`text-[8px] font-bold uppercase mt-0.5 ${v.type === 'None' ? 'text-red-500' : 'text-green-500'}`}>{v.type} Compatibility</div>
                    </div>
                  </button>
                ))}
             </div>

             <div className="mt-6 pt-6 border-t border-white/5">
                <button 
                  onClick={simulateEvolution}
                  disabled={isSimulating}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSimulating ? <RefreshCw className="animate-spin" size={16}/> : <GitBranch size={16} />}
                  Check Compatibility
                </button>
             </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2"><BookOpen size={14}/> Architect's Note</h4>
                <p className="text-[11px] font-bold leading-relaxed italic">
                  "Compatibility modes define how services can upgrade without crashing the system. 'Backward' allows new consumers to read old data, while 'Forward' allows old consumers to read new data."
                </p>
             </div>
             <Layers className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12" />
          </div>
        </div>

        {/* Right: The Registry Core Visualizer */}
        <div className="col-span-8 bg-[#0d0d0f] rounded-[40px] border border-white/5 p-12 flex flex-col relative overflow-hidden shadow-inner min-h-0">
          
          <div className="flex-1 flex flex-col gap-8">
             
             {/* Schema Definition Panel */}
             <div className="grid grid-cols-2 gap-8 flex-1">
                
                {/* Active Registry State */}
                <div className="flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <FileJson size={14} /> Subject: order-value
                      </div>
                      <span className="text-[9px] font-mono text-blue-500 font-bold">LATEST: v1</span>
                   </div>
                   <div className="flex-1 bg-black/60 rounded-3xl border border-white/5 p-6 font-mono text-[11px] text-slate-400 overflow-hidden relative group">
                      <div className="absolute top-0 left-0 w-full h-full p-6 bg-blue-500/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      <pre className="custom-scrollbar overflow-auto h-full">
                        {versions[0].content}
                      </pre>
                   </div>
                </div>

                {/* Proposed Evolution - Now Editable! */}
                <div className="flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <GitBranch size={14} /> Proposed: v{activeVersion} (EDITABLE)
                      </div>
                      <span className={`text-[9px] font-mono font-bold ${activeVersion === 1 ? 'text-slate-600' : 'text-blue-400 animate-pulse'}`}>
                        {activeVersion === 1 ? 'STABLE' : 'PENDING'}
                      </span>
                   </div>
                   <div className={`flex-1 bg-black rounded-3xl border-2 p-1 overflow-hidden transition-all duration-500 ${activeVersion === 1 ? 'border-white/5' : 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]'}`}>
                      <textarea
                        value={proposedSchema}
                        onChange={(e) => setProposedSchema(e.target.value)}
                        spellCheck={false}
                        className="w-full h-full bg-transparent p-5 font-mono text-[11px] text-blue-100 focus:outline-none resize-none custom-scrollbar"
                        placeholder="// Enter your Avro Schema here..."
                      />
                   </div>
                </div>

             </div>

             {/* Results Stage */}
             <div className="h-48 relative">
                <AnimatePresence mode='wait'>
                   {isSimulating ? (
                      <motion.div 
                        key="sim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#121214] rounded-3xl border border-blue-500/20 flex items-center justify-center gap-8"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-white/5 animate-spin"></div>
                            <div className="text-center">
                               <div className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse">Running Verifier</div>
                               <div className="text-[9px] text-slate-500 font-mono mt-1 italic">Testing against existing version history...</div>
                            </div>
                         </div>
                      </motion.div>
                   ) : result === 'success' ? (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-green-500/5 rounded-3xl border border-green-500/30 p-8 flex items-center gap-8"
                      >
                         <div className="p-4 bg-green-500/20 rounded-full text-green-500">
                            <ShieldCheck size={32} />
                         </div>
                         <div className="flex-1">
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Evolution Accepted</h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed italic">
                              "The proposed changes maintain **Compatibility**. Downstream consumers can still read existing records without crashing."
                            </p>
                         </div>
                         <div className="flex flex-col items-end gap-2 pr-4">
                            <div className="text-[8px] font-black text-green-500 uppercase tracking-widest">Registry Action</div>
                            <div className="px-3 py-1 bg-green-600 rounded-lg text-[9px] font-black text-white uppercase">Write v{activeVersion} Success</div>
                         </div>
                      </motion.div>
                   ) : result === 'blocked' ? (
                      <motion.div 
                        key="blocked"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 bg-red-500/5 rounded-3xl border border-red-500/30 p-8 flex items-center gap-8"
                      >
                         <div className="p-4 bg-red-500/20 rounded-full text-red-500 animate-bounce">
                            <ShieldAlert size={32} />
                         </div>
                         <div className="flex-1">
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Evolution Blocked!</h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed italic">
                              "CRITICAL ERROR: Detected **Incompatible Change**. You modified or renamed a required field. This will crash downstream services!"
                            </p>
                         </div>
                         <div className="flex flex-col items-end gap-2 pr-4">
                            <div className="text-[8px] font-black text-red-500 uppercase tracking-widest">Access Denied</div>
                            <div className="px-3 py-1 bg-red-600 rounded-lg text-[9px] font-black text-white uppercase">409 Conflict</div>
                         </div>
                      </motion.div>
                   ) : (
                      <div className="absolute inset-0 bg-white/5 rounded-3xl border border-dashed border-white/10 flex items-center justify-center">
                         <div className="text-center opacity-30">
                            <AlertTriangle size={24} className="mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select a schema version or edit the draft to begin testing</p>
                         </div>
                      </div>
                   )}
                </AnimatePresence>
             </div>

          </div>

          {/* Background Decor */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:30px_30px]"></div>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SchemaEvolutionLab;
