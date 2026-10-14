import React from 'react';
import { GRIEVANCE_VS_TELEMETRY_DATA } from '../data/mockTelemetryData';
import {
  FileText,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

interface GrievanceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrievanceComparisonModal: React.FC<GrievanceComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Operational Paradigm: Manual Grievances vs. HydroPulse Telemetry
              </h3>
              <p className="text-xs text-slate-400">
                Solving the municipal lag: Eliminating delayed 311 citizen complaints and fixed river gauge blind spots.
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
          {/* Problem Statement Callout Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border-l-4 border-l-amber-500 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-amber-300 font-mono uppercase block mb-1">
              The Municipal Failure Mode:
            </strong>
            &quot;Municipalities and emergency transit lack automated, real-time spatial awareness of urban micro-flooding. Existing municipal monitoring relies on manual grievance reports or fixed river gauges, failing to predict street-level culvert overflows and leaving commuters, transit operators, and disaster teams without actionable early-warning alerts.&quot;
          </div>

          {/* Timeline Architecture Comparison Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Old Method */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-red-400">
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4" />
                  Legacy Citizen Grievance Model
                </span>
                <span>T+45 MIN LAG</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">1.</span>
                  <span>T+00m: Downpour begins; storm culvert grates choke on debris.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">2.</span>
                  <span>T+20m: Underpass submerges past 30cm. River gauges still read normal!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">3.</span>
                  <span>T+35m: First stranded commuter calls 911/311 hotline.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">4.</span>
                  <span>T+45m: Ambulance enters blind, stalls in water. Dispatch delayed.</span>
                </li>
              </ul>
            </div>

            {/* HydroPulse Automated Telemetry */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  HydroPulse Edge IoT + Vision
                </span>
                <span>T-30 MIN LEAD TIME</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span>T+02m: Ultrasonic IoT nodes detect culvert rate of rise dh/dt &gt; 1.0cm/min.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span>T+05m: Gemini Multimodal Vision verifies surface sheet flow & grate choke.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span>T+08m: Autonomous Agent triggers auxiliary pumps & seals sluice gate S-04.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">4.</span>
                  <span>T+10m: Ambulances autonomously rerouted to dry viaducts 25 mins ahead!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Historical Case Studies Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Documented Metro Valley Corridor Incident Comparisons
            </h4>
            <div className="space-y-3">
              {GRIEVANCE_VS_TELEMETRY_DATA.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-sm">{item.incidentLocation}</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                      +{item.timeSavedMinutes} Minutes Net Saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-slate-300">
                    <div>
                      <span className="text-[10px] text-red-400 block uppercase">Manual Grievance:</span>
                      <p className="mt-0.5">{item.manualCitizenCallTime}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block uppercase">HydroPulse Early Warning:</span>
                      <p className="mt-0.5">{item.iotEarlyWarningLeadTime}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-cyan-300 font-sans text-xs">
                    <strong>Mitigation Outcome:</strong> {item.outcomePrevented}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
