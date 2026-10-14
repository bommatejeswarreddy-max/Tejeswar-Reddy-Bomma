export type RiskTier = 'SAFE' | 'WATCH' | 'WARNING' | 'CRITICAL_SUBMERSION';

export interface IoTSensorNode {
  id: string;
  name: string;
  type: 'ULTRASONIC_DEPTH' | 'HYDROSTATIC_PRESSURE' | 'DOPPLER_FLOW' | 'SILT_ACOUSTIC';
  batteryPct: number;
  signalDbm: number; // e.g. -78 dBm
  hardwareStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastPingSecsAgo: number;
  samplingIntervalSec: number;
}

export interface SubBasin {
  id: string;
  code: string;
  name: string;
  sector: string;
  elevationMeters: number; // e.g. 4.2m above sea level (low-lying)
  catchmentAreaSqKm: number;
  roadCrownElevationCm: number; // e.g. 50cm
  curbHeightCm: number; // e.g. 15cm
  currentWaterDepthCm: number;
  historicalMaxDepthCm: number;
  culvertDiameterMeters: number;
  maxCulvertDischargeM3s: number;
  currentDischargeM3s: number;
  flowVelocityMps: number;
  siltBuildupPct: number;
  riskTier: RiskTier;
  rateOfRiseCmPerMin: number;
  predictedSubmersionMinutes: number; // Early warning: 20-40 mins
  cameraFeedId: string;
  underpassLocation: string;
  arterialCorridor: string;
  iotSensors: IoTSensorNode[];
  coordinates: { x: number; y: number }; // Relative map coordinates (0-100)
}

export interface VehiclePassability {
  sedan: 'SAFE' | 'MARGINAL' | 'IMPASSABLE';
  suvTransit: 'SAFE' | 'MARGINAL' | 'IMPASSABLE';
  emergencyAmbulance: 'SAFE' | 'MARGINAL' | 'IMPASSABLE';
}

export interface CulvertGrateBlockage {
  blocked: boolean;
  obstructionType: string;
  estimatedGrateOpenPct: number;
}

export interface VisionAnalysisResult {
  source?: string;
  surfaceWaterAccumulationPct: number;
  estimatedWaterDepthCm: number;
  depthConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  vehiclePassability: VehiclePassability;
  curbSubmersionDetected: boolean;
  culvertGrateBlockage: CulvertGrateBlockage;
  riskLevel: RiskTier;
  timeToCompleteSubmersionMinutes: number;
  automatedTransitAdvisory: string;
  keyVisualIndicators: string[];
  technicalNotes: string;
  analyzedAt?: string;
}

export interface CameraFeed {
  id: string;
  name: string;
  sector: string;
  location: string;
  subBasinId: string;
  status: 'ONLINE' | 'STREAMING' | 'MAINTENANCE';
  currentDepthCm: number;
  surfaceCoveragePct: number;
  resolution: string;
  fps: number;
  syntheticSceneType: 'UNDERPASS_RISING' | 'CULVERT_INTAKE' | 'HIGHWAY_CHOKE' | 'LOWLAND_POLDER' | 'VIADUCT_BASIN';
  customImageBase64?: string;
  lastAnalysis?: VisionAnalysisResult;
}

export interface EmergencyReroute {
  id: string;
  corridor: string;
  targetVehicle: 'AMBULANCE' | 'FIRE_ENGINE' | 'TRANSIT_BUS' | 'ALL_TRAFFIC';
  sourceChokePoint: string;
  diversionRoute: string;
  elevationClearanceMeters: number;
  etaSavedMinutes: number;
  status: 'ACTIVE_MANDATORY' | 'ADVISORY_ISSUED' | 'STANDBY';
  vmsSignageText: string;
  dispatchedAt: string;
}

export interface HydraulicActuator {
  id: string;
  name: string;
  type: 'PUMP_STATION' | 'SLUICE_FLAP_GATE' | 'RETENTION_WEIR';
  location: string;
  subBasinId: string;
  status: 'AUTO_ENGAGED' | 'MANUAL_RUNNING' | 'STANDBY';
  currentLoadPct: number;
  capacityM3s: number;
  fuelBatteryLevelPct: number;
}

export interface CitizenGrievanceVsTelemetry {
  id: string;
  incidentLocation: string;
  manualCitizenCallTime: string;
  iotEarlyWarningLeadTime: string;
  timeSavedMinutes: number;
  outcomePrevented: string;
}
