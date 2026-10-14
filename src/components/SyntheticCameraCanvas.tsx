import React, { useRef, useEffect } from 'react';

interface SyntheticCameraCanvasProps {
  sceneType: 'UNDERPASS_RISING' | 'CULVERT_INTAKE' | 'HIGHWAY_CHOKE' | 'LOWLAND_POLDER' | 'VIADUCT_BASIN';
  waterDepthCm: number;
  rainIntensity: number; // 0 to 100
  showVisionOverlay?: boolean;
  onSnapshotReady?: (dataUrl: string) => void;
  className?: string;
}

export const SyntheticCameraCanvas: React.FC<SyntheticCameraCanvasProps> = ({
  sceneType,
  waterDepthCm,
  rainIntensity,
  showVisionOverlay = false,
  onSnapshotReady,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      // Clear background - moody rainy asphalt dusk
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0, 0, width, height);

      // Sky & Underpass structure
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      skyGradient.addColorStop(0, '#0f172a');
      skyGradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height * 0.45);

      if (sceneType === 'UNDERPASS_RISING' || sceneType === 'VIADUCT_BASIN') {
        // Massive concrete bridge / underpass ceiling
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height * 0.38);
        ctx.lineTo(0, height * 0.38);
        ctx.closePath();
        ctx.fill();

        // Concrete support pillars
        ctx.fillStyle = '#334155';
        ctx.fillRect(width * 0.1, height * 0.15, width * 0.08, height * 0.45);
        ctx.fillRect(width * 0.82, height * 0.15, width * 0.08, height * 0.45);

        // Clearance warning bar
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(width * 0.1, height * 0.35, width * 0.8, 12);
        ctx.fillStyle = '#0f172a';
        for (let i = width * 0.1; i < width * 0.9; i += 24) {
          ctx.beginPath();
          ctx.moveTo(i, height * 0.35);
          ctx.lineTo(i + 12, height * 0.35 + 12);
          ctx.lineTo(i + 6, height * 0.35 + 12);
          ctx.lineTo(i - 6, height * 0.35);
          ctx.fill();
        }

        // Distance tunnel opening
        ctx.fillStyle = '#090d16';
        ctx.fillRect(width * 0.22, height * 0.38, width * 0.56, height * 0.22);
      } else if (sceneType === 'CULVERT_INTAKE') {
        // Massive concrete embankment & storm culvert mouth
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height * 0.4);
        
        // Culvert arch tunnel mouth
        ctx.fillStyle = '#030712';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.48, width * 0.25, Math.PI, 0, false);
        ctx.fill();

        // Steel trash rack / grate bars
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        for (let x = width * 0.28; x <= width * 0.72; x += 18) {
          ctx.beginPath();
          ctx.moveTo(x, height * 0.28);
          ctx.lineTo(x, height * 0.58);
          ctx.stroke();
        }
      } else {
        // Highway / Polder horizon
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, height * 0.35, width, height * 0.15);
      }

      // Road asphalt surface
      const roadGradient = ctx.createLinearGradient(0, height * 0.45, 0, height);
      roadGradient.addColorStop(0, '#1e293b');
      roadGradient.addColorStop(0.5, '#0f172a');
      roadGradient.addColorStop(1, '#090d16');
      ctx.fillStyle = roadGradient;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);

      // Road Lane Markings
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.45);
      ctx.lineTo(width * 0.5, height);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(width * 0.25, height * 0.45);
      ctx.lineTo(width * 0.15, height);
      ctx.moveTo(width * 0.75, height * 0.45);
      ctx.lineTo(width * 0.85, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sidewalk Curbs
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, height * 0.5, width * 0.12, height * 0.5);
      ctx.fillRect(width * 0.88, height * 0.5, width * 0.12, height * 0.5);

      // Water Level Accumulation rendering
      // depth ranges 0 to 60cm
      const waterHeightFraction = Math.min(0.5, (waterDepthCm / 60) * 0.45);
      const waterY = height * (1 - waterHeightFraction);

      if (waterDepthCm > 2) {
        // Water surface body
        const waterGradient = ctx.createLinearGradient(0, waterY, 0, height);
        waterGradient.addColorStop(0, 'rgba(14, 116, 144, 0.7)');
        waterGradient.addColorStop(0.3, 'rgba(8, 47, 73, 0.85)');
        waterGradient.addColorStop(1, 'rgba(3, 105, 161, 0.95)');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, waterY, width, height - waterY);

        // Water surface ripples & reflection
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const waveY = waterY + (i * (height - waterY)) / 6 + Math.sin(tick * 0.05 + i) * 2;
          ctx.beginPath();
          ctx.moveTo(0, waveY);
          for (let x = 0; x <= width; x += 30) {
            ctx.lineTo(x, waveY + Math.sin(x * 0.02 + tick * 0.08 + i) * 3);
          }
          ctx.stroke();
        }

        // Swirling drain eddy / whirlpool if water is deep
        if (waterDepthCm > 18) {
          const vortexX = width * 0.18;
          const vortexY = height * 0.78;
          ctx.save();
          ctx.translate(vortexX, vortexY);
          ctx.rotate(tick * 0.1);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 4; a += 0.2) {
            const r = a * 4;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      // Vehicles in scene
      // Vehicle 1: Trapped / wading Sedan in Lane 1
      const carX = width * 0.32;
      const carY = height * 0.62;
      ctx.fillStyle = '#e11d48'; // Red sedan
      ctx.fillRect(carX, carY, width * 0.16, height * 0.1);
      ctx.fillStyle = '#0f172a'; // Windshield
      ctx.fillRect(carX + 8, carY + 4, width * 0.13, height * 0.04);
      // Wheels
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(carX + 16, carY + height * 0.1, 14, 0, Math.PI * 2);
      ctx.arc(carX + width * 0.16 - 16, carY + height * 0.1, 14, 0, Math.PI * 2);
      ctx.fill();
      // Wheel rims
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(carX + 16, carY + height * 0.1, 6, 0, Math.PI * 2);
      ctx.arc(carX + width * 0.16 - 16, carY + height * 0.1, 6, 0, Math.PI * 2);
      ctx.fill();

      // Headlight reflections in water
      ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.beginPath();
      ctx.arc(carX + 6, carY + height * 0.07, 6, 0, Math.PI * 2);
      ctx.fill();
      if (waterDepthCm > 3) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
        ctx.fillRect(carX - 20, waterY, 40, height - waterY);
      }

      // Vehicle 2: High-clearance Transit Bus in background or Ambulance
      const busX = width * 0.62;
      const busY = height * 0.5;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(busX, busY, width * 0.18, height * 0.14);
      // Windows
      ctx.fillStyle = '#bae6fd';
      for (let w = 0; w < 4; w++) {
        ctx.fillRect(busX + 8 + w * 18, busY + 8, 14, 16);
      }

      // Rain Streaks based on rainIntensity
      if (rainIntensity > 5) {
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.28)';
        ctx.lineWidth = 1;
        const dropCount = Math.round((rainIntensity / 100) * 80);
        for (let i = 0; i < dropCount; i++) {
          const rx = (Math.sin(i * 99 + tick * 0.2) * 0.5 + 0.5) * width;
          const ry = ((i * 17 + tick * 18) % height);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 6, ry + 16);
          ctx.stroke();
        }
      }

      // Computer Vision Overlay
      if (showVisionOverlay) {
        // Water accumulation detection polygon
        ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.fillRect(0, waterY, width, height - waterY);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(0, waterY, width, height - waterY);
        ctx.setLineDash([]);

        // Label: Surface Water Inundation Polygon
        ctx.fillStyle = 'rgba(8, 51, 68, 0.85)';
        ctx.fillRect(10, waterY + 4, 220, 24);
        ctx.fillStyle = '#22d3ee';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`AI MASK: WATER COVERAGE ${Math.round(waterDepthCm * 2.2)}%`, 16, waterY + 20);

        // Vehicle Tire Submersion Bounding Box
        ctx.strokeStyle = waterDepthCm > 20 ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(carX - 6, carY - 6, width * 0.16 + 12, height * 0.1 + 22);

        // Waterline Depth HUD tag
        ctx.fillStyle = waterDepthCm > 20 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)';
        ctx.fillRect(carX - 6, carY - 26, 175, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`TIRE SUBMERSION: ${waterDepthCm.toFixed(1)}cm`, carX - 2, carY - 14);

        // Curb crest indicator
        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.72);
        ctx.lineTo(width * 0.12, height * 0.72);
        ctx.stroke();
        ctx.fillStyle = 'rgba(236, 72, 153, 0.9)';
        ctx.fillRect(6, height * 0.72 - 18, 125, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('CURB CREST 15CM', 10, height * 0.72 - 6);
      }

      // OSD (On Screen Display) CCTV Timestamp & Telemetry stamp
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(12, 12, 280, 48);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.strokeRect(12, 12, 280, 48);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`MUNICIPAL CCTV // NODE: ${sceneType}`, 20, 28);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "JetBrains Mono", monospace';
      const now = new Date();
      ctx.fillText(`REC ${now.toISOString().slice(0, 19).replace('T', ' ')} UTC`, 20, 44);

      // Flashing REC indicator dot
      if (Math.floor(tick / 25) % 2 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(274, 25, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Export current frame when requested
    if (onSnapshotReady && canvas) {
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onSnapshotReady(dataUrl);
        } catch (e) {
          console.warn('Canvas export skipped:', e);
        }
      }, 500);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sceneType, waterDepthCm, rainIntensity, showVisionOverlay]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl ${className}`}>
      <canvas
        ref={canvasRef}
        width={640}
        height={360}
        className="w-full h-auto block aspect-video object-cover"
      />
      {/* Subtle scanline effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-12 w-full scanline-effect opacity-60" />
    </div>
  );
};
