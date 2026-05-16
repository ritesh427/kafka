import React, { useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';

const SagaDashboard: React.FC = () => {
  const [userId, setUserId] = useState('user_' + Math.floor(Math.random() * 1000));
  const [amount, setAmount] = useState('150.00');
  const [mode, setOutboxMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const triggerOrder = async () => {
    setLoading(true);
    const endpoint = mode ? '/api/orders/outbox' : '/api/orders/async';
    try {
      const response = await axios.post(`${endpoint}?userId=${userId}&amount=${amount}`);
      setLastOrder({
        status: 'PENDING',
        userId,
        amount,
        mode: mode ? 'Transactional Outbox' : 'Async Send',
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err) {
      alert('Failed to trigger order. Ensure order-service is running on port 8082.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} />
            <h2 className="font-bold text-lg text-white">Saga Control Center</h2>
          </div>
          <span className="text-xs bg-red-800 px-2 py-1 rounded font-mono">Phase 4 & 6 Integration</span>
        </div>
        
        <div className="p-8 grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Configure Payload</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">User Identifier</label>
                <input 
                  value={userId} 
                  onChange={e => setUserId(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="e.g. ritesh or fail_payment"
                />
                <p className="text-[10px] text-gray-500 mt-1 italic">Use "fail_payment" or "fail_inventory" to trigger rollbacks.</p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Order Amount ($)</label>
                <input 
                  type="number"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={mode} onChange={e => setOutboxMode(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Transactional Outbox Mode</span>
                </label>
              </div>
            </div>

            <button 
              onClick={triggerOrder}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Clock className="animate-spin" /> : <Send size={18} />}
              Place Order & Emit Event
            </button>
          </div>

          <div className="space-y-6 border-l pl-12 border-gray-100">
            <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Concept Explorer</h3>
            
            <div className="space-y-4">
              <ConceptCard 
                title="Choreography Saga" 
                desc="No central orchestrator. Services communicate outcomes via topics. Notice how 'Eventual Consistency' takes effect."
              />
              <ConceptCard 
                title={mode ? "Outbox Pattern (Active)" : "Direct Send (Active)"}
                desc={mode ? "Atomically saves state and event to DB. Zero risk of 'Dual-Write' inconsistency." : "Fast but risky. If the broker is down after the DB commit, the system gets out of sync."}
                active={mode}
              />
            </div>
          </div>
        </div>
      </section>

      {lastOrder && (
        <section className="bg-slate-900 rounded-xl shadow-2xl p-6 text-white animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Activity className="text-green-400" size={20} />
              Real-time Simulation Log
            </h3>
            <span className="text-xs text-slate-500">Last event: {lastOrder.timestamp}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <LogStep status="DONE" label="Order Created" sub={lastOrder.mode} />
            <LogStep status="WAITING" label="Payment" sub="payment-processed" />
            <LogStep status="WAITING" label="Inventory" sub="inventory-reserved" />
            <LogStep status="WAITING" label="Outcome" sub="Confirmation Email" />
          </div>
          
          <div className="mt-6 p-4 bg-slate-800 rounded font-mono text-[10px] text-slate-300">
            <span className="text-red-400">PRODUCER:</span> {lastOrder.mode} flow initiated for user '{lastOrder.userId}'... <br/>
            <span className="text-green-400">CONNECT:</span> Debezium detected WAL change in outbox_events... <br/>
            <span className="text-blue-400">KAFKA:</span> [order-created] Offset pushed to Partition 0...
          </div>
        </section>
      )}
    </div>
  );
};

const ConceptCard = ({ title, desc, active }: { title: string, desc: string, active?: boolean }) => (
  <div className={`p-4 rounded-lg border transition-all ${active ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
    <h4 className={`text-sm font-bold mb-1 ${active ? 'text-red-700' : 'text-gray-900'}`}>{title}</h4>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const LogStep = ({ status, label, sub }: { status: 'DONE' | 'WAITING' | 'FAIL', label: string, subTextText?: string, sub?: string }) => (
  <div className="flex flex-col items-center text-center">
    {status === 'DONE' ? <CheckCircle2 className="text-green-500 mb-2" /> : <Clock className="text-slate-600 mb-2" />}
    <span className="text-xs font-bold block">{label}</span>
    <span className="text-[9px] text-slate-500 uppercase">{sub}</span>
  </div>
);

export default SagaDashboard;
