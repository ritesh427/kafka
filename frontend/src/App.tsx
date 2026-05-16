import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import CockpitLayout from './CockpitLayout';
import SystemArchitecture from './pages/SystemArchitecture';
import SagaDashboard from './pages/SagaDashboard';
import ObservabilityHub from './pages/ObservabilityHub';
import ResilienceGuide from './pages/ResilienceGuide';
import KafkaInternals from './pages/KafkaInternals';
import ChaosLab from './pages/ChaosLab';
import MetricsCenter from './pages/MetricsCenter';
import SchemaEvolutionLab from './pages/SchemaEvolutionLab';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-red-900 text-white p-12 overflow-auto font-mono">
          <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-black/50 p-6 rounded-xl">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
        <CockpitLayout>
          <Routes>
            <Route path="/" element={<SystemArchitecture />} />
            <Route path="/saga" element={<SagaDashboard />} />
            <Route path="/observability" element={<ObservabilityHub />} />
            <Route path="/resilience" element={<ResilienceGuide />} />
            <Route path="/internals" element={<KafkaInternals />} />
            <Route path="/chaos" element={<ChaosLab />} />
            <Route path="/metrics" element={<MetricsCenter />} />
            <Route path="/schema" element={<SchemaEvolutionLab />} />
          </Routes>
        </CockpitLayout>
    </ErrorBoundary>
  );
};

export default App;
