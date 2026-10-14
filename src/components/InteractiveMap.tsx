import React, { useState } from 'react';
import { SubBasin, CameraFeed, EmergencyReroute, HydraulicActuator } from '../types/telemetry';
import {
  Layers,
  Camera,
  Radio,
  Navigation,
  AlertTriangle,
  Zap,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';

interface InteractiveMapProps {
  subBasins: SubBasin[];
  selectedBasinId: string;
  onSelectBasin: (basinId: string) => void;
  cameraFeeds: CameraFeed[];
  onSelectCamera: (cameraId: string) => void;
  reroutes: EmergencyReroute[];
  actuators: HydraulicActuator[];
  rainIntensity: number; // 0 - 100 mm/hr
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  subBasins,
  selectedBasinId,
  onSelectBasin,
  cameraFeeds,
  onSelectCamera,
  reroutes,
  actuators,
  rainIntensity,
}) => {
  // Layer visibility toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showConduits, setShowConduits] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showReroutes, setShowReroutes] = useState(true);
  const [showTopography, setShowTopography] = useState(true);

  const selectedBasin = subBasins.find((b) => b.id === selectedBasinId) || subBasins[0];

  const getRiskColor = (tier: string) => {
    switch (tier) {
      case 'CRITICAL_SUBMERSION':
        return '#ef4444'; // Red
      case 'WARNING':
        return '#f97316'; // Orange
      case 'WATCH':
        return '#eab308'; // Yellow
      default:
        return '#10b981'; // Green
    }
  };

  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL_SUBMERSION':
        return 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse';
      case 'WARNING':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'WATCH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
              GIS Telemetry Grid // Metro Valley Basin Map
            </span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="text-xs text-slate-400 hidden lg:flex items-center gap-2 font-mono">
            <span>PRECIPITATION:</span>
            <span className={`font-semibold ${rainIntensity > 50 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {rainIntensity} mm/hr
            </span>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-slate-500 mr-1 flex items-center gap-1 text-[11px]">
            <Layers className="w-3.5 h-3.5" /> Layers:
          </span>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-1 rounded-md border transition-all ${
              showHeatmap
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-900/40'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Water Depth
          </button>
          <button
            onClick={() => setShowConduits(!showConduits)}
            className={`px-2 py-1 rounded-md border transition-all ${
              showConduits
                ? 'bg-blue-950/80 border-blue-500/60 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Culvert Conduits
          </button>
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2 py-1 rounded-md border transition-all ${
              showSensors
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            IoT Nodes
          </button>
          <button
            onClick={() => setShowCameras(!showCameras)}
            className={`px-2 py-1 rounded-md border transition-all ${
              showCameras
                ? 'bg-purple-950/80 border-purple-500/60 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            CCTV Vision
          </button>
          <button
            onClick={() => setShowReroutes(!showReroutes)}
            className={`px-2 py-1 rounded-md border transition-all ${
              showReroutes
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            Reroutes
          </button>
        </div>
      </div>

      {/* Vector Interactive GIS Canvas */}
      <div className="relative flex-1 w-full min-h-[460px] bg-[#070b13] overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* SVG GIS Layer */}
        <svg
          viewBox="0 0 1000 680"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Gradients for sub-basins */}
            <linearGradient id="basinGradSB04" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="basinGradSB07" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="basinGradSB09" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#713f12" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="basinGradSB12" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#713f12" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="basinGradSB01" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="basinGradSB15" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#713f12" stopOpacity="0.1" />
            </linearGradient>

            {/* River Gradient */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#0369a1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.8" />
            </linearGradient>

            {/* Pulsing glow filter */}
            <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Topography Contour Lines */}
          {showTopography && (
            <g stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" fill="none">
              <path d="M 50,150 Q 250,120 480,180 T 950,210" />
              <path d="M 40,260 Q 300,230 520,290 T 960,330" />
              <path d="M 60,380 Q 280,340 500,420 T 940,460" />
              <path d="M 50,510 Q 350,470 540,540 T 950,580" />
              <ellipse cx="250" cy="180" rx="160" ry="80" stroke="rgba(16, 185, 129, 0.07)" />
              <ellipse cx="420" cy="380" rx="140" ry="70" stroke="rgba(239, 68, 68, 0.09)" />
            </g>
          )}

          {/* Grand River & Estuary Waterway */}
          <path
            d="M 680,0 C 700,120 760,240 730,360 C 700,480 770,580 840,680 L 980,680 L 980,0 Z"
            fill="url(#riverGrad)"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Sub-Basin Watershed Boundaries & Depth Fill */}
          {showHeatmap && (
            <g className="cursor-pointer">
              {/* Basin SB-01 (Ridge) */}
              <polygon
                points="120,60 380,80 340,240 100,220"
                fill="url(#basinGradSB01)"
                stroke="#10b981"
                strokeWidth={selectedBasinId === 'basin-sb-01' ? 2.5 : 1}
                strokeDasharray="4 2"
                onClick={() => onSelectBasin('basin-sb-01')}
                className="transition-all hover:opacity-90"
              />

              {/* Basin SB-12 (University Viaduct) */}
              <polygon
                points="420,110 680,120 660,280 400,260"
                fill="url(#basinGradSB12)"
                stroke="#eab308"
                strokeWidth={selectedBasinId === 'basin-sb-12' ? 2.5 : 1}
                strokeDasharray="4 2"
                onClick={() => onSelectBasin('basin-sb-12')}
                className="transition-all hover:opacity-90"
              />

              {/* Basin SB-04 (CRITICAL CHOKE - 4th Ave Underpass) */}
              <g onClick={() => onSelectBasin('basin-sb-04')}>
                <polygon
                  points="280,260 560,270 540,490 260,470"
                  fill="url(#basinGradSB04)"
                  stroke="#ef4444"
                  strokeWidth={selectedBasinId === 'basin-sb-04' ? 3 : 1.5}
                  filter="url(#glowRed)"
                  className="transition-all hover:opacity-95"
                />
                {/* Pulsing inundation hazard aura */}
                <circle
                  cx="420"
                  cy="380"
                  r={35 + Math.sin(Date.now() / 300) * 8}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeOpacity="0.7"
                />
              </g>

              {/* Basin SB-07 (Grand River Culvert) */}
              <polygon
                points="580,290 760,280 770,480 570,500"
                fill="url(#basinGradSB07)"
                stroke="#f97316"
                strokeWidth={selectedBasinId === 'basin-sb-07' ? 2.5 : 1.2}
                onClick={() => onSelectBasin('basin-sb-07')}
                className="transition-all hover:opacity-90"
              />

              {/* Basin SB-09 (Industrial Polder) */}
              <polygon
                points="160,480 440,500 420,660 140,640"
                fill="url(#basinGradSB09)"
                stroke="#eab308"
                strokeWidth={selectedBasinId === 'basin-sb-09' ? 2.5 : 1}
                onClick={() => onSelectBasin('basin-sb-09')}
                className="transition-all hover:opacity-90"
              />

              {/* Basin SB-15 (Coastal Estuary) */}
              <polygon
                points="720,490 950,470 960,670 700,660"
                fill="url(#basinGradSB15)"
                stroke="#eab308"
                strokeWidth={selectedBasinId === 'basin-sb-15' ? 2.5 : 1}
                onClick={() => onSelectBasin('basin-sb-15')}
                className="transition-all hover:opacity-90"
              />
            </g>
          )}

          {/* Road Network & Highway Corridors */}
          <g stroke="rgba(148, 163, 184, 0.3)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* East-West Interstate Route 10 */}
            <path d="M 0,380 L 260,380 L 560,380 L 1000,380" />
            {/* North-South Grand Arterial */}
            <path d="M 420,0 L 420,680" />
            {/* Diagonal Hospital Expressway */}
            <path d="M 120,80 L 420,260 L 720,460" />
            {/* Industrial Loop */}
            <path d="M 280,560 L 680,560" />
          </g>

          {/* Road Surface Centerlines */}
          <g stroke="#334155" strokeWidth="3" fill="none">
            <path d="M 0,380 L 1000,380" />
            <path d="M 420,0 L 420,680" />
            <path d="M 120,80 L 720,460" />
            <path d="M 280,560 L 680,560" />
          </g>

          {/* Underpass Dip Highlight (4th Ave Below Viaduct) */}
          <g>
            <rect
              x="360"
              y="360"
              width="120"
              height="40"
              fill="rgba(239, 68, 68, 0.4)"
              stroke="#ef4444"
              strokeWidth="2"
              rx="4"
            />
            <text x="420" y="385" fill="#fecaca" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              UNDERPASS CHOKE (29.5cm)
            </text>
          </g>

          {/* Underground Culverts & Conduit Flow Paths */}
          {showConduits && (
            <g stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="8 6" fill="none" opacity="0.85">
              {/* Conduit from Basin SB-04 to Grand River */}
              <path d="M 420,380 Q 560,360 710,370" />
              {/* Conduit from Basin SB-12 to River */}
              <path d="M 540,190 Q 640,210 715,220" />
              {/* Conduit from SB-09 Polder to Harbor */}
              <path d="M 300,560 Q 520,600 780,630" />
              {/* Flow directional indicators */}
              <circle cx="560" cy="365" r="4" fill="#38bdf8" className="animate-pulse" />
              <circle cx="640" cy="210" r="3.5" fill="#38bdf8" className="animate-pulse" />
            </g>
          )}

          {/* Emergency Ambulance Reroute Vector (Detour via Elevated Overpass) */}
          {showReroutes && (
            <g>
              {/* Flooded Path (Blocked in Red X) */}
              <path
                d="M 280,380 L 420,380"
                stroke="#ef4444"
                strokeWidth="4"
                strokeDasharray="6 4"
                fill="none"
              />
              <line x1="330" y1="370" x2="350" y2="390" stroke="#ef4444" strokeWidth="3" />
              <line x1="350" y1="370" x2="330" y2="390" stroke="#ef4444" strokeWidth="3" />

              {/* Detour elevated vector (Emerald Green) */}
              <path
                d="M 280,380 Q 280,280 420,280 Q 560,280 560,380"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="8 4"
                fill="none"
                filter="url(#glowCyan)"
              />
              {/* Animated vehicle dot along detour */}
              <circle cx="420" cy="280" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2">
                <animate
                  attributeName="cx"
                  values="280;420;560"
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values="380;280;380"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Reroute Tag */}
              <rect x="360" y="250" width="120" height="22" fill="#064e3b" stroke="#10b981" rx="4" />
              <text x="420" y="265" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                AMB-04 DETOUR (+14.5m)
              </text>
            </g>
          )}

          {/* Sub-Basin Centroid Labels & Depth Gauges */}
          {subBasins.map((basin) => {
            const bx = (basin.coordinates.x / 100) * 1000;
            const by = (basin.coordinates.y / 100) * 680;
            const isSelected = basin.id === selectedBasinId;
            const riskColor = getRiskColor(basin.riskTier);

            return (
              <g
                key={basin.id}
                transform={`translate(${bx}, ${by})`}
                onClick={() => onSelectBasin(basin.id)}
                className="cursor-pointer group"
              >
                {/* Node Ring */}
                <circle
                  r={isSelected ? 24 : 18}
                  fill="#0f172a"
                  stroke={riskColor}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all"
                />
                {/* Pulsing ring for critical/warning */}
                {(basin.riskTier === 'CRITICAL_SUBMERSION' || basin.riskTier === 'WARNING') && (
                  <circle
                    r={isSelected ? 32 : 26}
                    fill="none"
                    stroke={riskColor}
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}
                <text
                  y="4"
                  fill="#f8fafc"
                  fontSize={isSelected ? '12' : '10'}
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {basin.code}
                </text>

                {/* Sub-Basin HUD Callout */}
                <g transform="translate(0, 32)">
                  <rect
                    x="-75"
                    y="0"
                    width="150"
                    height="42"
                    rx="6"
                    fill="rgba(15, 23, 42, 0.92)"
                    stroke={isSelected ? riskColor : 'rgba(100, 116, 139, 0.4)'}
                    strokeWidth={isSelected ? 1.5 : 1}
                  />
                  <text
                    x="0"
                    y="15"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {basin.name.slice(0, 22)}
                  </text>
                  <text
                    x="0"
                    y="31"
                    fill={riskColor}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {basin.currentWaterDepthCm.toFixed(1)}cm | {basin.predictedSubmersionMinutes}m SUBMERGE
                  </text>
                </g>
              </g>
            );
          })}

          {/* IoT Sensor Nodes */}
          {showSensors &&
            subBasins.flatMap((b) =>
              b.iotSensors.map((s, idx) => {
                const sx = (b.coordinates.x / 100) * 1000 + (idx - 1) * 28;
                const sy = (b.coordinates.y / 100) * 680 - 45;
                return (
                  <g key={s.id} transform={`translate(${sx}, ${sy})`} className="cursor-pointer">
                    <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                  </g>
                );
              })
            )}

          {/* CCTV Cameras */}
          {showCameras &&
            cameraFeeds.map((cam) => {
              const basin = subBasins.find((b) => b.id === cam.subBasinId);
              if (!basin) return null;
              const cx = (basin.coordinates.x / 100) * 1000 + 40;
              const cy = (basin.coordinates.y / 100) * 680 - 25;
              return (
                <g
                  key={cam.id}
                  transform={`translate(${cx}, ${cy})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCamera(cam.id);
                  }}
                  className="cursor-pointer group"
                >
                  <circle r="12" fill="#3b0764" stroke="#c084fc" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3" fill="#ffffff" />
                  {/* Tooltip on hover */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" transform="translate(18, -10)">
                    <rect x="0" y="0" width="130" height="26" rx="4" fill="#1e1b4b" stroke="#a855f7" />
                    <text x="8" y="16" fill="#f3e8ff" fontSize="9" fontFamily="monospace">
                      {cam.name.slice(0, 18)}
                    </text>
                  </g>
                </g>
              );
            })}
        </svg>

        {/* Floating Quick Telemetry Drawer for Selected Basin */}
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-slate-900/95 border border-slate-800 rounded-xl p-4 backdrop-blur-xl shadow-2xl z-20">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{selectedBasin.code}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getRiskBadge(selectedBasin.riskTier)}`}>
                  {selectedBasin.riskTier.replace('_', ' ')}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1 leading-snug">{selectedBasin.name}</h4>
              <p className="text-xs text-slate-400">{selectedBasin.underpassLocation}</p>
            </div>
            <button
              onClick={() => onSelectCamera(selectedBasin.cameraFeedId)}
              className="px-2.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 text-xs rounded-lg flex items-center gap-1.5 font-mono transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>CCTV Feed</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 text-center">
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 block">WATER DEPTH</span>
              <span className="text-base font-bold font-mono text-white">
                {selectedBasin.currentWaterDepthCm.toFixed(1)}
                <span className="text-xs text-slate-400 font-normal">cm</span>
              </span>
              <span className="text-[9px] text-slate-500 block">Curb: {selectedBasin.curbHeightCm}cm</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 block">RATE OF RISE</span>
              <span className={`text-base font-bold font-mono ${selectedBasin.rateOfRiseCmPerMin > 1.0 ? 'text-red-400' : 'text-amber-400'}`}>
                +{selectedBasin.rateOfRiseCmPerMin.toFixed(2)}
                <span className="text-xs font-normal">/min</span>
              </span>
              <span className="text-[9px] text-slate-500 block">Derivative dh/dt</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 block">EARLY WARNING</span>
              <span className="text-base font-bold font-mono text-cyan-400">
                {selectedBasin.predictedSubmersionMinutes}
                <span className="text-xs text-slate-400 font-normal">min</span>
              </span>
              <span className="text-[9px] text-cyan-500/80 block">Pre-submersion</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              {selectedBasin.iotSensors.length} Edge IoT Sensors
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Discharge: {selectedBasin.currentDischargeM3s} m³/s
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5 text-[10px] font-mono text-slate-300 backdrop-blur-md hidden sm:block z-10">
          <div className="font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Map Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Critical Submersion (&gt;25cm)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>Culvert Overflow Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span>Runoff Surge Watch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Safe Retention Flow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
