import React, { useState } from 'react';
import { EmergencyReroute } from '../types/telemetry';
import {
  Navigation,
  Ambulance,
  Truck,
  Bus,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Radio,
  Send,
  Monitor
} from 'lucide-react';

interface TransitReroutingAdvisoryProps {
  reroutes: EmergencyReroute[];
  onBroadcastReroute?: (id: string) => void;
}

export const TransitReroutingAdvisory: React.FC<TransitReroutingAdvisoryProps> = ({
  reroutes,
  onBroadcastReroute,
}) => {
  const [broadcastedIds, setBroadcastedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'AMBULANCE' | 'TRANSIT_BUS' | 'FIRE_ENGINE'>('ALL');

  const handleBroadcast = (id: string) => {
    setBroadcastedIds((prev) => [...prev, id]);
    if (onBroadcastReroute) {
      onBroadcastReroute(id);
    }
  };

  const filteredReroutes = reroutes.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.targetVehicle === activeTab;
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'AMBULANCE':
        return <Ambulance className="w-4 h-4 text-rose-400" />;
      case 'FIRE_ENGINE':
        return <Truck className="w-4 h-4 text-orange-400" />;
      case 'TRANSIT_BUS':
        return <Bus className="w-4 h-4 text-cyan-400" />;
      default:
        return <Navigation className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Navigation className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base tracking-wide flex items-center gap-2">
              Automated Emergency Transit Rerouting Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Spatial Advisories
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic diversions for emergency ambulances, fire trucks, and municipal buses avoiding submerged choke points.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Corridors
          </button>
          <button
            onClick={() => setActiveTab('AMBULANCE')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              activeTab === 'AMBULANCE'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ambulance className="w-3 h-3 text-rose-400" />
            Ambulances
          </button>
          <button
            onClick={() => setActiveTab('TRANSIT_BUS')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              activeTab === 'TRANSIT_BUS'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bus className="w-3 h-3 text-cyan-400" />
            Transit Buses
          </button>
        </div>
      </div>

      {/* Reroute Corridor Cards */}
      <div className="space-y-4">
        {filteredReroutes.map((reroute) => {
          const isBroadcasted = broadcastedIds.includes(reroute.id);

          return (
            <div
              key={reroute.id}
              className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 space-y-3"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getVehicleIcon(reroute.targetVehicle)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        {reroute.corridor}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-red-500/20 text-red-300 border-red-500/40">
                        {reroute.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Target Fleet: {reroute.targetVehicle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      -{reroute.etaSavedMinutes} min
                    </span>
                    <span className="text-[10px] text-slate-500 block">ETA Saved vs. Stalled</span>
                  </div>
                  <button
                    onClick={() => handleBroadcast(reroute.id)}
                    disabled={isBroadcasted}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                      isBroadcasted
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-950'
                    }`}
                  >
                    {isBroadcasted ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Transmitted</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Reroute</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reroute Path Breakdown: Blocked vs. Elevated Detour */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {/* Blocked Choke */}
                <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
                  <span className="text-[10px] text-red-400 font-bold block mb-1 uppercase tracking-wider">
                    Blocked Choke Point
                  </span>
                  <div className="text-slate-200 font-semibold">{reroute.sourceChokePoint}</div>
                  <div className="text-[11px] text-red-300/80 mt-1">
                    Status: Culvert overflow exceeding 25cm. High hydro-lock stall risk.
                  </div>
                </div>

                {/* Elevated Detour Vector */}
                <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-3">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-1 uppercase tracking-wider">
                    Active Elevated Detour Vector
                  </span>
                  <div className="text-slate-200 font-semibold">{reroute.diversionRoute}</div>
                  <div className="text-[11px] text-emerald-300/80 mt-1">
                    Clearance: {reroute.elevationClearanceMeters}m above flood basin. Dry & passable.
                  </div>
                </div>
              </div>

              {/* Municipal Highway Variable Message Sign (VMS) Preview */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" />
                    Highway VMS Overhead Signage Broadcast
                  </span>
                  <span className="text-slate-500">Amber LED Matrix</span>
                </div>
                {/* Simulated Amber LED Dot Matrix */}
                <div className="bg-black border border-amber-900/80 rounded p-2 text-center">
                  <p className="font-mono text-xs md:text-sm text-amber-400 font-bold tracking-widest leading-relaxed uppercase selection:bg-amber-400 selection:text-black">
                    ⚠ {reroute.vmsSignageText} ⚠
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
