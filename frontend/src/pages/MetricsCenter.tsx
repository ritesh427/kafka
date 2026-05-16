import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { 
  Activity, BarChart3, TrendingUp, Gauge, 
  ArrowUpRight, ArrowDownRight, Zap, RefreshCw,
  ShieldAlert, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MetricStat = ({ label, value, trend }: { label: string, value: string, trend: 'up' | 'down' | 'stable' }) => (
  <div className="flex flex-col items-end border-l border-white/10 pl-6 first:border-none">
    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-center gap-2">
      <span className="text-lg font-black text-white font-mono">{value}</span>
      {trend === 'up' && <ArrowUpRight size={14} className="text-green-500" />}
      {trend === 'down' && <ArrowDownRight size={14} className="text-red-500" />}
    </div>
  </div>
);

const PartitionRow = ({ topic, p, health }: { topic: string, p: string, health: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[10px]">
      <span className="font-bold text-slate-300">{topic} <span className="text-slate-600 font-mono">[P:{p}]</span></span>
      <span className={`font-black ${health < 90 ? 'text-red-500' : 'text-green-500'}`}>{health}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${health}%` }}
        className={`h-full rounded-full ${health < 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`}
      />
    </div>
  </div>
);

const MetricsCenter: React.FC = () => {
  const [lagData, setLagData] = useState<any[]>([]);
  const [throughputData, setThroughputData] = useState<any[]>([]);
  const [stats, setStats] = useState({ tps: '0', consumers: '0', latency: '0ms' });
  const [loading, setLoading] = useState(true);
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const fetchPrometheusData = async () => {
    try {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

      // Simulate live throughput shift
      const newThroughput = isCrisisMode ? Math.floor(Math.random() * 500) + 200 : Math.floor(Math.random() * 2000) + 1000;
      setThroughputData(prev => [...prev.slice(-10), { time: timeStr, events: newThroughput }]);

      // Simulate consumer lag variation
      const notifyLag = isCrisisMode ? Math.floor(Math.random() * 500) + 1200 : Math.floor(Math.random() * 50);
      const shippingLag = Math.floor(Math.random() * 20);

      setLagData(prev => [...prev.slice(-10), { 
        time: timeStr, 
        notification_service: notifyLag, 
        shipping_service: shippingLag 
      }]);

      if (notifyLag > 1000 && !showAlert) {
         setShowAlert(true);
      } else if (!isCrisisMode) {
         setShowAlert(false);
      }

      setStats({
        tps: (newThroughput / 60).toFixed(1) + 'k',
        consumers: isCrisisMode ? '8' : '12',
        latency: (isCrisisMode ? Math.random() * 200 + 400 : Math.random() * 20 + 30).toFixed(0) + 'ms'
      });

      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch live metrics", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPrometheusData, 3000);
    fetchPrometheusData();
    return () => clearInterval(interval);
  }, [isCrisisMode, showAlert]);

  return (
    <div className="flex flex-col h-full gap-6 max-w-[1400px] mx-auto p-4 select-none overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Activity className="text-red-500" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Observability Command Center</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[8px] font-black text-green-500 uppercase">Live Polling</span>
                </div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time telemetry stream from Prometheus cluster</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => { setIsCrisisMode(!isCrisisMode); if(isCrisisMode) setShowAlert(false); }}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${isCrisisMode ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}
           >
              <ShieldAlert size={14} />
              {isCrisisMode ? 'Resolving Backpressure...' : 'Simulate Backpressure'}
           </button>
           <MetricStat label="Total TPS" value={stats.tps} trend={isCrisisMode ? 'down' : 'up'} />
           <MetricStat label="Active Consumers" value={stats.consumers} trend="stable" />
           <MetricStat label="Avg Latency" value={stats.latency} trend={isCrisisMode ? 'up' : 'down'} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 relative">
        
        {/* Mock Alert Toast */}
        <AnimatePresence>
          {showAlert && (
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute top-0 right-0 z-[100] w-80 bg-red-600 rounded-[32px] p-6 shadow-[0_20px_60px_rgba(220,38,38,0.4)] border border-red-400 flex items-start gap-4"
            >
               <div className="p-3 bg-white/20 rounded-2xl text-white">
                  <Bell size={20} className="animate-bounce" />
               </div>
               <div className="flex-1">
                  <div className="text-[10px] font-black text-red-100 uppercase tracking-widest">PAGERDUTY ALERT</div>
                  <h4 className="text-white font-black text-sm mt-1">Consumer Lag Critical</h4>
                  <p className="text-[9px] text-red-100/80 mt-1 leading-relaxed italic">"notification-service exceeds 1k lag on partition 0. System throughput degrading."</p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Charts */}
        <div className="col-span-8 flex flex-col gap-6 min-h-0">
          
          {/* Consumer Lag Chart */}
          <div className="flex-1 bg-[#0d0d0f] rounded-[40px] border border-white/5 p-8 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Gauge size={18} className="text-red-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Live Consumer Group Lag (Messages)</h3>
              </div>
              <div className="flex gap-4 text-[9px] font-bold uppercase">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> notification-group</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> shipping-group</div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lagData}>
                  <defs>
                    <linearGradient id="colorLag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121214', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="notification_service" stroke="#ef4444" fillOpacity={1} fill="url(#colorLag)" strokeWidth={3} />
                  <Area type="monotone" dataKey="shipping_service" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Throughput Chart */}
          <div className="h-64 bg-[#0d0d0f] rounded-[40px] border border-white/5 p-8 flex flex-col shadow-xl">
             <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} className="text-green-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Global Throughput (Events/Sec)</h3>
             </div>
             <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={throughputData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                    <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#121214', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="events" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

        </div>

        {/* Right Sidebar: Partition Health */}
        <div className="col-span-4 flex flex-col gap-6 min-h-0">
           <div className="flex-1 bg-[#121214] rounded-[40px] border border-white/5 p-8 flex flex-col shadow-xl">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <BarChart3 size={18} className="text-blue-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Live Partition Health</span>
              </div>
              <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <PartitionRow topic="order-created" p="0" health={isCrisisMode ? 42 : (98 + Math.floor(Math.random() * 2))} />
                <PartitionRow topic="order-created" p="1" health={100} />
                <PartitionRow topic="payment-processed" p="0" health={isCrisisMode ? 15 : (Math.floor(Math.random() * 20) + 80)} />
                <PartitionRow topic="inventory-reserved" p="0" health={92 + Math.floor(Math.random() * 5)} />
                <PartitionRow topic="notification-sent" p="0" health={isCrisisMode ? 5 : 100} />
                <PartitionRow topic="order-shipped" p="0" health={100} />
              </div>
           </div>

           <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 opacity-60 mb-2">
                  <Zap size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Tracing Engine</span>
                </div>
                <div className="text-xl font-black tracking-tighter">Full Trace Depth: 12 Hops</div>
                <p className="text-[9px] mt-2 opacity-60 font-medium leading-relaxed italic">
                  "OpenTelemetry is currently capturing trace contexts across all Kafka records, providing sub-millisecond visibility."
                </p>
              </div>
              <Activity className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12" />
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

export default MetricsCenter;
