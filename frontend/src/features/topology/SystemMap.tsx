import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulatorStore } from '../../store/useSimulatorStore';
import { Server, Database, MessageSquare, ShieldCheck, ShoppingCart, User, Truck, Bell, RotateCcw } from 'lucide-react';

const ServiceNode = ({ data }: any) => (
  <div className={`p-4 rounded-xl border-2 bg-[#121214] shadow-2xl transition-all duration-500 w-48 ${data.active ? 'border-red-500 shadow-red-900/20 scale-105' : 'border-white/5 opacity-80'}`}>
    <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-600 border-none" />
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${data.active ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-500'}`}>
        {data.icon}
      </div>
      <div>
        <div className="text-[10px] font-black text-white uppercase tracking-tighter">{data.label}</div>
        <div className="text-[8px] font-bold text-slate-500 uppercase">{data.sub}</div>
      </div>
    </div>
    <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-600 border-none" />
  </div>
);

const TopicNode = ({ data }: any) => (
  <div className={`p-3 rounded-full border-2 bg-black shadow-xl transition-all duration-500 ${data.active ? 'border-red-500 animate-pulse' : 'border-slate-800'}`}>
    <Handle type="target" position={Position.Left} className="opacity-0" />
    <div className="flex items-center gap-2 px-2">
      <MessageSquare size={12} className={data.active ? 'text-red-500' : 'text-slate-600'} />
      <span className="text-[9px] font-black text-slate-400 uppercase font-mono tracking-tighter">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Right} className="opacity-0" />
  </div>
);

const nodeTypes = {
  service: ServiceNode,
  topic: TopicNode
};

const SystemMap: React.FC = () => {
  const { stage } = useSimulatorStore();

  const nodes: Node[] = useMemo(() => [
    {
      id: 'gateway',
      type: 'service',
      position: { x: 50, y: 150 },
      data: { label: 'API Gateway', sub: 'Routing', icon: <Server size={18}/>, active: stage !== 'IDLE' }
    },
    {
      id: 'user-svc',
      type: 'service',
      position: { x: 300, y: 50 },
      data: { label: 'User Service', sub: 'Profiles', icon: <User size={18}/>, active: stage === 'USER_CREATE' }
    },
    {
      id: 'cart-svc',
      type: 'service',
      position: { x: 300, y: 250 },
      data: { label: 'Cart Service', sub: 'Redis-backed', icon: <ShoppingCart size={18}/>, active: stage === 'CART_ADD' || stage === 'CART_CHECKOUT' }
    },
    {
      id: 'kafka-cluster',
      position: { x: 600, y: 150 },
      data: { label: 'Kafka Cluster' },
      style: { 
        width: 120, height: 120, 
        borderRadius: '100%', 
        background: stage === 'IDLE' ? '#1a1a1e' : '#ef4444', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '4px solid rgba(255,255,255,0.05)',
        boxShadow: stage === 'IDLE' ? 'none' : '0 0 60px rgba(239,68,68,0.4)',
        color: 'white', fontWeight: 'bold', fontSize: '10px', textAlign: 'center',
        transition: 'all 0.5s ease'
      }
    },
    {
      id: 'order-svc',
      type: 'service',
      position: { x: 850, y: 50 },
      data: { label: 'Order Service', sub: 'Saga Host', icon: <Database size={18}/>, active: stage === 'ORDER_INIT' }
    },
    {
      id: 'payment-svc',
      type: 'service',
      position: { x: 850, y: 250 },
      data: { label: 'Payment Service', sub: 'Saga Part', icon: <RotateCcw size={18}/>, active: stage === 'SAGA_FANOUT' }
    },
    {
      id: 'inventory-svc',
      type: 'service',
      position: { x: 850, y: 450 },
      data: { label: 'Inventory Svc', sub: 'Saga Part', icon: <Box size={18}/>, active: stage === 'SAGA_FANOUT' }
    },
    {
      id: 'shipping-svc',
      type: 'service',
      position: { x: 1150, y: 150 },
      data: { label: 'Shipping Svc', sub: 'Finalizer', icon: <Truck size={18}/>, active: stage === 'SHIPPING' }
    },
    {
      id: 'notify-svc',
      type: 'service',
      position: { x: 1150, y: 350 },
      data: { label: 'Notification', sub: 'Resilient', icon: <Bell size={18}/>, active: stage === 'NOTIFY' }
    }
  ], [stage]);

  const edges: Edge[] = useMemo(() => [
    { id: 'e1-2', source: 'gateway', target: 'user-svc', animated: stage === 'USER_CREATE' },
    { id: 'e1-3', source: 'gateway', target: 'cart-svc', animated: stage === 'CART_ADD' || stage === 'CART_CHECKOUT' },
    { id: 'e2-k', source: 'user-svc', target: 'kafka-cluster', label: 'user-created', animated: stage === 'USER_CREATE' },
    { id: 'e3-k', source: 'cart-svc', target: 'kafka-cluster', label: 'cart-checkout', animated: stage === 'CART_CHECKOUT' },
    { id: 'ek-4', source: 'kafka-cluster', target: 'order-svc', label: 'consume', animated: stage === 'ORDER_INIT' },
    { id: 'e4-k', source: 'order-svc', target: 'kafka-cluster', label: 'order-created', animated: stage === 'ORDER_INIT' },
    { id: 'ek-5', source: 'kafka-cluster', target: 'payment-svc', animated: stage === 'SAGA_FANOUT' },
    { id: 'ek-6', source: 'kafka-cluster', target: 'inventory-svc', animated: stage === 'SAGA_FANOUT' },
    { id: 'ek-7', source: 'kafka-cluster', target: 'shipping-svc', animated: stage === 'SHIPPING' },
    { id: 'ek-8', source: 'kafka-cluster', target: 'notify-svc', animated: stage === 'NOTIFY' },
  ], [stage]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#ffffff05" gap={32} size={1} />
        <Controls showInteractive={false} className="bg-[#0d0d0f] border-white/5" />
      </ReactFlow>
    </div>
  );
};

export default SystemMap;
