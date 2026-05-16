import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Skull, AlertTriangle, Zap, Radio, 
  RefreshCw, ShieldAlert, Cpu, Database,
  ArrowDownLeft, Info, HelpCircle
} from 'lucide-react';

interface ChaosScenario {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  impact: string;
  recovery: string;
  color: string;
}

const scenarios: ChaosScenario[] = [
  {
    id: 'broker_crash',
    title: 'Broker Leader Crash',
    desc: 'Intentionally kill the leader of a highly-trafficked partition.',
    icon: <Skull />,
    impact: 'Temporary un-availability for that partition until a new leader is elected from the ISR.',
    recovery: 'Kafka Controller detects the crash and promotes an In-Sync Replica (ISR) to Leader.',
    color: 'red'
  },
  {
    id: 'consumer_rebalance',
    title: 'Consumer Rebalance Storm',
    desc: 'Force a consumer to join/leave the group repeatedly.',
    icon: <RefreshCw />,
    impact: 'Stop-the-world rebalance where all consumers stop processing to re-assign partitions.',
    recovery: 'Using Incremental Cooperative Rebalancing to minimize downtime.',
    color: 'orange'
  },
  {
    id: 'poison_pill',
    title: 'The Poison Pill',
    desc: 'Inject an un-parseable message into a critical topic.',
    icon: <Radio />,
    impact: 'Consumer crashes repeatedly (Infinite loop) or stalls the entire partition.',
    recovery: 'Move the message to a Dead Letter Queue (DLQ) after X retries.',
    color: 'purple'
  },
  {
    id: 'network_partition',
    title: 'Network Partition',
    desc: 'Simulate a split-brain scenario where brokers cannot see each other.',
    icon: <ShieldAlert />,
    impact: 'Clusters become "under-replicated" and some writes may fail based on min.insync.replicas.',
    recovery: 'Automatic healing when the network link is restored and brokers catch up.',
    color: 'blue'
  }
];

const ChaosLab: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<ChaosScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = (scenario: ChaosScenario) => {
    setActiveScenario(scenario);
    setIsSimulating(true);
    // Simulation timer
    setTimeout(() => setIsSimulating(false), 5000);
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1400px] mx-auto p-4 select-none">
      
      {/* Header */}
      <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 flex justify-between items-center backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Skull className="text-red-500 fill-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Chaos Engineering Lab</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Simulate Disaster & Test Distributed Resilience</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-black/40 rounded-full border border-white/5 flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{isSimulating ? 'Scenario Running' : 'Simulation Ready'}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* Left: Scenario Selection */}
        <div className="col-span-4 flex flex-col gap-4">
          {scenarios.map((s) => (
            <button 
              key={s.id}
              onClick={() => runSimulation(s)}
              disabled={isSimulating}
              className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-start gap-4 ${activeScenario?.id === s.id ? 'bg-red-500/5 border-red-500' : 'bg-[#121214] border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'} ${isSimulating && activeScenario?.id !== s.id ? 'grayscale opacity-30' : ''}`}
            >
              <div className={`p-3 rounded-2xl ${activeScenario?.id === s.id ? 'bg-red-500 text-white shadow-lg shadow-red-900/40' : 'bg-white/5 text-slate-500'}`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-black uppercase tracking-tight ${activeScenario?.id === s.id ? 'text-white' : 'text-slate-300'}`}>{s.title}</h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </button>
          ))}

          <div className="mt-auto bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden">
             <div className="relative z-10 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Pro Tip</h4>
                <p className="text-sm font-bold leading-relaxed italic">
                  "Production mastery isn't just about successful flows. It's about knowing exactly how your cluster behaves when everything goes wrong."
                </p>
             </div>
             <AlertTriangle className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12" />
          </div>
        </div>

        {/* Right: The Simulation Theater */}
        <div className="col-span-8 bg-[#0d0d0f] rounded-[40px] border border-white/5 p-12 flex flex-col relative overflow-hidden shadow-inner min-h-0">
          
          <AnimatePresence mode='wait'>
            {activeScenario ? (
              <motion.div 
                key={activeScenario.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col h-full gap-8"
              >
                {/* Visual Stage */}
                <div className="flex-1 bg-black/40 rounded-[32px] border border-white/5 relative flex items-center justify-center">
                   {isSimulating ? (
                     <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <Cpu size={64} className="text-slate-800" />
                          <motion.div 
                            animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 flex items-center justify-center text-red-500"
                          >
                             <Skull size={48} />
                          </motion.div>
                        </div>
                        <div className="text-center space-y-2">
                           <div className="text-xs font-black text-red-500 uppercase tracking-[0.3em] animate-pulse">Critical Failure Simulated</div>
                           <div className="text-[10px] text-slate-500 font-mono tracking-tighter font-bold uppercase underline">Broker-2: UNAVAILABLE</div>
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-4 text-center opacity-40">
                        <Database size={48} className="text-green-500" />
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Self-Healing Complete</div>
                        <p className="text-[10px] text-slate-500 max-w-xs">The Kafka Cluster has successfully mitigated the failure and restored consistent state.</p>
                     </div>
                   )}

                   {/* Background Grid */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="w-full h-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]"></div>
                   </div>
                </div>

                {/* Analysis Info */}
                <div className="grid grid-cols-2 gap-6 h-48">
                   <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 space-y-3 shadow-xl">
                      <div className="flex items-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
                        <ArrowDownLeft size={14} /> The Impact
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                        {activeScenario.impact}
                      </p>
                   </div>
                   <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 space-y-3 shadow-xl border-l-green-500/20">
                      <div className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase tracking-widest">
                        <Zap size={14} /> Recovery Path
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                        {activeScenario.recovery}
                      </p>
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="p-8 bg-white/5 rounded-full border border-white/5">
                   <ShieldAlert size={64} className="text-slate-800" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Select a Failure Scenario</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed italic">
                      Trigger real-world distributed system failures and observe how Kafka’s design patterns (Replication, Sagas, DLQs) save the day.
                    </p>
                 </div>
              </div>
            )}
          </AnimatePresence>

          {/* Corner Decors */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <HelpCircle size={120} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChaosLab;
