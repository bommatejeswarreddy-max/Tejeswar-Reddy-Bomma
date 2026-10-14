import React, { useState, useEffect } from 'react';
import {
  INITIAL_SUB_BASINS,
  INITIAL_CAMERA_FEEDS,
  INITIAL_EMERGENCY_REROUTES,
  INITIAL_HYDRAULIC_ACTUATORS,
} from './data/mockTelemetryData';
import { SubBasin, CameraFeed, EmergencyReroute, HydraulicActuator, VisionAnalysisResult } from './types/telemetry';
import { Header } from './components/Header';
import { InteractiveMap } from './components/InteractiveMap';
import { GeminiVisionAnalyzer } from './components/GeminiVisionAnalyzer';
import { IoTSensorGrid } from './components/IoTSensorGrid';
import { TransitReroutingAdvisory } from './components/TransitReroutingAdvisory';
import { HydraulicControlPanel } from './components/HydraulicControlPanel';
import { AutomatedAgentModal } from './components/AutomatedAgentModal';
import { GrievanceComparisonModal } from './components/GrievanceComparisonModal';
import {
  AlertTriangle,
  CheckCircle2,
  Bell,
  X,
  Radio,
  Sparkles,
  Navigation,
  Droplets,
  Layers
} from 'lucide-react';

export default function App() {
  // Global State
  const [subBasins, setSubBasins] = useState<SubBasin[]>(INITIAL_SUB_BASINS);
  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>(INITIAL_CAMERA_FEEDS);
  const [reroutes, setReroutes] = useState<EmergencyReroute[]>(INITIAL_EMERGENCY_REROUTES);
  const [actuators, setActuators] = useState<HydraulicActuator[]>(INITIAL_HYDRAULIC_ACTUATORS);

  // Active view navigation
  const [activeView, setActiveView] = useState<'MAP' | 'VISION' | 'TRANSIT' | 'HYDRAULICS'>('MAP');

  // Selections
  const [selectedBasinId, setSelectedBasinId] = useState<string>('basin-sb-04');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('cam-04-underpass');

  // Simulation controls
  const [rainIntensity, setRainIntensity] = useState<number>(45); // 45 mm/hr downpour
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Modals
  const [agentModalOpen, setAgentModalOpen] = useState<boolean>(false);
  const [grievanceModalOpen, setGrievanceModalOpen] = useState<boolean>(false);

  // Toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedBasin = subBasins.find((b) => b.id === selectedBasinId) || subBasins[0];

  // Simulation interval: dynamically advance runoff accumulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSubBasins((prev) =>
        prev.map((basin) => {
          // Calculate net inflow based on rainIntensity and silt blockage
          const rainFactor = (rainIntensity / 50) * 0.4;
          const siltFactor = 1 + (basin.siltBuildupPct / 100) * 0.5;
          const netRise = Math.max(-0.2, (rainFactor * siltFactor - 0.25) * 0.5);

          const newDepth = Math.max(2, Math.min(65, basin.currentWaterDepthCm + netRise));
          const newRate = Math.max(0.1, Number((netRise * 1.5).toFixed(2)));

          // Calculate time to submersion based on road crown (40-50cm)
          const remainingMargin = Math.max(0, basin.roadCrownElevationCm - newDepth);
          const predictedMins = Math.max(8, Math.round(remainingMargin / Math.max(0.2, newRate * 0.8)));

          // Compute risk tier
          let tier = basin.riskTier;
          if (newDepth > 28) tier = 'CRITICAL_SUBMERSION';
          else if (newDepth > 20) tier = 'WARNING';
          else if (newDepth > 12) tier = 'WATCH';
          else tier = 'SAFE';

          return {
            ...basin,
            currentWaterDepthCm: Number(newDepth.toFixed(1)),
            rateOfRiseCmPerMin: newRate,
            predictedSubmersionMinutes: predictedMins,
            riskTier: tier,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, rainIntensity]);

  const handleResetSimulation = () => {
    setSubBasins(INITIAL_SUB_BASINS);
    setToastMessage('Hydrological telemetry reset to initial baseline.');
  };

  const handleUpdateAnalysis = (cameraId: string, result: VisionAnalysisResult) => {
    setCameraFeeds((prev) =>
      prev.map((c) => (c.id === cameraId ? { ...c, lastAnalysis: result } : c))
    );
    setToastMessage(`Gemini Vision Telemetry completed for ${cameraId}.`);
  };

  const handleTriggerRerouteAlert = (message: string) => {
    setToastMessage(`BROADCAST TRANSMITTED: ${message}`);
  };

  const criticalAlertCount = subBasins.filter((b) => b.riskTier === 'CRITICAL_SUBMERSION' || b.riskTier === 'WARNING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 border border-cyan-500/60 text-slate-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Bell className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Operations Center Header */}
      <Header
        rainIntensity={rainIntensity}
        onSetRainIntensity={setRainIntensity}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        onResetSimulation={handleResetSimulation}
        onOpenAgentModal={() => setAgentModalOpen(true)}
        onOpenGrievanceModal={() => setGrievanceModalOpen(true)}
        activeView={activeView}
        onSelectView={setActiveView}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">
        {activeView === 'MAP' && (
          <div className="space-y-6">
            {/* GIS Interactive Command Map */}
            <div className="h-[520px]">
              <InteractiveMap
                subBasins={subBasins}
                selectedBasinId={selectedBasinId}
                onSelectBasin={setSelectedBasinId}
                cameraFeeds={cameraFeeds}
                onSelectCamera={(camId) => {
                  setSelectedCameraId(camId);
                  setActiveView('VISION');
                }}
                reroutes={reroutes}
                actuators={actuators}
                rainIntensity={rainIntensity}
              />
            </div>

            {/* Selected Micro-Basin Edge IoT Telemetry Grid */}
            <IoTSensorGrid basin={selectedBasin} rainIntensity={rainIntensity} />
          </div>
        )}

        {activeView === 'VISION' && (
          <div className="space-y-6">
            <GeminiVisionAnalyzer
              cameras={cameraFeeds}
              selectedCameraId={selectedCameraId}
              onSelectCamera={setSelectedCameraId}
              subBasins={subBasins}
              rainIntensity={rainIntensity}
              onUpdateAnalysis={handleUpdateAnalysis}
              onTriggerRerouteAlert={handleTriggerRerouteAlert}
            />

            {/* Accompanying IoT Depth Telemetry for Context */}
            <IoTSensorGrid basin={selectedBasin} rainIntensity={rainIntensity} />
          </div>
        )}

        {activeView === 'TRANSIT' && (
          <div className="space-y-6">
            <TransitReroutingAdvisory
              reroutes={reroutes}
              onBroadcastReroute={(id) => {
                setToastMessage(`Emergency dispatch transmitted for corridor ${id}.`);
              }}
            />

            {/* Quick Map Reference */}
            <div className="h-[400px]">
              <InteractiveMap
                subBasins={subBasins}
                selectedBasinId={selectedBasinId}
                onSelectBasin={setSelectedBasinId}
                cameraFeeds={cameraFeeds}
                onSelectCamera={setSelectedCameraId}
                reroutes={reroutes}
                actuators={actuators}
                rainIntensity={rainIntensity}
              />
            </div>
          </div>
        )}

        {activeView === 'HYDRAULICS' && (
          <div className="space-y-6">
            <HydraulicControlPanel
              actuators={actuators}
              onToggleActuator={(id) => {
                setToastMessage(`SCADA command dispatched to actuator ${id}.`);
              }}
            />

            <IoTSensorGrid basin={selectedBasin} rainIntensity={rainIntensity} />
          </div>
        )}
      </main>

      {/* Modals */}
      <AutomatedAgentModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        subBasins={subBasins}
        cameras={cameraFeeds}
        rainIntensity={rainIntensity}
      />

      <GrievanceComparisonModal
        isOpen={grievanceModalOpen}
        onClose={() => setGrievanceModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>HydroPulse Urban Telemetry Engine v4.2 // Municipal EOC Core</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Edge IoT + Gemini 3.8 Flash Multimodal</span>
          <span>•</span>
          <button
            onClick={() => setGrievanceModalOpen(true)}
            className="hover:text-cyan-300 transition-colors underline underline-offset-2"
          >
            Problem Statement & Impact
          </button>
        </div>
      </footer>
    </div>
  );
}
