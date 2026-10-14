import React, { useState } from 'react';
import { SubBasin, CameraFeed } from '../types/telemetry';
import {
  Sparkles,
  X,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Navigation,
  Zap,
  Send,
  CheckCircle2,
  RefreshCw,
  FileText
} from 'lucide-react';

interface AutomatedAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subBasins: SubBasin[];
  cameras: CameraFeed[];
  rainIntensity: number;
}

export const AutomatedAgentModal: React.FC<AutomatedAgentModalProps> = ({
  isOpen,
  onClose,
  subBasins,
  cameras,
  rainIntensity,
}) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSynthesizePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/synthesize-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subBasinData: subBasins.map((b) => ({
            id: b.id,
            name: b.name,
            depthCm: b.currentWaterDepthCm,
            curbHeightCm: b.curbHeightCm,
            rateOfRiseCmMin: b.rateOfRiseCmPerMin,
            riskTier: b.riskTier,
            predictedMinutes: b.predictedSubmersionMinutes,
          })),
          activeIncidents: cameras
            .filter((c) => c.lastAnalysis && c.lastAnalysis.riskLevel !== 'SAFE')
            .map((c) => ({
              camera: c.name,
              location: c.location,
              surfaceWaterPct: c.lastAnalysis?.surfaceWaterAccumulationPct,
              depthCm: c.lastAnalysis?.estimatedWaterDepthCm,
              advisory: c.lastAnalysis?.automatedTransitAdvisory,
            })),
          precipitationMmHr: rainIntensity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setPlan(data);
    } catch (err: any) {
      console.error('Plan synthesis error:', err);
      setError(err.message || 'Synthesis failed. Using simulated dispatch plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Automated Municipal Early-Warning & Dispatch Agent
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.8 Flash Synthesizer
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Autonomous cross-sensor spatial synthesis & 20–40 min predictive transit rerouting engine.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!plan && !loading && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-semibold text-white">Synthesize Incident Action Plan</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Gemini will aggregate all 6 sub-basin edge depth sensors, CCTV computer vision water footprints, and precipitation rates to formulate an actionable municipal dispatch protocol.
                </p>
              </div>
              <button
                onClick={handleSynthesizePlan}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Execute Autonomous Agent Synthesis</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-purple-400 animate-spin" />
              <p className="text-sm font-mono text-purple-300 font-semibold">
                Synthesizing multi-basin telemetry with Gemini 3.8 Flash...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Computing hydraulic derivatives, transit passability matrix & SCADA actuator sequence
              </p>
            </div>
          )}

          {plan && (
            <div className="space-y-5">
              {/* Executive Alert Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 to-slate-950 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-red-300 uppercase tracking-widest block font-bold">
                    SYSTEM INCIDENT LEVEL: {plan.systemAlertLevel}
                  </span>
                  <div className="text-xl font-bold text-white mt-1">
                    {plan.subBasinsAtRiskCount} Sub-Basins at Imminent Inundation Risk
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Critical Choke Points: {plan.criticalChokePoints?.join(', ')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-red-400">
                    {plan.earlyWarningWindowMinutes} MIN LEAD TIME
                  </div>
                  <span className="text-[10px] font-mono text-red-300/80 block">
                    BEFORE COMPLETE SUBMERSION
                  </span>
                </div>
              </div>

              {/* Rerouting Protocols */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  Mandatory Transit Rerouting Vectors
                </h4>
                <div className="space-y-2">
                  {plan.reroutingPlans?.map((rp: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{rp.corridor}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          {rp.targetVehicles}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans leading-relaxed">{rp.advisory}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hydraulic Actuator Commands */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  SCADA Hydraulic Mitigation Directives
                </h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  {plan.hydraulicMitigationActions?.map((act: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                      <span className="text-amber-400 font-bold">[{idx + 1}]</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Public VMS Signage */}
              <div className="p-4 rounded-xl bg-black border border-amber-500/40 text-center">
                <span className="text-[10px] font-mono text-amber-500 block mb-1">
                  MUNICIPAL ARTERIAL HIGHWAY VMS BROADCAST
                </span>
                <p className="font-mono text-sm font-bold text-amber-400 uppercase tracking-widest">
                  ⚠ {plan.publicVmsSignage} ⚠
                </p>
              </div>

              {/* Re-synthesize Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSynthesizePlan}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-evaluate Telemetry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
