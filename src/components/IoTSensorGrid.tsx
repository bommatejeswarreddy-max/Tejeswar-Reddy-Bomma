import React from 'react';
import { SubBasin } from '../types/telemetry';
import {
  Radio,
  Wifi,
  BatteryCharging,
  Gauge,
  TrendingUp,
  Droplets,
  HardDrive,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface IoTSensorGridProps {
  basin: SubBasin;
  rainIntensity: number;
}

export const IoTSensorGrid: React.FC<IoTSensorGridProps> = ({ basin, rainIntensity }) => {
  // Culvert hydraulic cross-section parameters
  const pipeDiameterM = basin.culvertDiameterMeters;
  const currentDepthM = basin.currentWaterDepthCm / 100;
  const siltDepthM = (basin.siltBuildupPct / 100) * (pipeDiameterM * 0.4);
  const waterHeightFraction = Math.min(1, currentDepthM / pipeDiameterM);
  const siltHeightFraction = Math.min(0.4, siltDepthM / pipeDiameterM);

  // Hydraulic conduit fullness percentage
  const hydraulicLoadPct = Math.min(100, Math.round((basin.currentDischargeM3s / basin.maxCulvertDischargeM3s) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base tracking-wide flex items-center gap-2">
              Edge IoT Storm Drain Depth & Telemetry Grid
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LoRaWAN / 4G Edge Nodes
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ultrasonic transducers and hydrostatic sump sensors monitoring culvert discharge capacity.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-500">Sub-Basin:</span>
          <span className="text-cyan-400 font-bold">{basin.code}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{basin.name}</span>
        </div>
      </div>

      {/* Main Grid: Culvert Cross-Section Visualization & Hydraulic Derivative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Culvert Hydraulic Cross-Section Diagram (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
            <span className="uppercase tracking-wider">Culvert Conduit Cross-Section</span>
            <span className="text-cyan-400 font-semibold">{pipeDiameterM.toFixed(1)}m Ø Culvert</span>
          </div>

          {/* SVG Culvert Pipe Cutaway */}
          <div className="relative w-48 h-48 my-2">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                <clipPath id="pipeClip">
                  <circle cx="100" cy="100" r="80" />
                </clipPath>
                <linearGradient id="waterFlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
                </linearGradient>
                <pattern id="siltPattern" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill="#78350f" opacity="0.9" />
                  <circle cx="4" cy="4" r="1.5" fill="#92400e" />
                </pattern>
              </defs>

              {/* Concrete outer ring */}
              <circle cx="100" cy="100" r="92" fill="#1e293b" stroke="#475569" strokeWidth="4" />
              {/* Inner pipe wall */}
              <circle cx="100" cy="100" r="80" fill="#0f172a" stroke="#64748b" strokeWidth="2" />

              {/* Inside clipped elements */}
              <g clipPath="url(#pipeClip)">
                {/* Air headroom */}
                <rect x="20" y="20" width="160" height="160" fill="#090d16" />

                {/* Flowing Water Level */}
                {waterHeightFraction > 0 && (
                  <rect
                    x="20"
                    y={180 - waterHeightFraction * 160}
                    width="160"
                    height={waterHeightFraction * 160}
                    fill="url(#waterFlowGrad)"
                  />
                )}

                {/* Silt & Sedimentation Bed at Bottom */}
                {siltHeightFraction > 0 && (
                  <rect
                    x="20"
                    y={180 - siltHeightFraction * 160}
                    width="160"
                    height={siltHeightFraction * 160}
                    fill="url(#siltPattern)"
                  />
                )}

                {/* Water surface ripple line */}
                <line
                  x1="20"
                  y1={180 - waterHeightFraction * 160}
                  x2="180"
                  y2={180 - waterHeightFraction * 160}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </g>

              {/* Ultrasonic Sensor Target Line */}
              <line x1="100" y1="20" x2="100" y2={180 - waterHeightFraction * 160} stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="100" cy="20" r="4" fill="#10b981" />
            </svg>

            {/* Ultrasonic Beam Icon */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/40">
              ULTRASONIC
            </div>
          </div>

          {/* Silt Bed & Headroom Legend */}
          <div className="w-full grid grid-cols-2 gap-2 text-[11px] font-mono mt-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-800 inline-block"></span>
              <span>Silt Choke: <strong className="text-amber-300">{basin.siltBuildupPct}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-600 inline-block"></span>
              <span>Load: <strong className="text-cyan-300">{hydraulicLoadPct}%</strong></span>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics & Early Warning Predictive Derivatives (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Key Metric 4-Pack */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Water Depth */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Water Depth
              </span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {basin.currentWaterDepthCm.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> cm</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Curb: {basin.curbHeightCm}cm | Crown: {basin.roadCrownElevationCm}cm
              </span>
            </div>

            {/* Rate of Rise dh/dt */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Rate of Rise (dh/dt)
              </span>
              <span className={`text-2xl font-bold font-mono mt-1 block ${basin.rateOfRiseCmPerMin > 1.0 ? 'text-red-400' : 'text-amber-400'}`}>
                +{basin.rateOfRiseCmPerMin.toFixed(2)}
                <span className="text-xs font-normal"> cm/m</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Inflection: Accelerating
              </span>
            </div>

            {/* Flow Velocity */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Flow Velocity
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                {basin.flowVelocityMps.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> m/s</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Doppler Acoustic Sensor
              </span>
            </div>

            {/* Discharge Rate */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Discharge Volume
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                {basin.currentDischargeM3s.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal"> m³/s</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Max: {basin.maxCulvertDischargeM3s} m³/s
              </span>
            </div>
          </div>

          {/* Time-To-Submersion Autonomous Warning Banner */}
          <div className="bg-gradient-to-r from-red-950/80 via-slate-950 to-slate-950 border border-red-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="animate-pulse flex h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
                  Autonomous Flash Flood Time-to-Submersion
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Hydrological inflow derivative projects road crown submergence (&gt;35cm) in:
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold font-mono text-red-400">
                {basin.predictedSubmersionMinutes} MINUTES
              </span>
              <span className="text-[10px] font-mono text-red-300/80 block">
                EARLY WARNING WINDOW // DISPATCH READY
              </span>
            </div>
          </div>

          {/* Edge IoT Node Hardware Health Cards */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
              Active Edge IoT Hardware Nodes ({basin.iotSensors.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {basin.iotSensors.map((sensor) => (
                <div key={sensor.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-semibold truncate text-[11px]">
                      {sensor.name}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="text-cyan-300">{sensor.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal:</span>
                      <span className="text-slate-200">{sensor.signalDbm} dBm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery:</span>
                      <span className="text-emerald-300">{sensor.batteryPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heartbeat:</span>
                      <span className="text-slate-400">{sensor.lastPingSecsAgo}s ago</span>
                    </div>
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
