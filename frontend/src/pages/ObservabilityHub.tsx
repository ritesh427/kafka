import React from 'react';
import { ExternalLink, Database, Activity, Map, BarChart } from 'lucide-react';

const ObservabilityHub: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-6">
        <ObsCard 
          icon={<Database className="text-blue-500" />}
          title="Kafka UI"
          url="http://localhost:8080"
          desc="Inspect topics, partitions, consumer lag, and Avro schemas in real-time."
        />
        <ObsCard 
          icon={<Map className="text-orange-500" />}
          title="Jaeger Tracing"
          url="http://localhost:16686"
          desc="Visualize the end-to-end journey of an order event across all microservices."
        />
        <ObsCard 
          icon={<BarChart className="text-green-500" />}
          title="Grafana"
          url="http://localhost:3000"
          desc="Production-grade dashboards for JVM, Kafka, and System metrics."
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Activity size={20} className="text-red-500" />
          Metrics Scraping Flow
        </h3>
        
        <div className="relative">
          <div className="flex justify-between items-center relative z-10">
            <Node label="Microservices" sub="Micrometer + OTEL" color="bg-red-100 text-red-700 border-red-200" />
            <Arrow />
            <Node label="Prometheus" sub="Metrics Scraper" color="bg-orange-100 text-orange-700 border-orange-200" />
            <Arrow />
            <Node label="Grafana" sub="Visualization" color="bg-green-100 text-green-700 border-green-200" />
          </div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-8 text-sm text-gray-600">
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Distributed Tracing</h4>
            <p>We use **B3 Propagator** or **W3C TraceContext** headers in Kafka records to maintain the `traceId` across asynchronous hops. This is how Jaeger stitches the timeline together.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Consumer Lag</h4>
            <p>Prometheus tracks `kafka_consumergroup_lag`. If this number spikes, your system is "falling behind" and you may need more partitions or consumer instances.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ObsCard = ({ icon, title, url, desc }: { icon: React.ReactNode, title: string, url: string, desc: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <a href={url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
        <ExternalLink size={18} />
      </a>
    </div>
    <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

const Node = ({ label, sub, color }: { label: string, sub: string, color: string }) => (
  <div className={`px-6 py-4 rounded-xl border-2 text-center min-w-[160px] shadow-sm ${color}`}>
    <div className="font-bold text-sm">{label}</div>
    <div className="text-[10px] opacity-80">{sub}</div>
  </div>
);

const Arrow = () => (
  <div className="text-gray-300 font-bold">→</div>
);

export default ObservabilityHub;
