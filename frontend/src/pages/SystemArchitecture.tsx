import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Database, Server, Bell, BarChart3, 
  RefreshCw, AlertTriangle, CheckCircle2,
  HardDrive, Terminal, Zap, ShieldCheck, Mail,
  UserCircle, Package, ShoppingCart, Truck, Play,
  ChevronRight, BookOpen, ExternalLink, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulatorStore } from '../store/useSimulatorStore';

type ServiceState = 'idle' | 'active' | 'success' | 'fail';

const ArchitectureVisualizer: React.FC = () => {
  const { 
    stage, setStage, 
    addLog, 
    isLearningMode, 
    currentExplanation, setExplanation,
    resetSimulator,
    serviceHealth,
    inspectorRecord,
    setInspectorRecord
  } = useSimulatorStore();

  const isSystemOnline = Object.values(serviceHealth).some(h => h === 'online');
  
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<{ id: number, from: string, to: string, color: string }[]>([]);
  const [salesTotal, setSalesTotal] = useState(14299.00);
  const nextStepResolveRef = useRef<((value: void | PromiseLike<void>) => void) | null>(null);

  const spawnParticle = (from: string, to: string, color: string = '#ef4444') => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, from, to, color }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  const handleKafkaClick = () => {
    if (stage === 'IDLE') return;

    // Generate dynamic record based on stage
    const records: Record<string, any> = {
      'USER_CREATE': { topic: 'user-created', key: 'user_101', value: { id: 'user_101', name: 'Ritesh', action: 'REGISTER' } },
      'CART_ACTION': { topic: 'cart-events', key: 'cart_55', value: { cartId: 'cart_55', item: 'Kafka Mastery Course', qty: 1 } },
      'CDC_EMIT': { topic: 'db.orders', key: 'ord_999', value: { op: 'c', after: { order_id: 'ord_999', status: 'PENDING', amount: 850.00 } } },
      'SAGA_START': { topic: 'order-created', key: 'ord_999', value: { orderId: 'ord_999', userId: 'ritesh', status: 'CREATED' } },
      'PAYMENT_FAIL': { topic: 'payment-failed', key: 'ord_999', value: { orderId: 'ord_999', reason: 'INSUFFICIENT_FUNDS' } },
      'INV_FAIL': { topic: 'inventory-failed', key: 'ord_999', value: { orderId: 'ord_999', reason: 'OUT_OF_STOCK' } },
      'SAGA_SUCCESS': { topic: 'order-confirmed', key: 'ord_999', value: { orderId: 'ord_999', status: 'CONFIRMED' } },
      'SHIPPING': { topic: 'shipping-task', key: 'ord_999', value: { orderId: 'ord_999', carrier: 'FEDEX' } },
    };

    const record = records[stage] || records['SAGA_START'];
    setInspectorRecord({
      ...record,
      headers: {
        'traceId': '0af7651916cd43dd8448eb211c80319c',
        'spanId': 'b7ad6b7169203331',
        'contentType': 'application/avro'
      }
    });
  };

  const waitForNext = async (title: string, concept: string, body: string) => {
    if (!isLearningMode) {
        await sleep(2000);
        return;
    }
    
    setExplanation({ title, concept, body });
    return new Promise<void>((resolve) => {
      nextStepResolveRef.current = resolve;
    });
  };

  const handleNextStep = () => {
    if (nextStepResolveRef.current) {
      setExplanation(null);
      nextStepResolveRef.current();
      nextStepResolveRef.current = null;
    }
  };

  const simulateFullFlow = async (scenario: 'happy' | 'pay_fail' | 'inv_fail' | 'dlq') => {
    setLoading(true);
    resetSimulator();
    addLog("SYSTEM", `🚀 INITIATING END-TO-END SIMULATION: ${scenario.toUpperCase()}`, 'info');
    
    // Step 1: User
    setStage('USER_CREATE');
    addLog("USER_SVC", "👤 Registering new consumer profile...", 'success');
    spawnParticle('user', 'kafka', '#3b82f6');
    await waitForNext(
        "Producer: user-service", 
        "Kafka Producer API", 
        "The User Service acts as a Producer. It sends a message to the 'user-created' topic. Kafka ensures this message is durable and replicated across brokers before acknowledging."
    );

    // Step 2: Cart
    setStage('CART_ACTION');
    addLog("CART_SVC", "🛒 Adding items to Redis session...", 'success');
    spawnParticle('cart', 'kafka', '#3b82f6');
    await waitForNext(
        "Event Sourcing: Cart", 
        "Stateless vs Stateful", 
        "The Cart Service manages transient state in Redis. When checkout happens, it emits an event. Notice how services are decoupled: Cart doesn't call Order directly!"
    );

    // Step 3: Order + Outbox
    setStage('ORDER_OUTBOX');
    addLog("ORDER_SVC", "📦 Transactional Outbox: Saving Order + Event to Postgres...", 'warning');
    
    let userId = 'ritesh';
    if (scenario === 'pay_fail') userId = 'fail_payment';
    if (scenario === 'inv_fail') userId = 'fail_inventory';
    if (scenario === 'dlq') userId = 'fail_permanent';

    try {
      await axios.post(`/api/orders/outbox?userId=${userId}&amount=850.00`);
      
      await sleep(1000);
      setStage('CDC_EMIT');
      addLog("DEBEZIUM", "🟢 WAL Log Tailed! Streaming 'order-created' to Kafka...", 'kafka');
      spawnParticle('order', 'kafka', '#ef4444');
      await waitForNext(
          "Transactional Outbox Pattern", 
          "Dual-Write Problem", 
          "We solve the 'Dual-Write' problem here. The database update and the Kafka event are saved in ONE atomic transaction. Debezium then 'tails' the DB logs to push the event."
      );

      await sleep(1500);
      setStage('SAGA_START');
      addLog("KAFKA", "⚡ Fan-out: [payment-group] and [inventory-group] triggered.", 'kafka');
      spawnParticle('kafka', 'payment', '#ef4444');
      spawnParticle('kafka', 'inventory', '#ef4444');
      await waitForNext(
          "Consumer Groups & Fan-out", 
          "Parallel Processing", 
          "Kafka allows multiple independent services to read the same message. Both Payment and Inventory services get a copy of the 'order-created' event simultaneously."
      );

      await sleep(2500);
      if (scenario === 'pay_fail') {
        setStage('PAYMENT_FAIL');
        addLog("PAYMENT_SVC", "❌ FAILED: Emitting rollback event...", 'error');
        spawnParticle('payment', 'kafka', '#f97316');
        await waitForNext(
            "Saga Rollback", 
            "Compensating Transactions", 
            "Payment failed! In a distributed system, we can't 'rollback' a global DB. Instead, we emit a 'payment-failed' event so other services can undo their work."
        );
        setStage('ORDER_ROLLBACK');
        addLog("ORDER_SVC", "🔄 Saga Rollback: Order state -> REJECTED.", 'error');
        spawnParticle('kafka', 'order', '#f97316');
      } else if (scenario === 'inv_fail') {
        setStage('INV_FAIL');
        addLog("INV_SVC", "❌ OUT OF STOCK: Emitting rollback...", 'error');
        spawnParticle('inventory', 'kafka', '#f97316');
        await waitForNext("Inventory Failure", "Distributed Consistency", "No stock? The Inventory service tells the cluster, and the Order service will mark the transaction as failed.");
        setStage('ORDER_ROLLBACK');
        addLog("ORDER_SVC", "🔄 Saga Rollback: Order state -> REJECTED.", 'error');
        spawnParticle('kafka', 'order', '#f97316');
      } else if (scenario === 'dlq') {
        setStage('DLQ_FLOW');
        addLog("NOTIFY_SVC", "☣️ POISON PILL! Moving to DLT...", 'error');
        spawnParticle('kafka', 'notify', '#ef4444');
        await waitForNext(
            "Dead Letter Queue (DLQ)", 
            "Poison Pill Handling", 
            "This message is broken. If we kept retrying, it would block the whole system. We move it to a 'Dead Letter Topic' (DLT) so developers can fix it later."
        );
      } else {
        setStage('SAGA_SUCCESS');
        addLog("ORDER_SVC", "✅ Saga Complete. Order state -> CONFIRMED.", 'success');
        setSalesTotal(prev => prev + 850.00);
        spawnParticle('order', 'kafka', '#22c55e');
        await waitForNext("Saga Success", "Eventual Consistency", "All participants agreed! The system is now consistent across all databases.");

        await sleep(1500);
        setStage('SHIPPING');
        addLog("SHIPPING_SVC", "🚚 Tracking assigned. Emitting 'order-shipped'...", 'success');
        spawnParticle('kafka', 'shipping', '#22c55e');
        spawnParticle('shipping', 'kafka', '#22c55e');

        await sleep(1500);
        setStage('NOTIFY');
        addLog("NOTIFY_SVC", "📧 Dispatching customer success email...", 'success');
        spawnParticle('kafka', 'notify', '#22c55e');
        await waitForNext("Consumer Acks", "At-Least-Once Delivery", "The Notification service uses Manual Acks. It only tells Kafka 'I am done' AFTER the email is successfully sent.");
        
        await sleep(1000);
        setStage('COMPLETE');
        addLog("SYSTEM", "🏁 JOURNEY COMPLETE. 100% Data Consistency.", 'success');
      }

    } catch (err) {
      addLog("SYSTEM", "❌ API Error: Connectivity failed.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="flex flex-col h-full gap-4 max-w-[1600px] mx-auto p-4 select-none overflow-hidden relative">
      
      {/* Learning Mode Overlay */}
      <AnimatePresence>
        {currentExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 w-[500px] bg-slate-900/90 backdrop-blur-2xl border border-red-500/30 p-8 rounded-[32px] z-[200] shadow-[0_20px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl text-red-500">
                <BookOpen size={24} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">{currentExplanation.concept}</div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{currentExplanation.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 italic">"{currentExplanation.body}"</p>
                <button 
                  onClick={handleNextStep}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/20"
                >
                  Proceed to Next Step
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record Inspector Overlay */}
      <AnimatePresence>
        {inspectorRecord && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-12"
          >
             <div className="w-[800px] bg-[#121214] rounded-[40px] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-transparent">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500 text-white rounded-2xl">
                         <Search size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tight">Record Inspector</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topic:</span>
                            <span className="text-[10px] font-black text-red-500 font-mono">{inspectorRecord.topic}</span>
                         </div>
                      </div>
                   </div>
                   <button 
                     onClick={() => setInspectorRecord(null)}
                     className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                   >
                      <X size={20} className="text-slate-400" />
                   </button>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-8 p-8 overflow-hidden">
                   <div className="flex flex-col gap-6">
                      <div className="space-y-3">
                         <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Metadata</div>
                         <div className="bg-black/40 p-5 rounded-3xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-bold text-slate-500">Key</span>
                               <span className="text-[10px] font-black text-white font-mono">{inspectorRecord.key}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-bold text-slate-500">Partition</span>
                               <span className="text-[10px] font-black text-white font-mono">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-bold text-slate-500">Timestamp</span>
                               <span className="text-[10px] font-black text-white font-mono">{new Date().toISOString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Context Headers (OTEL)</div>
                         <div className="bg-black/40 p-5 rounded-3xl border border-white/5 space-y-3">
                            {Object.entries(inspectorRecord.headers).map(([k, v]) => (
                               <div key={k} className="flex justify-between items-center gap-4">
                                  <span className="text-[9px] font-bold text-slate-500 font-mono">{k}</span>
                                  <span className="text-[9px] font-black text-blue-400 font-mono truncate max-w-[200px]">{v}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-3 overflow-hidden">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Avro Payload (Value)</div>
                      <div className="flex-1 bg-black rounded-3xl border border-white/5 p-6 font-mono text-[11px] text-green-500 overflow-auto custom-scrollbar shadow-inner">
                         <pre>{JSON.stringify(inspectorRecord.value, null, 2)}</pre>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-black/40 border-t border-white/5 flex justify-center">
                   <p className="text-[10px] text-slate-500 italic">"Deserialized using Avro Schema from local Schema Registry (port 8081)"</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Shell */}
      <div className="bg-[#121214] p-6 rounded-3xl shadow-2xl border border-white/5 flex justify-between items-center backdrop-blur-xl relative z-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Zap className="text-red-500 fill-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight text-white uppercase">Kafka Cockpit v3.0</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isLearningMode ? "TEACHER MODE ACTIVE" : "FLIGHT SIMULATOR"}</span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span className={`text-[10px] font-bold uppercase font-mono ${!isSystemOnline ? 'text-red-500 animate-pulse' : (loading ? 'text-red-500 animate-pulse' : 'text-green-500')}`}>
                {!isSystemOnline ? 'System Offline' : (loading ? 'Simulation in Progress' : 'System Ready')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
          <ScenarioBtn label="Full Happy Flow" onClick={() => simulateFullFlow('happy')} color="hover:bg-green-500/20 text-green-500" disabled={loading} />
          <ScenarioBtn label="Inventory Failure" onClick={() => simulateFullFlow('inv_fail')} color="hover:bg-red-400/20 text-red-400" disabled={loading} />
          <ScenarioBtn label="Rollback" onClick={() => simulateFullFlow('pay_fail')} color="hover:bg-orange-500/20 text-orange-500" disabled={loading} />
          <ScenarioBtn label="Poison Pill" onClick={() => simulateFullFlow('dlq')} color="hover:bg-red-500/20 text-red-500" disabled={loading} />
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* The Live Map */}
        <div className="flex-1 bg-[#0d0d0f] rounded-[40px] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center p-12 shadow-inner min-h-0">
          
          <AnimatePresence>
            {particles.map(p => (
              <Particle key={p.id} from={p.from} to={p.to} color={p.color} onClick={handleKafkaClick} />
            ))}
          </AnimatePresence>

          <div className="grid grid-cols-5 w-full items-center gap-x-8 relative z-10">
            
            <div className="flex flex-col gap-12 items-center">
              <Node id="user" icon={<UserCircle/>} label="User" state={stage === 'USER_CREATE' ? 'active' : stage !== 'IDLE' ? 'success' : 'idle'} sub="8088" isOffline={serviceHealth['user'] === 'offline'} />
              <Node id="product" icon={<Package/>} label="Product" state={stage !== 'IDLE' ? 'success' : 'idle'} sub="8089" isOffline={serviceHealth['product'] === 'offline'} />
            </div>

            <div className="flex flex-col items-center">
               <Node id="cart" icon={<ShoppingCart/>} label="Cart" state={stage === 'CART_ACTION' ? 'active' : (stage === 'IDLE' ? 'idle' : 'success')} sub="8090" isOffline={serviceHealth['cart'] === 'offline'} />
            </div>

            <div className="flex flex-col items-center justify-center relative">
               <div 
                 id="kafka" 
                 onClick={handleKafkaClick}
                 className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 cursor-pointer group ${stage === 'IDLE' ? 'bg-slate-900 border-white/10' : 'bg-red-600 border-red-400 shadow-[0_0_80px_rgba(239,68,68,0.45)]'}`}
                >
                 <Database size={32} className={stage === 'IDLE' ? 'text-white/10' : 'text-white animate-pulse'} />
                 <span className="text-[10px] font-black text-white mt-1 uppercase tracking-tighter">Kafka</span>
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black border border-red-500/50 px-2 py-1 rounded text-[8px] font-black text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    CLICK TO INSPECT RECORD
                 </div>
                 <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Search size={16} className="text-white" />
                 </div>
               </div>
               
               <div className={`absolute -top-10 p-2 rounded-lg border bg-[#121214] transition-all duration-1000 ${stage === 'CDC_EMIT' ? 'opacity-100 scale-110 border-blue-500 shadow-lg shadow-blue-500/20' : 'opacity-20 border-white/10'}`}>
                  <ShieldCheck size={14} className="text-blue-500" />
                  <span className="text-[7px] font-black ml-1 text-white uppercase">CDC Bridge</span>
               </div>
            </div>

            <div className="flex flex-col gap-10 items-center">
               <Node id="order" icon={<Server/>} label="Order" state={stage === 'ORDER_OUTBOX' || stage === 'SAGA_SUCCESS' || stage === 'CDC_EMIT' ? 'active' : (stage === 'COMPLETE' ? 'success' : (stage === 'ORDER_ROLLBACK' ? 'fail' : 'idle'))} sub="Outbox" isOffline={serviceHealth['order'] === 'offline'} />
               <Node id="payment" icon={<RefreshCw/>} label="Payment" state={stage === 'SAGA_START' || stage === 'PAYMENT_PENDING' ? 'active' : (stage === 'PAYMENT_FAIL' ? 'fail' : (stage === 'IDLE' ? 'idle' : 'success'))} sub="8084" isOffline={serviceHealth['payment'] === 'offline'} />
               <Node id="inventory" icon={<RefreshCw/>} label="Inventory" state={stage === 'SAGA_START' || stage === 'INVENTORY_PENDING' ? 'active' : (stage === 'INV_FAIL' ? 'fail' : (stage === 'IDLE' ? 'idle' : 'success'))} sub="8085" isOffline={serviceHealth['inventory'] === 'offline'} />
            </div>

            <div className="flex flex-col gap-12 items-center">
               <Node id="shipping" icon={<Truck/>} label="Shipping" state={stage === 'SHIPPING' ? 'active' : (stage === 'COMPLETE' ? 'success' : 'idle')} sub="8091" isOffline={serviceHealth['shipping'] === 'offline'} />
               <Node id="notify" icon={<Bell/>} label="Notification" state={stage === 'NOTIFY' ? 'active' : (stage === 'COMPLETE' ? 'success' : (stage === 'DLQ_FLOW' ? 'fail' : 'idle'))} sub="DLQ" isOffline={serviceHealth['notification'] === 'offline'} />
            </div>

          </div>

          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="w-full h-full bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:40px_40px]"></div>
          </div>

          {/* Analytics Pulse Overlay - Compact & Cornered */}
          <div className="absolute bottom-4 right-4 bg-gradient-to-br from-indigo-600/80 to-indigo-900/80 backdrop-blur-xl rounded-2xl p-4 text-white shadow-2xl border border-white/10 group overflow-hidden w-52 z-20 transition-all hover:scale-105">
              <div className="relative z-10">
                <div className="flex items-center gap-2 opacity-60 mb-1">
                  <BarChart3 size={10} />
                  <span className="text-[7px] font-black uppercase tracking-widest">KStreams Pulse</span>
                </div>
                <div className="text-lg font-black font-mono tracking-tighter">${salesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <p className="text-[7px] mt-1 opacity-60 font-medium leading-tight">Aggregating global sales totals.</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const Node = ({ icon, label, state, sub, id, isOffline }: { id: string, icon: React.ReactNode, label: string, state: ServiceState, sub: string, isOffline?: boolean }) => {
  const styles = {
    idle: isOffline ? 'bg-red-950/20 border-red-900/30 text-red-900 opacity-20' : 'bg-[#121214] border-white/5 text-slate-600 opacity-40',
    active: isOffline ? 'bg-red-600/20 border-red-500 text-red-500 animate-pulse z-20 border-2' : 'bg-red-500/10 border-red-500 text-red-500 scale-105 shadow-[0_0_40px_rgba(239,68,68,0.2)] z-20 border-2',
    success: 'bg-green-500/5 border-green-500/30 text-green-500/80',
    fail: 'bg-red-600 border-red-800 text-white animate-bounce shadow-lg shadow-red-900/40'
  };

  return (
    <div id={id} className={`w-32 p-5 rounded-3xl border transition-all duration-700 flex flex-col items-center gap-3 relative ${styles[state]}`}>
       <div className={`p-2 rounded-xl ${state === 'active' ? 'bg-red-500 text-white' : 'bg-white/5'}`}>
         {icon}
       </div>
       <div className="text-center">
         <div className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{label}</div>
         <div className="text-[8px] font-mono opacity-40 font-bold">{sub}</div>
       </div>
       {isOffline && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-red-500 z-30">
            OFFLINE
          </div>
       )}
       {state === 'success' && !isOffline && <CheckCircle2 size={12} className="opacity-60" />}
       {state === 'fail' && <AlertTriangle size={12} />}
    </div>
  );
};

const Particle = ({ from, to, color, onClick }: { from: string, to: string, color: string, onClick?: () => void }) => {
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useEffect(() => {
    const fromEl = document.getElementById(from);
    const toEl = document.getElementById(to);
    if (fromEl && toEl) {
      const f = fromEl.getBoundingClientRect();
      const t = toEl.getBoundingClientRect();
      setCoords({
        x1: f.left + f.width / 2,
        y1: f.top + f.height / 2,
        x2: t.left + t.width / 2,
        y2: t.top + t.height / 2,
      });
    }
  }, [from, to]);

  if (coords.x1 === 0) return null;

  return (
    <motion.div
      initial={{ left: coords.x1, top: coords.y1, opacity: 1, scale: 1.5 }}
      animate={{ left: coords.x2, top: coords.y2, opacity: 0, scale: 0.5 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      onClick={onClick}
      className="fixed z-[100] w-3 h-3 rounded-full blur-[2px] cursor-pointer"
      style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
    />
  );
};

const ScenarioBtn = ({ label, onClick, color, disabled }: { label: string, onClick: () => void, color: string, disabled: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`${color} text-[10px] font-black uppercase tracking-[0.1em] px-5 py-2.5 rounded-xl transition-all active:scale-[0.95] disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-black/20`}
  >
    <Play size={10} fill="currentColor" />
    {label}
  </button>
);

export default ArchitectureVisualizer;
