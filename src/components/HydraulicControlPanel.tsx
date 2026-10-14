import React, { useState } from 'react';
import { HydraulicActuator } from '../types/telemetry';
import {
  Zap,
  Activity,
  Power,
  RotateCw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  HardDrive
} from 'lucide-react';

interface HydraulicControlPanelProps {
  actuators: HydraulicActuator[];
  onToggleActuator?: (id: string) => void;
}

export const HydraulicControlPanel: React.FC<HydraulicControlPanelProps> = ({
  actuators: initialActuators,
  onToggleActuator,
}) => {
  const [actuators, setActuators] = useState<HydraulicActuator[]>(initialActuators);

  const handleToggle = (id: string) => {
    setActuators((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextStatus =
            act.status === 'AUTO_ENGAGED' || act.status === 'MANUAL_RUNNING'
              ? 'STANDBY'
              : 'MANUAL_RUNNING';
          return { ...act, status: nextStatus };
        }
        return act;
      })
    );
    if (onToggleActuator) {
      onToggleActuator(id);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base tracking-wide flex items-center gap-2">
              Hydraulic Actuator & Pumping Station Control
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SCADA Supervisory Interface
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervisory actuation of auxiliary sump booster pumps, retention flap gates, and weir barriers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SCADA Network: Synchronized</span>
        </div>
      </div>

      {/* Actuator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actuators.map((act) => {
          const isRunning = act.status === 'AUTO_ENGAGED' || act.status === 'MANUAL_RUNNING';

          return (
            <div
              key={act.id}
              className={`p-4 rounded-xl border transition-all ${
                isRunning
                  ? 'bg-slate-950/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-950/50 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{act.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                        act.status === 'AUTO_ENGAGED'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : act.status === 'MANUAL_RUNNING'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {act.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{act.location}</span>
                </div>

                <button
                  onClick={() => handleToggle(act.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    isRunning
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                  title={isRunning ? 'Disengage actuator' : 'Engage actuator'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Gauges */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>Discharge Hydraulic Load:</span>
                    <span className={isRunning ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      {isRunning ? act.currentLoadPct : 0}% ({isRunning ? ((act.capacityM3s * act.currentLoadPct) / 100).toFixed(1) : 0} m³/s)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${isRunning ? act.currentLoadPct : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Rated Capacity: <strong className="text-slate-200">{act.capacityM3s} m³/s</strong></span>
                  <span>Fuel / Battery: <strong className="text-emerald-400">{act.fuelBatteryLevelPct}%</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
