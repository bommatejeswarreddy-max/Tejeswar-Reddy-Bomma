import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Increase payload limit to support CCTV base64 snapshot uploads
  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'HydroPulse Urban Drainage Telemetry API',
      hasGeminiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // Multimodal Gemini Flood Analysis endpoint
  app.post('/api/gemini/analyze-flood', async (req, res) => {
    try {
      const {
        imageBase64,
        cameraId,
        cameraName,
        location,
        sector,
        subBasinId,
        iotDepthReadingCm = 28,
        rainRateMmPerHour = 45,
        drainageStatus = 'RESTRICTED',
      } = req.body;

      if (!ai) {
        // High-fidelity fallback when API key is pending
        return res.json({
          source: 'simulated_engine',
          surfaceWaterAccumulationPct: Math.min(100, Math.round(iotDepthReadingCm * 2.2 + 20)),
          estimatedWaterDepthCm: iotDepthReadingCm,
          depthConfidence: 'HIGH',
          vehiclePassability: {
            sedan: iotDepthReadingCm > 20 ? 'IMPASSABLE' : iotDepthReadingCm > 12 ? 'MARGINAL' : 'SAFE',
            suvTransit: iotDepthReadingCm > 35 ? 'IMPASSABLE' : iotDepthReadingCm > 24 ? 'MARGINAL' : 'SAFE',
            emergencyAmbulance: iotDepthReadingCm > 30 ? 'IMPASSABLE' : iotDepthReadingCm > 18 ? 'MARGINAL' : 'SAFE',
          },
          curbSubmersionDetected: iotDepthReadingCm >= 15,
          culvertGrateBlockage: {
            blocked: iotDepthReadingCm > 25,
            obstructionType: iotDepthReadingCm > 25 ? 'High organic silt & storm runoff debris accumulation' : 'Partial surface leaf litter',
            estimatedGrateOpenPct: Math.max(15, 100 - Math.round(iotDepthReadingCm * 1.8)),
          },
          riskLevel: iotDepthReadingCm > 40 ? 'CRITICAL_SUBMERSION' : iotDepthReadingCm > 25 ? 'WARNING' : iotDepthReadingCm > 15 ? 'WATCH' : 'NORMAL',
          timeToCompleteSubmersionMinutes: Math.max(8, Math.round(45 - (iotDepthReadingCm * 0.7) - (rainRateMmPerHour * 0.2))),
          automatedTransitAdvisory: iotDepthReadingCm > 20
            ? `ALERT: Underpass approach at ${location} exceeding safe threshold. Diverting emergency transit to Elevated Corridor B.`
            : `MONITORING: Water accumulation within controlled retention rate at ${location}.`,
          keyVisualIndicators: [
            `Water level cresting at ${iotDepthReadingCm}cm above culvert baseline`,
            'Hydrodynamic surface reflections indicate sheet flow across lanes 1 and 2',
            'Turbulent swirling observed over curb intake grate',
          ],
          technicalNotes: 'Edge IoT ultrasonic depth fused with synthetic optical reference.',
        });
      }

      const promptText = `You are the chief computer vision and hydrological analyst at an Urban Drainage & Smart City Emergency Operations Center.
Analyze this traffic camera / dashcam snapshot and the accompanying edge telemetry for flash waterlogging and micro-basin culvert overflow.

Location Telemetry Context:
- Camera ID: ${cameraId || 'CAM-04'} (${cameraName || 'Arterial Underpass'})
- Sector: ${sector || 'Downtown Lowland Basin'} (Sub-basin: ${subBasinId || 'BASIN-SB-04'})
- Location: ${location || 'Westbound Arterial Underpass at 4th Ave'}
- Co-located Storm Drain IoT Ultrasonic Sensor Depth: ${iotDepthReadingCm} cm
- Upstream Radar Precipitation Rate: ${rainRateMmPerHour} mm/hr
- Culvert Hydraulic Status: ${drainageStatus}

Perform precise spatial water accumulation analysis:
1. Estimate surface water coverage (%) across roadway lanes.
2. Cross-correlate visual tire splash / waterline landmarks with the ${iotDepthReadingCm} cm IoT depth reading.
3. Determine vehicle passability for standard sedans (clearance ~15cm), SUVs/Buses (~30cm), and Emergency Ambulances (~25cm).
4. Inspect storm culvert grate intakes for debris or silt blockages.
5. Predict time until road reaches impassable submersion (>35cm) under current rain intensity (between 10 to 60 minutes).
6. Issue actionable emergency transit rerouting advisories.`;

      let contentsPayload: any;
      if (imageBase64 && imageBase64.includes(',')) {
        const [meta, rawData] = imageBase64.split(',');
        const mimeMatch = meta.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        contentsPayload = {
          parts: [
            {
              inlineData: {
                data: rawData,
                mimeType: mimeType,
              },
            },
            { text: promptText },
          ],
        };
      } else {
        contentsPayload = promptText;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsPayload,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              surfaceWaterAccumulationPct: {
                type: Type.NUMBER,
                description: 'Percentage of visible road surface covered with water (0-100)',
              },
              estimatedWaterDepthCm: {
                type: Type.NUMBER,
                description: 'Estimated water depth in centimeters on the lowest road lane',
              },
              depthConfidence: {
                type: Type.STRING,
                description: 'Confidence rating: HIGH, MEDIUM, or LOW',
              },
              vehiclePassability: {
                type: Type.OBJECT,
                properties: {
                  sedan: { type: Type.STRING, description: 'SAFE, MARGINAL, or IMPASSABLE' },
                  suvTransit: { type: Type.STRING, description: 'SAFE, MARGINAL, or IMPASSABLE' },
                  emergencyAmbulance: { type: Type.STRING, description: 'SAFE, MARGINAL, or IMPASSABLE' },
                },
                required: ['sedan', 'suvTransit', 'emergencyAmbulance'],
              },
              curbSubmersionDetected: {
                type: Type.BOOLEAN,
                description: 'True if water has crested or submerged the pedestrian sidewalk curb',
              },
              culvertGrateBlockage: {
                type: Type.OBJECT,
                properties: {
                  blocked: { type: Type.BOOLEAN, description: 'True if storm drain intake is partially or fully clogged' },
                  obstructionType: { type: Type.STRING, description: 'Description of blockage debris or clear status' },
                  estimatedGrateOpenPct: { type: Type.NUMBER, description: 'Percentage of drain aperture free to receive flow (0-100)' },
                },
                required: ['blocked', 'obstructionType', 'estimatedGrateOpenPct'],
              },
              riskLevel: {
                type: Type.STRING,
                description: 'NORMAL, WATCH, WARNING, or CRITICAL_SUBMERSION',
              },
              timeToCompleteSubmersionMinutes: {
                type: Type.NUMBER,
                description: 'Estimated minutes remaining (e.g. 15-45) until arterial road becomes completely submerged and impassable',
              },
              automatedTransitAdvisory: {
                type: Type.STRING,
                description: 'Concise, tactical rerouting order for emergency ambulances, transit buses, and police dispatch',
              },
              keyVisualIndicators: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 specific visual indicators observed (e.g., curb waterline, reflection width, tire hub submersion)',
              },
              technicalNotes: {
                type: Type.STRING,
                description: 'Engineering summary of hydraulic backflow or culvert capacity saturation',
              },
            },
            required: [
              'surfaceWaterAccumulationPct',
              'estimatedWaterDepthCm',
              'depthConfidence',
              'vehiclePassability',
              'curbSubmersionDetected',
              'culvertGrateBlockage',
              'riskLevel',
              'timeToCompleteSubmersionMinutes',
              'automatedTransitAdvisory',
              'keyVisualIndicators',
              'technicalNotes',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        source: 'gemini-3.8-flash',
        ...parsed,
      });
    } catch (error: any) {
      console.error('Error in analyze-flood:', error);
      res.status(500).json({
        error: error.message || 'Flood vision analysis failed',
        fallback: true,
      });
    }
  });

  // Automated Early-Warning Dispatch Agent endpoint
  app.post('/api/gemini/synthesize-dispatch', async (req, res) => {
    try {
      const { subBasinData, activeIncidents, precipitationMmHr } = req.body;

      if (!ai) {
        return res.json({
          source: 'simulated_engine',
          systemAlertLevel: 'HIGH_ALERT',
          subBasinsAtRiskCount: 2,
          criticalChokePoints: [
            'Sector 4 Underpass Arterial (Basin SB-04)',
            'Grand River Culvert Inundation Zone (Basin SB-07)',
          ],
          earlyWarningWindowMinutes: 28,
          reroutingPlans: [
            {
              corridor: 'Underpass 4th Ave Corridor',
              targetVehicles: 'Emergency Ambulances & Fire Engines',
              advisory: 'CRITICAL CHOKE: Underpass water depth rising at 1.4 cm/min. Divert via 8th Ave Overpass Viaduct (Clearance 4.5m, dry). Saves 14 min ETA vs trapped in choke.',
              status: 'MANDATORY_DIVERSION',
            },
            {
              corridor: 'Transit Line 12 (Downtown Arterial)',
              targetVehicles: 'Public Transit Buses',
              advisory: 'Reroute eastbound buses via Pine Boulevard. Station 14 underpass closed due to 32cm culvert backflow.',
              status: 'REROUTED',
            },
          ],
          hydraulicMitigationActions: [
            'Trigger emergency boost on Auxiliary Diesel Pump Station AP-02',
            'Actuate flap gate S-04 to divert excess discharge into Retention Basin Gamma',
            'Dispatch rapid clearing crew to Grate C-12 (suspected organic debris choke)',
          ],
          publicVmsSignage: 'FLASH WATERLOGGING WARNING: 4TH AVE UNDERPASS CLOSED. USE ELEVATED VIADUCT.',
        });
      }

      const prompt = `You are the Automated Municipal Early-Warning & Transit Dispatch Agent for a metropolitan smart city.
Current Environmental Situation:
- Urban Radar Precipitation: ${precipitationMmHr || 52} mm/hr (Heavy convective downpour)
- Monitored Sub-basins & IoT Sensor Feeds:
${JSON.stringify(subBasinData || [], null, 2)}
- Active CCTV Anomaly Flags:
${JSON.stringify(activeIncidents || [], null, 2)}

Task:
Synthesize multi-sensor telemetry (edge depth sensors, culvert discharge velocity, CCTV water accumulation vision) to:
1. Identify sub-basins projected to submerge within 20–40 minutes before roads drown.
2. Formulate immediate emergency transit rerouting corridors (Ambulances, Fire, Transit buses).
3. Generate automated hydraulic actuator commands (pumping station boost, retention basin sluice gates).
4. Provide emergency variable message sign (VMS) broadcasts for commuters.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              systemAlertLevel: {
                type: Type.STRING,
                description: 'NORMAL, ELEVATED, HIGH_ALERT, or EVACUATION_ORDER',
              },
              subBasinsAtRiskCount: { type: Type.INTEGER },
              criticalChokePoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              earlyWarningWindowMinutes: {
                type: Type.NUMBER,
                description: 'Lead time before primary roads become impassable (20-40 min)',
              },
              reroutingPlans: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    corridor: { type: Type.STRING },
                    targetVehicles: { type: Type.STRING },
                    advisory: { type: Type.STRING },
                    status: { type: Type.STRING },
                  },
                  required: ['corridor', 'targetVehicles', 'advisory', 'status'],
                },
              },
              hydraulicMitigationActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              publicVmsSignage: { type: Type.STRING },
            },
            required: [
              'systemAlertLevel',
              'subBasinsAtRiskCount',
              'criticalChokePoints',
              'earlyWarningWindowMinutes',
              'reroutingPlans',
              'hydraulicMitigationActions',
              'publicVmsSignage',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        source: 'gemini-3.8-flash',
        ...parsed,
      });
    } catch (error: any) {
      console.error('Error in synthesize-dispatch:', error);
      res.status(500).json({
        error: error.message || 'Dispatch synthesis failed',
        fallback: true,
      });
    }
  });

  // Serve static assets in production, or mount Vite middlewares in dev
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HydroPulse Telemetry Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error in server.ts:', err);
  process.exit(1);
});
