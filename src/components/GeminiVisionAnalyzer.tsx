import React, { useState, useRef } from 'react';
import { CameraFeed, SubBasin, VisionAnalysisResult } from '../types/telemetry';
import { SyntheticCameraCanvas } from './SyntheticCameraCanvas';
import {
  Sparkles,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Car,
  Truck,
  Ambulance,
  RefreshCw,
  Info,
  Maximize2,
  Radio,
  Share2
} from 'lucide-react';

interface GeminiVisionAnalyzerProps {
  cameras: CameraFeed[];
  selectedCameraId: string;
  onSelectCamera: (id: string) => void;
  subBasins: SubBasin[];
  rainIntensity: number;
  onUpdateAnalysis: (cameraId: string, result: VisionAnalysisResult) => void;
  onTriggerRerouteAlert?: (message: string) => void;
}

export const GeminiVisionAnalyzer: React.FC<GeminiVisionAnalyzerProps> = ({
  cameras,
  selectedCameraId,
  onSelectCamera,
  subBasins,
  rainIntensity,
  onUpdateAnalysis,
  onTriggerRerouteAlert,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentCanvasSnapshot, setCurrentCanvasSnapshot] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentCam = cameras.find((c) => c.id === selectedCameraId) || cameras[0];
  const associatedBasin = subBasins.find((b) => b.id === currentCam.subBasinId) || subBasins[0];
  const analysis = currentCam.lastAnalysis;

  // Handle local file upload (dashcam / traffic cam snapshot)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunGeminiVision = async () => {
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const imagePayload = uploadedImage || currentCanvasSnapshot;

      const response = await fetch('/api/gemini/analyze-flood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePayload,
          cameraId: currentCam.id,
          cameraName: currentCam.name,
          location: currentCam.location,
          sector: currentCam.sector,
          subBasinId: associatedBasin.id,
          iotDepthReadingCm: associatedBasin.currentWaterDepthCm,
          rainRateMmPerHour: rainIntensity,
          drainageStatus: associatedBasin.riskTier,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      onUpdateAnalysis(currentCam.id, {
        ...data,
        analyzedAt: 'Just now',
      });
    } catch (err: any) {
      console.error('Vision analysis failed:', err);
      setErrorMsg(err.message || 'Analysis failed. Using automated fallback simulation.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getPassabilityBadge = (status?: string) => {
    switch (status) {
      case 'SAFE':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'SAFE CLEARANCE',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'MARGINAL':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'MARGINAL HAZARD',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'IMPASSABLE':
      default:
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
          label: 'IMPASSABLE / BLOCKED',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5">
      {/* Header & Camera Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-base tracking-wide flex items-center gap-2">
              Gemini Multimodal Computer Vision Telemetry
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Gemini 3.8 Flash
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time optical depth estimation, tire waterline tracking, and storm drain intake obstruction detection.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1.5 font-mono transition-all"
            title="Upload dashcam or traffic camera photograph"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={handleRunGeminiVision}
            disabled={analyzing}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-md ${
              analyzing
                ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-purple-900/30'
            }`}
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Optical Feed...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Run Gemini Telemetry</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Camera Selection Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 text-[11px] whitespace-nowrap">Feeds:</span>
        {cameras.map((cam) => (
          <button
            key={cam.id}
            onClick={() => {
              setUploadedImage(null);
              onSelectCamera(cam.id);
            }}
            className={`px-2.5 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              cam.id === selectedCameraId && !uploadedImage
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-semibold shadow-sm'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>{cam.name.slice(0, 24)}</span>
          </button>
        ))}
        {uploadedImage && (
          <div className="px-2.5 py-1.5 rounded-lg border bg-purple-950/80 border-purple-500/60 text-purple-300 flex items-center gap-1.5 font-semibold">
            <span>Custom Upload Active</span>
            <button
              onClick={() => setUploadedImage(null)}
              className="text-purple-400 hover:text-white ml-1 font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport & Analysis Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Camera Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative group">
            {uploadedImage ? (
              <div className="relative overflow-hidden rounded-xl border border-purple-500/40 bg-slate-950 aspect-video shadow-2xl">
                <img
                  src={uploadedImage}
                  alt="Custom traffic snapshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded border border-purple-500/40 text-[10px] font-mono text-purple-300">
                  USER UPLOADED ARTERIAL DASHCAM
                </div>
              </div>
            ) : (
              <SyntheticCameraCanvas
                sceneType={currentCam.syntheticSceneType}
                waterDepthCm={associatedBasin.currentWaterDepthCm}
                rainIntensity={rainIntensity}
                showVisionOverlay={showOverlay}
                onSnapshotReady={(dataUrl) => setCurrentCanvasSnapshot(dataUrl)}
              />
            )}

            {/* Overlay toggle button */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono border backdrop-blur-md transition-all flex items-center gap-1 ${
                  showOverlay
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>AI Vision HUD {showOverlay ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Telemetry quick bar below camera */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Co-located Edge Sensor:</span>
              <span className="text-white font-bold">{associatedBasin.currentWaterDepthCm.toFixed(1)} cm</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Location:</span>
              <span className="text-slate-200">{currentCam.location}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Resolution: {currentCam.resolution}
            </div>
          </div>
        </div>

        {/* Right Column: AI Telemetry Findings (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {analysis ? (
            <div className="space-y-3">
              {/* Primary Inundation Metric Card */}
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Surface Water Accumulation
                  </span>
                  <span className="text-xs font-mono text-purple-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {analysis.source || 'Gemini Vision'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-cyan-300">
                      {analysis.surfaceWaterAccumulationPct}%
                    </span>
                    <span className="text-xs text-slate-400">road coverage</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-white">
                      {analysis.estimatedWaterDepthCm.toFixed(1)} cm
                    </span>
                    <span className="text-[10px] text-slate-400 block">Est. Max Depth</span>
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      analysis.surfaceWaterAccumulationPct > 70
                        ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, analysis.surfaceWaterAccumulationPct)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-500">
                  <span>Confidence: <strong className="text-slate-300">{analysis.depthConfidence}</strong></span>
                  <span>Curb Breached: <strong className={analysis.curbSubmersionDetected ? 'text-red-400' : 'text-emerald-400'}>
                    {analysis.curbSubmersionDetected ? 'YES (>15cm)' : 'NO'}
                  </strong></span>
                </div>
              </div>

              {/* Vehicle Passability Assessment Matrix */}
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
                  Transit Passability Matrix
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Sedan */}
                  {(() => {
                    const badge = getPassabilityBadge(analysis.vehiclePassability?.sedan);
                    return (
                      <div className={`p-2 rounded-lg border ${badge.bg} flex flex-col items-center text-center`}>
                        <Car className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-bold">SEDAN</span>
                        <span className="text-[9px] font-mono mt-0.5">{badge.label.split(' ')[0]}</span>
                      </div>
                    );
                  })()}

                  {/* SUV / Transit Bus */}
                  {(() => {
                    const badge = getPassabilityBadge(analysis.vehiclePassability?.suvTransit);
                    return (
                      <div className={`p-2 rounded-lg border ${badge.bg} flex flex-col items-center text-center`}>
                        <Truck className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-bold">TRANSIT BUS</span>
                        <span className="text-[9px] font-mono mt-0.5">{badge.label.split(' ')[0]}</span>
                      </div>
                    );
                  })()}

                  {/* Ambulance */}
                  {(() => {
                    const badge = getPassabilityBadge(analysis.vehiclePassability?.emergencyAmbulance);
                    return (
                      <div className={`p-2 rounded-lg border ${badge.bg} flex flex-col items-center text-center`}>
                        <Ambulance className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-bold">AMBULANCE</span>
                        <span className="text-[9px] font-mono mt-0.5">{badge.label.split(' ')[0]}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Storm Culvert Grate & Intake Blockage Diagnostic */}
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Culvert Grate Intake Status
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    analysis.culvertGrateBlockage?.blocked
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {analysis.culvertGrateBlockage?.blocked ? 'OBSTRUCTED' : 'CLEAR FLOW'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-1">
                  {analysis.culvertGrateBlockage?.obstructionType}
                </p>
                <div className="text-[11px] font-mono text-cyan-400">
                  Intake Aperture Open: <strong>{analysis.culvertGrateBlockage?.estimatedGrateOpenPct}%</strong>
                </div>
              </div>

              {/* Predictive Time-to-Submersion */}
              <div className="bg-gradient-to-r from-red-950/60 to-slate-950 border border-red-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-red-300 uppercase tracking-wider block">
                    Time to Complete Road Submersion
                  </span>
                  <span className="text-2xl font-extrabold font-mono text-red-400">
                    {analysis.timeToCompleteSubmersionMinutes} minutes
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Early warning lead time before arterial drowns
                  </span>
                </div>
                <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              {/* Automated Emergency Transit Advisory Order */}
              <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Share2 className="w-3.5 h-3.5" />
                    Automated Transit Advisory
                  </span>
                  {onTriggerRerouteAlert && (
                    <button
                      onClick={() => onTriggerRerouteAlert(analysis.automatedTransitAdvisory)}
                      className="text-[10px] font-mono px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold transition-all"
                    >
                      Broadcast Detour
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
                  {analysis.automatedTransitAdvisory}
                </p>
              </div>

              {/* Key Visual Indicators */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Optical Visual Indicators
                </span>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                  {analysis.keyVisualIndicators?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
              <Camera className="w-8 h-8 text-slate-600 mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">No Vision Telemetry Run Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
                Click &quot;Run Gemini Telemetry&quot; to perform multimodal computer vision analysis on this camera feed or uploaded image.
              </p>
              <button
                onClick={handleRunGeminiVision}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono rounded-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Feed Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
