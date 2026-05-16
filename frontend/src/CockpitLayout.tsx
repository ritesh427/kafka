import React, { ReactNode, useEffect } from 'react';
import { useSimulatorStore } from './store/useSimulatorStore';
import { 
  Box, 
  Terminal as TerminalIcon, 
  Settings, 
  ChevronRight, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Share2,
  Database,
  Map,
  BarChart3,
  ExternalLink,
  FileJson
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const CockpitLayout: React.FC<LayoutProps> = ({ children }) => {
  const { stage, isLearningMode, toggleLearningMode, logs, serviceHealth, checkAllHealth } = useSimulatorStore();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(checkAllHealth, 5000);
    checkAllHealth();
    return () => clearInterval(interval);
  }, []);

  function getStepStatus(stepStage: string): 'Success' | 'Pending' | 'Waiting' {
    if (stage === 'COMPLETE') return 'Success';
    if (stage === 'IDLE') return 'Waiting';
    
    const stages = [
      'IDLE', 'USER_CREATE', 'CART_ACTION', 'CART_CHECKOUT', 
      'ORDER_OUTBOX', 'CDC_EMIT', 'SAGA_START', 'PAYMENT_PENDING', 
      'INVENTORY_PENDING', 'SAGA_SUCCESS', 'SHIPPING', 'NOTIFY', 'COMPLETE'
    ];
    
    const currentIndex = stages.indexOf(stage);
    const stepIndex = stages.indexOf(stepStage);
    
    if (currentIndex > stepIndex) return 'Success';
    if (currentIndex === stepIndex) return 'Pending';
    return 'Waiting';
  }

  function isStepDone(stepStage: string): boolean {
    const stages = [
        'IDLE', 'USER_CREATE', 'CART_ACTION', 'CART_CHECKOUT', 
        'ORDER_OUTBOX', 'CDC_EMIT', 'SAGA_START', 'PAYMENT_PENDING', 
        'INVENTORY_PENDING', 'SAGA_SUCCESS', 'SHIPPING', 'NOTIFY', 'COMPLETE'
    ];
    return stages.indexOf(stage) > stages.indexOf(stepStage);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-slate-300 font-sans selection:bg-red-500/30">
      
      {/* Left Sidebar: System Explorer */}
      <aside className="w-64 flex flex-col border-r border-white/5 bg-[#0d0d0f]/80 backdrop-blur-xl z-30">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <Cpu className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter text-white uppercase">Kafka Mastery</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${Object.values(serviceHealth).some(h => h === 'online') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lab {Object.values(serviceHealth).some(h => h === 'online') ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 mt-2 custom-scrollbar">
          <div>
            <div className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Simulation</div>
            <div className="space-y-1">
              <NavItem to="/" icon={<Share2 size={18}/>} label="System Map" active={location.pathname === '/'} />
              <NavItem to="/schema" icon={<FileJson size={18}/>} label="Schema Lab" active={location.pathname === '/schema'} />
              <NavItem to="/internals" icon={<Box size={18}/>} label="Kafka Internals" active={location.pathname === '/internals'} />
              <NavItem to="/chaos" icon={<ShieldAlert size={18}/>} label="Chaos Lab" active={location.pathname === '/chaos'} />
              <NavItem to="/metrics" icon={<Activity size={18}/>} label="Observability" active={location.pathname === '/metrics'} />
            </div>
          </div>

          <div>
            <div className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Core Services</div>
            <div className="space-y-1 overflow-y-auto max-h-[160px] custom-scrollbar">
              <ServiceLink label="Gateway" status={serviceHealth['gateway']} />
              <ServiceLink label="User Service" status={serviceHealth['user']} />
              <ServiceLink label="Product Service" status={serviceHealth['product']} />
              <ServiceLink label="Cart Service" status={serviceHealth['cart']} />
              <ServiceLink label="Order Service" status={serviceHealth['order']} />
              <ServiceLink label="Payment Service" status={serviceHealth['payment']} />
              <ServiceLink label="Inventory Svc" status={serviceHealth['inventory']} />
              <ServiceLink label="Shipping Svc" status={serviceHealth['shipping']} />
              <ServiceLink label="Notification" status={serviceHealth['notification']} />
              <ServiceLink label="Analytics Svc" status={serviceHealth['analytics']} />
            </div>
          </div>

          {/* Infrastructure Control Deck - Sidebar Integrated */}
          <div>
             <div className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Infra Control</div>
             <div className="grid grid-cols-2 gap-2 px-2">
                <InfraSidebarLink icon={<Database size={12}/>} label="Kafka" url="http://localhost:8080" />
                <InfraSidebarLink icon={<Map size={12}/>} label="Jaeger" url="http://localhost:16686" />
                <InfraSidebarLink icon={<Activity size={12}/>} label="Prom" url="http://localhost:9090" />
                <InfraSidebarLink icon={<BarChart3 size={12}/>} label="Grafana" url="http://localhost:3000" />
             </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
             <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Learning Mode</span>
                <button 
                  onClick={toggleLearningMode}
                  className={`w-8 h-4 rounded-full transition-colors relative ${isLearningMode ? 'bg-red-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isLearningMode ? 'left-4.5' : 'left-0.5'}`}></div>
                </button>
             </div>
             <p className="text-[9px] text-slate-500 leading-relaxed italic">
               {isLearningMode ? "Flow paused. Click 'Next Step' to advance and learn." : "Automatic execution enabled. Best for high-level monitoring."}
             </p>
          </div>
        </div>
      </aside>

      {/* Main Cockpit Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-dot-pattern">
        
        {/* Top Control Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0c]/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stage:</span>
              <span className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-red-500 font-mono">
                {stage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/5 transition-colors">
              <Settings size={18} className="text-slate-400" />
            </button>
            <div className="h-8 w-[1px] bg-white/5"></div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              Live Laboratory
            </div>
          </div>
        </header>

        {/* The dynamic content (React Flow / etc) */}
        <div className="flex-1 relative">
          {children}
        </div>

        {/* Bottom Panel: Event Journey Timeline */}
        <footer className="h-48 border-t border-white/5 bg-[#0d0d0f]/90 backdrop-blur-2xl z-20 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <Activity size={16} className="text-red-500" />
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Real-time Event Journey</h3>
             </div>
             <div className="text-[9px] font-mono text-slate-500 italic">Tracking Trace: otel-trace-550e8400-e29b</div>
          </div>
          <div className="flex-1 flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
             <TimelineStep 
                label="UserCreated" 
                status={getStepStatus('USER_CREATE')} 
                active={stage === 'USER_CREATE'} 
             />
             <Connector active={isStepDone('USER_CREATE')} />
             <TimelineStep 
                label="CartCheckedOut" 
                status={getStepStatus('CART_ACTION')} 
                active={stage === 'CART_ACTION'} 
             />
             <Connector active={isStepDone('CART_ACTION')} />
             <TimelineStep 
                label="OrderCreated" 
                status={getStepStatus('ORDER_OUTBOX')} 
                active={stage === 'ORDER_OUTBOX' || stage === 'CDC_EMIT'} 
             />
             <Connector active={isStepDone('ORDER_OUTBOX')} />
             <TimelineStep 
                label="PaymentProcessed" 
                status={getStepStatus('SAGA_START')} 
                active={stage === 'SAGA_START' || stage === 'PAYMENT_PENDING'} 
             />
             <Connector active={isStepDone('SAGA_START')} />
             <TimelineStep 
                label="InventoryReserved" 
                status={getStepStatus('SAGA_START')} 
                active={stage === 'SAGA_START' || stage === 'INVENTORY_PENDING'} 
             />
             <Connector active={isStepDone('SAGA_START')} />
             <TimelineStep 
                label="OrderShipped" 
                status={getStepStatus('SHIPPING')} 
                active={stage === 'SHIPPING'} 
             />
             <Connector active={isStepDone('SHIPPING')} />
             <TimelineStep 
                label="NotificationSent" 
                status={getStepStatus('NOTIFY')} 
                active={stage === 'NOTIFY'} 
             />
          </div>
        </footer>
      </main>

      {/* Right Sidebar: Terminal Console */}
      <aside className="w-96 border-l border-white/5 bg-[#0d0d0f] z-30 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon size={18} className="text-red-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">System Console</span>
          </div>
          <div className="flex gap-2 text-[10px] font-bold text-slate-600">
            {logs.length} EVENTS
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-4 bg-black/40 custom-scrollbar">
           {logs.map((log, i) => (
             <div key={i} className={`animate-in slide-in-from-left duration-300 ${i === 0 ? 'text-white border-l-2 border-red-500 pl-3' : 'text-slate-500'}`}>
                <span className="opacity-40">[{log.timestamp}]</span> [{log.service}] {log.message}
             </div>
           ))}
        </div>
      </aside>

      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#ffffff05 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const Connector = ({ active }: { active: boolean }) => (
    <div className={`w-12 h-[2px] transition-colors duration-1000 ${active ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-800'}`}></div>
);

const NavItem = ({ to, icon, label, active }: { to: string, icon: any, label: string, active?: boolean }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-red-500/10 text-white shadow-inner shadow-red-500/5' : 'hover:bg-white/5 text-slate-500 hover:text-slate-300'}`}>
    <div className={`${active ? 'text-red-500' : ''}`}>{icon}</div>
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
  </Link>
);

const ServiceLink = ({ label, status }: { label: string, status: 'online' | 'offline' | 'checking' }) => (
  <div className="flex items-center justify-between px-4 py-2 group cursor-pointer">
    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{label}</span>
    <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${
      status === 'online' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 
      status === 'offline' ? 'border-red-500/30 text-red-500 bg-red-500/5' : 
      'border-slate-500/30 text-slate-500 animate-pulse'
    }`}>
      {status === 'checking' ? '...' : status}
    </div>
  </div>
);

const TimelineStep = ({ label, time, status, active }: { label: string, time?: string, status: 'Success' | 'Pending' | 'Waiting', active?: boolean }) => (
  <div className={`min-w-[140px] p-4 rounded-2xl border transition-all duration-500 ${active ? 'bg-white text-slate-900 border-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-slate-400 opacity-60'}`}>
     <div className="text-[10px] font-black uppercase tracking-tighter truncate mb-1">{label}</div>
     <div className="flex items-center justify-between">
        <span className={`text-[8px] font-bold ${active ? 'text-slate-500' : 'text-slate-600'}`}>{time || '--:--:--'}</span>
        <span className={`text-[8px] font-black uppercase ${status === 'Success' ? 'text-green-500' : (status === 'Pending' ? 'text-orange-500' : 'text-slate-500')}`}>{status}</span>
     </div>
  </div>
);

const InfraSidebarLink = ({ icon, label, url }: { icon: React.ReactNode, label: string, url: string }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noreferrer"
    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-red-600/20 hover:border-red-600/40 hover:text-white transition-all group"
  >
    <div className="opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </a>
);

export default CockpitLayout;
