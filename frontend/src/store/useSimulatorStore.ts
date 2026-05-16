import { create } from 'zustand';
import axios from 'axios';

export type SimulationStage = 
  | 'IDLE' 
  | 'USER_CREATE' 
  | 'CART_ADD' 
  | 'CART_CHECKOUT' 
  | 'ORDER_INIT' 
  | 'KAFKA_PRODUCE' 
  | 'SAGA_FANOUT' 
  | 'PAYMENT_PENDING' 
  | 'INVENTORY_PENDING' 
  | 'PAYMENT_FAIL' 
  | 'INV_FAIL' 
  | 'SAGA_ROLLBACK' 
  | 'SAGA_SUCCESS' 
  | 'SHIPPING' 
  | 'NOTIFY' 
  | 'DLQ_FLOW' 
  | 'COMPLETE';

interface LogEntry {
  timestamp: string;
  service: string;
  topic?: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'kafka';
}

type HealthStatus = 'online' | 'offline' | 'checking';

interface KafkaRecord {
  topic: string;
  key: string;
  value: any;
  headers: Record<string, string>;
}

interface SimulatorState {
  stage: SimulationStage;
  isLearningMode: boolean;
  logs: LogEntry[];
  activeScenario: string | null;
  currentExplanation: { title: string, body: string, concept: string } | null;
  serviceHealth: Record<string, HealthStatus>;
  inspectorRecord: KafkaRecord | null;
  
  // Actions
  setStage: (stage: SimulationStage) => void;
  toggleLearningMode: () => void;
  setExplanation: (explanation: { title: string, body: string, concept: string } | null) => void;
  addLog: (service: string, message: string, type?: LogEntry['type'], topic?: string) => void;
  resetSimulator: () => void;
  startScenario: (scenario: string) => void;
  checkAllHealth: () => Promise<void>;
  setInspectorRecord: (record: KafkaRecord | null) => void;
}

const SERVICES = [
  { id: 'gateway', label: 'Gateway', port: 9000 },
  { id: 'user', label: 'User Service', port: 8088 },
  { id: 'product', label: 'Product Service', port: 8089 },
  { id: 'cart', label: 'Cart Service', port: 8090 },
  { id: 'order', label: 'Order Service', port: 8082 },
  { id: 'payment', label: 'Payment Service', port: 8084 },
  { id: 'inventory', label: 'Inventory Svc', port: 8085 },
  { id: 'shipping', label: 'Shipping Svc', port: 8091 },
  { id: 'notification', label: 'Notification', port: 8087 },
  { id: 'analytics', label: 'Analytics Svc', port: 8086 },
];

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  stage: 'IDLE',
  isLearningMode: false,
  logs: [],
  activeScenario: null,
  currentExplanation: null,
  serviceHealth: SERVICES.reduce((acc, s) => ({ ...acc, [s.id]: 'checking' }), {}),
  inspectorRecord: null,

  setStage: (stage) => set({ stage }),
  
  toggleLearningMode: () => set((state) => ({ isLearningMode: !state.isLearningMode, currentExplanation: null })),

  setExplanation: (currentExplanation) => set({ currentExplanation }),

  addLog: (service, message, type = 'info', topic) => set((state) => ({
    logs: [
      {
        timestamp: new Date().toLocaleTimeString(),
        service,
        message,
        type,
        topic
      },
      ...state.logs
    ].slice(0, 100)
  })),

  resetSimulator: () => set({ stage: 'IDLE', activeScenario: null, logs: [], currentExplanation: null, inspectorRecord: null }),

  startScenario: (scenario) => set({ activeScenario: scenario, stage: 'IDLE', logs: [], currentExplanation: null, inspectorRecord: null }),

  setInspectorRecord: (inspectorRecord) => set({ inspectorRecord }),

  checkAllHealth: async () => {
    const healthMap: Record<string, HealthStatus> = {};
    
    await Promise.all(SERVICES.map(async (service) => {
      try {
        // We use a timeout to avoid long waits for down services
        // Note: Browsers block direct port access if not CORS enabled, 
        // but actuator usually is or we hit via the same host if using a reverse proxy.
        // In local dev, we might hit the ports directly if the services allow it.
        const resp = await axios.get(`http://localhost:${service.port}/actuator/health`, { timeout: 1000 });
        healthMap[service.id] = resp.status === 200 ? 'online' : 'offline';
      } catch (err) {
        healthMap[service.id] = 'offline';
      }
    }));

    set({ serviceHealth: healthMap });
  }
}));
