import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  CloudRain,
  Play,
  Pause,
  Sparkles,
  Clock,
  Layers,
  Activity,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  rainIntensity: number;
  onSetRainIntensity: (val: number) => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  onResetSimulation: () => void;
  onOpenAgentModal: () => void;
  onOpenGrievanceModal: () => void;
  activeView: 'MAP' | 'VISION' | 'TRANSIT' | 'HYDRAULICS';
  onSelectView: (view: 'MAP' | 'VISION' | 'TRANSIT' | 'HYDRAULICS') => void;
  criticalAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  rainIntensity,
  onSetRainIntensity,
  isSimulating,
  onToggleSimulating,
  onResetSimulation,
  onOpenAgentModal,
  onOpenGrievanceModal,
  activeView,
  onSelectView,
  criticalAlertCount,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Banner Alert Ticker */}
      <div className="bg-gradient-to-r from-red-950 via-slate-950 to-amber-950 border-b border-red-900/40 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-red-300 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
            ACTIVE EARLY WARNING ALERT:
          </span>
          <span className="text-slate-300 truncate text-[11px]">
            4th Ave Underpass (Basin SB-04) Water Depth Cresting 29.5cm — Submersion Projected in 18 Min — Ambulances Detoured via 8th Ave Viaduct.
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400 whitespace-nowrap font-mono">
          <span>{criticalAlertCount} Active Choke Points</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-semibold">{timeStr}</span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-950 text-white flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white font-sans">
                HydroPulse <span className="text-cyan-400">EOC</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
                SMART CITY DISASTER MITIGATION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Urban Drainage & Flash Waterlogging Telemetry // Edge IoT + Gemini Multimodal Vision
            </p>
          </div>
        </div>

        {/* Storm Simulator Controls & Rain Controller */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <CloudRain className={`w-4 h-4 ${rainIntensity > 50 ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="text-[11px] text-slate-400">Storm Rate:</span>
            <span className="text-white font-bold w-14">{rainIntensity} mm/h</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onSetRainIntensity(15)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                rainIntensity === 15
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Light
            </button>
            <button
              onClick={() => onSetRainIntensity(45)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                rainIntensity === 45
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Downpour
            </button>
            <button
              onClick={() => onSetRainIntensity(85)}
              className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                rainIntensity === 85
                  ? 'bg-red-950 border-red-500 text-red-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Cloudburst
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Simulation Toggle */}
          <button
            onClick={onToggleSimulating}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              isSimulating
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Sim Running</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Advance Storm</span>
              </>
            )}
          </button>

          <button
            onClick={onResetSimulation}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Reset telemetry baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Global Action Modals */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGrievanceModal}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono transition-all flex items-center gap-1.5"
            title="View comparison between legacy 311 citizen grievance calls and automated telemetry"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Grievance vs. Telemetry</span>
          </button>

          <button
            onClick={onOpenAgentModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-mono font-semibold shadow-lg shadow-purple-950/40 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Autonomous EOC Agent</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="px-4 flex items-center gap-2 border-t border-slate-800/80 overflow-x-auto text-xs font-mono bg-slate-950/70">
        <button
          onClick={() => onSelectView('MAP')}
          className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeView === 'MAP'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>GIS Micro-Basin Operations</span>
        </button>

        <button
          onClick={() => onSelectView('VISION')}
          className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeView === 'VISION'
              ? 'border-purple-400 text-purple-300 font-bold bg-purple-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Gemini Multimodal Vision Feed</span>
        </button>

        <button
          onClick={() => onSelectView('TRANSIT')}
          className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeView === 'TRANSIT'
              ? 'border-amber-400 text-amber-300 font-bold bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Emergency Transit Detours & VMS</span>
        </button>

        <button
          onClick={() => onSelectView('HYDRAULICS')}
          className={`py-2.5 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeView === 'HYDRAULICS'
              ? 'border-blue-400 text-blue-300 font-bold bg-blue-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>SCADA Pumping & Sluice Gates</span>
        </button>
      </div>
    </header>
  );
};
