import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, HardDrive, Cpu, Layers, 
  ArrowRight, ShieldCheck, Users, 
  Zap, Disc, FileText, ChevronRight
} from 'lucide-react';

const TabBtn = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-slate-500 hover:text-white'}`}
  >
    {label}
  </button>
);

const BrokerNode = ({ label, type, active }: { label: string, type: string, active: boolean }) => (
  <div className={`p-6 rounded-[32px] border-2 flex flex-col items-center gap-3 w-40 transition-all duration-700 ${active ? 'border-red-500 bg-red-500/5 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-white/5 opacity-40'}`}>
     <HardDrive size={32} className={active ? 'text-red-500' : 'text-slate-700'} />
     <div className="text-center">
        <div className="text-[11px] font-black text-white uppercase">{label}</div>
        <div className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">{type}</div>
     </div>
  </div>
);

const InternalsNote = ({ title, desc }: { title: string, desc: string }) => (
  <div className="space-y-2 group">
    <div className="flex items-center gap-2">
      <ChevronRight size={14} className="text-red-500 group-hover:translate-x-1 transition-transform" />
      <h5 className="text-[11px] font-black text-slate-200 uppercase tracking-tight">{title}</h5>
    </div>
    <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic pl-5 border-l border-white/5">
      "{desc}"
    </p>
  </div>
);

const KafkaInternals: React.FC = () => {
  const [messages, setMessages] = useState<{ offset: number, payload: string, status: 'leader' | 'isr' }[]>([]);
  const [isProducing, setIsProducing] = useState(false);
  const [activeTab, setActiveTab] = useState<'storage' | 'replication' | 'consumers' | 'rebalance' | 'cdc'>('storage');
  const [consumerCount, setConsumerCount] = useState(2);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [isCdcSimulating, setIsCdcSimulating] = useState(false);
  const [cdcStep, setCdcStep] = useState(0);

  const addMessage = () => {
    setIsProducing(true);
    setTimeout(() => {
      const newOffset = messages.length > 0 ? messages[messages.length - 1].offset + 1 : 0;
      setMessages([...messages, { offset: newOffset, payload: `msg_data_${Math.floor(Math.random()*1000)}`, status: 'leader' }]);
      setIsProducing(false);
      
      // Simulate replication to ISR after 1 second
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.offset === newOffset ? { ...m, status: 'isr' } : m));
      }, 1000);
    }, 800);
  };

  const triggerRebalance = (count: number) => {
    setIsRebalancing(true);
    setTimeout(() => {
      setConsumerCount(count);
      setIsRebalancing(false);
    }, 2000);
  };

  const triggerCdcSimulation = () => {
    setIsCdcSimulating(true);
    setCdcStep(1); // 1: INSERT in DB
    
    setTimeout(() => setCdcStep(2), 1500); // 2: WAL Log updated
    setTimeout(() => setCdcStep(3), 3000); // 3: Debezium Tailing
    setTimeout(() => setCdcStep(4), 4500); // 4: JSON emitted to Kafka
    setTimeout(() => {
      setIsCdcSimulating(false);
      setCdcStep(0);
    }, 6500);
  };

  const partitions = [0, 1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1400px] mx-auto p-4 select-none">
      
      {/* Page Header */}
      <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Layers className="text-red-500 fill-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight text-white uppercase">Kafka Internals Lab</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Deep-Dive Broker Mechanics & Log Storage</p>
          </div>
        </div>
        <div className="flex gap-2">
           <TabBtn active={activeTab === 'storage'} label="Log Storage" onClick={() => setActiveTab('storage')} />
           <TabBtn active={activeTab === 'replication'} label="Replication (ISR)" onClick={() => setActiveTab('replication')} />
           <TabBtn active={activeTab === 'consumers'} label="Consumer Offsets" onClick={() => setActiveTab('consumers')} />
           <TabBtn active={activeTab === 'rebalance'} label="Rebalance Storm" onClick={() => setActiveTab('rebalance')} />
           <TabBtn active={activeTab === 'cdc'} label="CDC Bridge" onClick={() => setActiveTab('cdc')} />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left: Interactive Visualizer */}
        <div className="col-span-8 bg-[#0d0d0f] rounded-[40px] border border-white/5 p-12 flex flex-col relative overflow-hidden shadow-inner min-h-0">
          
          <div className="flex-1 flex flex-col justify-center items-center gap-16">
            
            {activeTab === 'storage' && (
              <div className="w-full space-y-12 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Topic: order-created | Partition: 0</h3>
                   <div className="text-[10px] text-slate-500 font-mono italic">Location: /var/lib/kafka/data/order-created-0/</div>
                </div>

                {/* Log Segment (The .log file) */}
                <div className="relative group">
                  <div className="absolute -top-6 left-0 text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <Disc size={12} className="animate-spin-slow" /> 0000000000.log (Active Segment)
                  </div>
                  <div className="flex gap-2 p-6 bg-black rounded-3xl border-2 border-white/5 overflow-x-auto min-h-[160px] items-center custom-scrollbar">
                    <AnimatePresence>
                      {messages.map((m) => (
                        <motion.div 
                          key={m.offset}
                          initial={{ opacity: 0, scale: 0.5, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          className={`min-w-[100px] p-3 rounded-xl border-2 flex flex-col gap-1 transition-all duration-500 ${m.status === 'isr' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
                        >
                          <div className="text-[8px] font-black text-slate-500 uppercase">Offset</div>
                          <div className="text-sm font-black text-white font-mono">{m.offset}</div>
                          <div className="text-[7px] font-mono text-slate-400 truncate mt-1">{m.payload}</div>
                          <div className={`mt-2 h-1 w-full rounded-full ${m.status === 'isr' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isProducing && (
                      <motion.div 
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="min-w-[100px] h-[100px] border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-700"
                      >
                        WRITING...
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Index Layer (The .index file) */}
                <div className="grid grid-cols-2 gap-8 mt-12">
                   <div className="p-6 bg-[#121214] rounded-3xl border border-white/5 space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase">
                        <FileText size={14} /> Sparse Index (.index)
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">Maps offsets to physical byte positions on disk for O(1) lookups.</p>
                      <div className="font-mono text-[9px] text-slate-600 bg-black/40 p-3 rounded-xl border border-white/5">
                        offset: 0 -&gt; position: 0 <br/>
                        offset: 100 -&gt; position: 1024 <br/>
                        offset: {messages.length > 0 ? messages[messages.length-1].offset : '---'} -&gt; position: {messages.length * 256}
                      </div>
                   </div>
                   <div className="p-6 bg-[#121214] rounded-3xl border border-white/5 space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase">
                        <Zap size={14} /> Zero-Copy (sendfile)
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">Data flows directly from Page Cache to Network Socket, bypassing JVM heap entirely.</p>
                      <div className="flex justify-center py-2">
                         <div className="flex items-center gap-3">
                            <div className="px-2 py-1 bg-slate-800 rounded text-[8px] font-bold">DISK</div>
                            <ArrowRight size={12} className="text-slate-700" />
                            <div className="px-2 py-1 bg-red-600 rounded text-[8px] font-bold text-white shadow-lg">PAGE CACHE</div>
                            <ArrowRight size={12} className="text-red-500" />
                            <div className="px-2 py-1 bg-blue-600 rounded text-[8px] font-bold text-white">NIC</div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'replication' && (
              <div className="w-full flex flex-col items-center gap-12 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center gap-24 relative">
                    <BrokerNode label="Broker 1" type="Leader" active={messages.some(m => m.status === 'leader')} />
                    <div className="flex flex-col gap-12">
                       <BrokerNode label="Broker 2" type="Follower (ISR)" active={messages.some(m => m.status === 'isr')} />
                       <BrokerNode label="Broker 3" type="Follower (ISR)" active={messages.some(m => m.status === 'isr')} />
                    </div>
                    {/* Replication Arrows */}
                    <div className="absolute top-1/2 left-[120px] w-32 h-[2px] bg-slate-800 pointer-events-none"></div>
                 </div>
                 <div className="max-w-md bg-slate-900 border border-white/5 p-8 rounded-[32px] space-y-4">
                    <div className="flex items-center gap-2 text-green-500">
                      <ShieldCheck size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">ISR List Active</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                      "In-Sync Replicas (ISR) are followers that have successfully caught up with the leader. If the leader crashes, only a broker in the ISR list is eligible to take over."
                    </p>
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white border border-white/5">acks=all</span>
                       <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white border border-white/5">min.insync.replicas=2</span>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'consumers' && (
              <div className="w-full grid grid-cols-2 gap-12 items-center animate-in zoom-in-95 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500"><Users /></div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">notification-group</h4>
                      <p className="text-[10px] text-slate-500">Consumer Group Offset Tracking</p>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Current Offset</span>
                       <span className="text-4xl font-black text-white font-mono">{messages.length > 0 ? messages[messages.length-1].offset : 0}</span>
                    </div>
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Consumer Lag</span>
                       <span className="text-sm font-black text-red-500 font-mono">0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 space-y-6">
                   <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-white/5 pb-3">__consumer_offsets</div>
                   <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                     Kafka stores consumer group state in an internal, compacted topic called <span className="text-white">__consumer_offsets</span>. 
                     This ensures that if a service restarts, it knows exactly where it left off.
                   </p>
                   <div className="p-4 bg-black rounded-2xl border border-white/5 font-mono text-[9px] text-slate-500">
                     [group: notification, topic: order-created, partition: 0] -&gt; commit offset {messages.length > 0 ? messages[messages.length-1].offset : 0}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'cdc' && (
              <div className="w-full h-full flex flex-col gap-12 animate-in slide-in-from-right-4 duration-700">
                <div className="flex justify-between items-start">
                   <div className="space-y-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Postgres -&gt; Debezium -&gt; Kafka</h3>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isCdcSimulating ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{isCdcSimulating ? 'Tracing Write-Ahead Log...' : 'Connector Idle'}</span>
                      </div>
                   </div>
                   <button 
                      onClick={triggerCdcSimulation}
                      disabled={isCdcSimulating}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2"
                   >
                      <Zap size={14} /> Simulate DB Commit
                   </button>
                </div>

                <div className="flex-1 grid grid-cols-3 gap-8 items-center relative">
                   {/* Step 1: Postgres Table */}
                   <div className="space-y-4">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Postgres Table (ecom_db)</div>
                      <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${cdcStep === 1 ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_40px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-black/40 opacity-40'}`}>
                         <Database className="mx-auto mb-4 text-slate-400" size={32} />
                         <div className="font-mono text-[8px] text-slate-500 space-y-1">
                            <span className={cdcStep === 1 ? 'text-white' : ''}>INSERT INTO orders (id, status) <br/> VALUES ('ord_999', 'PENDING');</span>
                         </div>
                      </div>
                   </div>

                   {/* Step 2 & 3: WAL & Debezium */}
                   <div className="flex flex-col gap-8">
                      <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${cdcStep === 2 ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-black/40 opacity-40'}`}>
                         <div className="text-[9px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            <FileText size={12} className="text-orange-500" /> Write-Ahead Log (WAL)
                         </div>
                         <div className="font-mono text-[7px] text-slate-500 bg-black p-2 rounded-lg border border-white/5">
                            LSN: 0/1691238 -&gt; [COMMIT] ord_999
                         </div>
                      </div>

                      <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${cdcStep === 3 ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-black/40 opacity-40'}`}>
                         <div className="text-[9px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2 text-red-500">
                            <ShieldCheck size={14} /> Debezium Connector
                         </div>
                         <p className="text-[8px] text-slate-500 italic">"Tailing Postgres logical replication slot..."</p>
                      </div>
                   </div>

                   {/* Step 4: Kafka Topic */}
                   <div className="space-y-4">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">Kafka Topic (db.orders)</div>
                      <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${cdcStep === 4 ? 'border-green-500 bg-green-500/5 shadow-[0_0_40px_rgba(34,197,94,0.2)]' : 'border-white/5 bg-black/40 opacity-40'}`}>
                         <HardDrive className="mx-auto mb-4 text-slate-400" size={32} />
                         <div className="font-mono text-[7px] text-green-500/80 bg-black p-3 rounded-xl border border-white/5 h-24 overflow-auto custom-scrollbar">
                            {cdcStep === 4 ? (
                               <pre>{JSON.stringify({ op: 'c', after: { order_id: 'ord_999', status: 'PENDING' } }, null, 2)}</pre>
                            ) : "// Waiting for event..."}
                         </div>
                      </div>
                   </div>

                   {/* Connector Lines */}
                   <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
                      {cdcStep > 1 && cdcStep < 5 && (
                         <svg className="w-full h-full">
                            <motion.path 
                               initial={{ pathLength: 0 }}
                               animate={{ pathLength: 1 }}
                               d="M 30% 50% L 35% 50%"
                               stroke="#3b82f6" strokeWidth="2" fill="none"
                            />
                         </svg>
                      )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'rebalance' && (
              <div className="w-full flex flex-col gap-12 animate-in fade-in duration-700">
                <div className="flex justify-between items-end">
                   <div className="space-y-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Group: inventory-group</h3>
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isRebalancing ? 'bg-orange-500 animate-ping' : 'bg-green-500'}`}></div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{isRebalancing ? 'Rebalancing (Stop-the-world)' : 'Stable Assignment'}</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      {[1, 2, 3, 6].map(n => (
                        <button 
                          key={n}
                          onClick={() => triggerRebalance(n)}
                          disabled={isRebalancing}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${consumerCount === n ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                        >
                          {n} Consumers
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-12 relative min-h-[300px]">
                   {/* Partitions */}
                   <div className="space-y-4">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Topic Partitions</div>
                      {partitions.map(p => (
                        <div key={p} id={`p-${p}`} className="p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-red-500/30 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-[10px] font-black text-red-500">P{p}</div>
                              <span className="text-[11px] font-bold text-slate-400">order-created</span>
                           </div>
                           <div className="text-[8px] font-black text-slate-600 uppercase group-hover:text-red-500 transition-colors">Assignment Pending...</div>
                        </div>
                      ))}
                   </div>

                   {/* Consumers */}
                   <div className="flex flex-col justify-center gap-6">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Consumer Instances</div>
                      <div className="space-y-4">
                        {Array.from({ length: consumerCount }).map((_, i) => (
                           <div key={i} id={`c-${i}`} className={`p-6 rounded-3xl border-2 flex items-center gap-4 transition-all duration-500 ${isRebalancing ? 'border-orange-500/50 bg-orange-500/5 opacity-50 grayscale' : 'border-green-500/30 bg-green-500/5 shadow-lg shadow-green-900/5'}`}>
                              <div className={`p-2 rounded-xl ${isRebalancing ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
                                 <Users size={16} />
                              </div>
                              <div>
                                 <div className="text-[10px] font-black text-white uppercase tracking-tight">instance_{i}</div>
                                 <div className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">member_id: node-a{i}-2026</div>
                              </div>
                           </div>
                        ))}
                      </div>
                   </div>

                   {/* Assignment Lines Layer (SVG or simple CSS paths) */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                        </marker>
                      </defs>
                      {!isRebalancing && partitions.map(p => {
                         const consumerIndex = p % consumerCount;
                         // This is simplified, in a real app we'd use getBoundingClientRect
                         return (
                           <motion.line 
                             key={p}
                             initial={{ pathLength: 0, opacity: 0 }}
                             animate={{ pathLength: 1, opacity: 0.2 }}
                             x1="45%" y1={`${15 + p * 15}%`}
                             x2="55%" y2={`${15 + consumerIndex * (80/consumerCount) + (40/consumerCount)}%`}
                             stroke="#ef4444"
                             strokeWidth="2"
                             markerEnd="url(#arrow)"
                           />
                         );
                      })}
                   </svg>
                </div>
              </div>
            )}

          </div>

          {/* Action Trigger */}
          <div className="absolute bottom-12 right-12">
            <button 
              onClick={addMessage}
              disabled={isProducing}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-red-900/40 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProducing ? <Cpu className="animate-spin" size={18}/> : <ArrowRight size={18} />}
              Simulate Producer Write
            </button>
          </div>
        </div>

        {/* Right: Technical Notes */}
        <div className="col-span-4 flex flex-col gap-6">
           <div className="bg-[#121214] rounded-[40px] border border-white/5 p-8 flex flex-col shadow-xl">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <FileText size={18} className="text-red-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Mechanical Sympathy</span>
              </div>
              <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === 'rebalance' ? (
                  <>
                    <InternalsNote 
                      title="Group Coordinator"
                      desc="One broker is elected as the Group Coordinator. It manages the group state and initiates rebalances when members join or leave."
                    />
                    <InternalsNote 
                      title="Assignment Strategy"
                      desc="Kafka uses strategies like Range, RoundRobin, or Sticky to map partitions to consumers. Here we show a RoundRobin mapping."
                    />
                    <InternalsNote 
                      title="Stop-the-World"
                      desc="Eager rebalancing forces all consumers to stop processing while assignment happens. Cooperative rebalancing (v2.4+) is much smoother."
                    />
                  </>
                ) : activeTab === 'cdc' ? (
                  <>
                    <InternalsNote 
                      title="Logical Replication"
                      desc="Debezium uses Postgres logical replication slots to read changes without impacting DB performance or requiring polling."
                    />
                    <InternalsNote 
                      title="The WAL Log"
                      desc="Every change in Postgres is first written to the Write-Ahead Log. Debezium 'tails' this log to ensure 0% data loss."
                    />
                    <InternalsNote 
                      title="Eventual Consistency"
                      desc="CDC allows us to bridge the gap between ACID databases and distributed event streams, ensuring local and global states match."
                    />
                  </>
                ) : (
                  <>
                    <InternalsNote 
                      title="Sequential I/O"
                      desc="Kafka is fast because it treats the disk as an append-only log. Sequential disk access is 1000x faster than random access."
                    />
                    <InternalsNote 
                      title="Log Compaction"
                      desc="Compacted topics (like consumer_offsets) keep only the latest value for a key, automatically deleting older updates."
                    />
                    <InternalsNote 
                      title="Partitioning"
                      desc="Partitions are the unit of parallelism. Each partition can be read by only one consumer in a group at a time."
                    />
                  </>
                )}
              </div>
           </div>
           
           <div className="bg-gradient-to-br from-red-600 to-red-900 rounded-[40px] p-8 text-white flex flex-col justify-end min-h-[200px] relative overflow-hidden">
              <div className="z-10">
                <h4 className="text-xs font-black uppercase mb-1 opacity-70">Lab Status</h4>
                <div className="text-2xl font-black tracking-tight">Active Simulation</div>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest bg-black/20 self-start px-3 py-1 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Broker Connection: OK
                </div>
              </div>
              <Database className="absolute -top-12 -right-12 text-white/5 w-64 h-64 rotate-12" />
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default KafkaInternals;
