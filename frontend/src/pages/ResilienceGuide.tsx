import React from 'react';
import { ShieldAlert, RefreshCw, Trash2, ArrowRightCircle } from 'lucide-react';

const ResilienceGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Resilience Patterns in Kafka</h2>
        <p className="text-slate-500 max-w-2xl mx-auto italic">Learn how to build systems that don't break when individual components fail.</p>
      </header>

      <div className="grid grid-cols-2 gap-12">
        {/* Retries */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><RefreshCw size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Non-blocking Retries</h3>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Phase 3 Concept</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            In standard retries, the consumer blocks the partition while waiting to retry. In <strong>Non-blocking Retries</strong>, we send the failed message to a dedicated <em>retry topic</em>.
          </p>

          <div className="space-y-3">
            <Step num="1" label="Main Topic" desc="Message fails processing" />
            <div className="flex justify-center py-1"><ArrowRightCircle className="text-blue-200" size={16}/></div>
            <Step num="2" label="Retry Topic-0" desc="Wait 1s, retry again" active />
            <div className="flex justify-center py-1"><ArrowRightCircle className="text-blue-200" size={16}/></div>
            <Step num="3" label="Retry Topic-1" desc="Wait 2s, retry again" />
          </div>
        </section>

        {/* DLQ */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><ShieldAlert size={28} /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Dead Letter Queues</h3>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Poison Pill Protection</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            When a message fails all retries, it is moved to a <strong>DLT (Dead Letter Topic)</strong>. This isolates bad data from healthy traffic.
          </p>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded shadow-sm"><Trash2 size={16} className="text-red-500" /></div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Alert Triggered</div>
                <div className="text-xs font-bold text-slate-800">KafkaHeaders.RECEIVED_TOPIC</div>
              </div>
            </div>
            <div className="text-[10px] bg-white p-3 rounded font-mono text-slate-600 border border-slate-200">
              @DltHandler <br/>
              public void handle(OrderEvent e) {"{"} <br/>
              &nbsp;&nbsp;log.error("Dead Letter!"); <br/>
              {"}"}
            </div>
          </div>
        </section>
      </div>

      {/* Idempotency Section */}
      <section className="bg-slate-900 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Why do we need Redis?</h3>
            <p className="text-slate-400 leading-relaxed">
              Kafka guarantees <strong>At-Least-Once</strong> delivery. This means in rare cases, a consumer might receive the same message twice (e.g. if the consumer crashes after processing but before committing).
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-red-500">100%</div>
                <div className="text-[10px] uppercase text-slate-500 font-bold">Resilience</div>
              </div>
              <div className="text-center border-l border-slate-800 pl-6">
                <div className="text-3xl font-black text-red-500">Zero</div>
                <div className="text-[10px] uppercase text-slate-500 font-bold">Duplicates</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 font-mono text-xs text-green-400">
            <span className="text-slate-500">// Redis check (Set-If-Absent)</span> <br/>
            Boolean isNew = redis.setIfAbsent( <br/>
            &nbsp;&nbsp;"processed:" + correlationId, <br/>
            &nbsp;&nbsp;"PROCESSED", <br/>
            &nbsp;&nbsp;Duration.ofHours(24) <br/>
            ); <br/>
            if (!isNew) return; <span className="text-slate-500">// Skip!</span>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600 rounded-full blur-[120px] opacity-20"></div>
      </section>
    </div>
  );
};

const Step = ({ num, label, desc, active }: { num: string, label: string, desc: string, active?: boolean }) => (
  <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${active ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
      {num}
    </div>
    <div>
      <div className={`text-xs font-bold ${active ? 'text-blue-900' : 'text-slate-700'}`}>{label}</div>
      <div className="text-[10px] text-slate-400">{desc}</div>
    </div>
  </div>
);

export default ResilienceGuide;
