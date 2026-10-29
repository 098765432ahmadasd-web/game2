import React, { useState, useEffect, useRef } from 'react';
import { Hypercar, AeroDynoSettings } from '../types/telemetry';
import { Wind, Gauge, Sliders, Zap, CheckCircle2, RotateCcw } from 'lucide-react';

interface AeroDynoLabProps {
  currentCar: Hypercar;
}

export const AeroDynoLab: React.FC<AeroDynoLabProps> = ({ currentCar }) => {
  const [settings, setSettings] = useState<AeroDynoSettings>({
    frontSplitterAngleDeg: 6,
    rearWingAngleDeg: 10,
    rideHeightFrontMm: 45,
    rideHeightRearMm: 55,
    brakeBiasFrontPercent: 56,
    ecuMode: 'BALANCED',
  });

  const [activeTab, setActiveTab] = useState<'windtunnel' | 'dyno'>('windtunnel');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Aerodynamic math calculations based on settings
  const baseDownforce = currentCar.downforceAt250KmhKg;
  const wingMultiplier = 1 + (settings.rearWingAngleDeg - 10) * 0.05 + (settings.frontSplitterAngleDeg - 6) * 0.04;
  const groundEffectMultiplier = 1 + (50 - settings.rideHeightFrontMm) * 0.008;

  const calculatedDownforce = Math.round(baseDownforce * wingMultiplier * groundEffectMultiplier);

  // Drag coefficient Cd
  const baseCd = currentCar.classification === 'HYPERCAR' ? 0.28 : 0.35;
  const calculatedCd = Number((baseCd + (settings.rearWingAngleDeg * 0.008) + (settings.frontSplitterAngleDeg * 0.004)).toFixed(3));

  // Top speed projection
  const ecuSpeedDelta = settings.ecuMode === 'QUALIFYING_OVERBOOST' ? 12 : settings.ecuMode === 'ENDURANCE' ? -8 : 0;
  const projectedTopSpeed = Math.round(currentCar.topSpeedKmh - (calculatedCd - baseCd) * 260 + ecuSpeedDelta);

  // Front Aero Balance %
  const calculatedAeroBalance = Math.min(52, Math.max(36, Math.round(42 + (settings.frontSplitterAngleDeg - settings.rearWingAngleDeg * 0.5) * 1.2)));

  // Cornering Lateral G projection
  const projectedLateralG = Number((currentCar.specs.lateralG * Math.sqrt(calculatedDownforce / baseDownforce)).toFixed(2));

  // Dyno Horsepower & Torque with ECU tuning
  const ecuHpMultiplier = settings.ecuMode === 'QUALIFYING_OVERBOOST' ? 1.08 : settings.ecuMode === 'ENDURANCE' ? 0.94 : 1.0;
  const dynoHp = Math.round(currentCar.powerHp * ecuHpMultiplier);
  const dynoTorque = Math.round(currentCar.torqueNm * ecuHpMultiplier);

  // Apply Presets
  const applyPreset = (preset: 'monza' | 'monaco' | 'spa') => {
    if (preset === 'monza') {
      setSettings({
        frontSplitterAngleDeg: 1,
        rearWingAngleDeg: 3,
        rideHeightFrontMm: 38,
        rideHeightRearMm: 45,
        brakeBiasFrontPercent: 54,
        ecuMode: 'QUALIFYING_OVERBOOST',
      });
    } else if (preset === 'monaco') {
      setSettings({
        frontSplitterAngleDeg: 12,
        rearWingAngleDeg: 18,
        rideHeightFrontMm: 50,
        rideHeightRearMm: 62,
        brakeBiasFrontPercent: 58,
        ecuMode: 'BALANCED',
      });
    } else {
      setSettings({
        frontSplitterAngleDeg: 6,
        rearWingAngleDeg: 10,
        rideHeightFrontMm: 44,
        rideHeightRearMm: 54,
        brakeBiasFrontPercent: 56,
        ecuMode: 'BALANCED',
      });
    }
  };

  // Canvas Wind Tunnel Streamline Simulation
  useEffect(() => {
    if (activeTab !== 'windtunnel') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 280);

    interface Particle {
      x: number;
      y: number;
      speed: number;
      length: number;
      lane: number;
    }

    const particles: Particle[] = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * width,
      y: 40 + Math.random() * (height - 80),
      speed: 4 + Math.random() * 6,
      length: 15 + Math.random() * 25,
      lane: Math.random(),
    }));

    const render = () => {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);

      // Draw faint wind tunnel grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw stylized hypercar profile silhouette
      const carX = width * 0.22;
      const carY = height * 0.68;
      const carW = width * 0.55;

      ctx.save();
      ctx.fillStyle = '#141419';
      ctx.strokeStyle = '#ff1a35';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      // Front splitter
      ctx.moveTo(carX, carY);
      // Low nose cone
      ctx.lineTo(carX + carW * 0.15, carY - 14);
      // Windshield canopy
      ctx.quadraticCurveTo(carX + carW * 0.32, carY - 60, carX + carW * 0.52, carY - 50);
      // Roof and engine deck
      ctx.lineTo(carX + carW * 0.75, carY - 32);
      // Rear Wing with dynamic angle
      const wingHeightOffset = settings.rearWingAngleDeg * 1.8;
      ctx.lineTo(carX + carW * 0.92, carY - 45 - wingHeightOffset);
      ctx.lineTo(carX + carW * 0.96, carY - 42 - wingHeightOffset);
      // Rear diffuser
      ctx.lineTo(carX + carW, carY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wheels
      ctx.fillStyle = '#0a0a0c';
      ctx.strokeStyle = '#8e8e99';
      ctx.beginPath();
      ctx.arc(carX + carW * 0.22, carY, 18, 0, Math.PI * 2);
      ctx.arc(carX + carW * 0.82, carY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Update and draw streamlines
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > width) {
          p.x = 0;
          p.y = 40 + Math.random() * (height - 80);
        }

        // Deflect airflow over vehicle body
        let streamY = p.y;
        if (p.x > carX && p.x < carX + carW) {
          const ratio = (p.x - carX) / carW;
          if (p.y > carY - 65) {
            // Push stream upward over cockpit
            streamY = p.y - Math.sin(ratio * Math.PI) * 45;
          }
        }

        // Color coding: cyan for laminar, turning reddish near wing wake
        const isWake = p.x > carX + carW * 0.85 && streamY > carY - 60;
        ctx.strokeStyle = isWake ? 'rgba(255, 26, 53, 0.7)' : 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = isWake ? 2 : 1.2;

        ctx.beginPath();
        ctx.moveTo(p.x, streamY);
        ctx.lineTo(p.x + p.length, streamY);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTab, settings, currentCar]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00f0ff] font-bold uppercase tracking-widest mb-1">
            <span>ENGINEERING WORKBENCH</span>
            <span>·</span>
            <span>AERODYNAMIC OPTIMIZATION</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase text-[#f5f5f7] tracking-tight">
            Aero &amp; Dyno Laboratory
          </h1>
          <p className="text-sm text-[#8e8e99] max-w-2xl mt-1">
            Adjust aerodynamic dive planes, wing incidence, ground-effect ride heights, and ECU mapping to simulate downforce, drag, and peak output.
          </p>
        </div>

        {/* Preset Quick Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8e8e99] hidden sm:inline">CIRCUIT PRESETS:</span>
          <button
            onClick={() => applyPreset('monza')}
            className="px-2.5 py-1.5 bg-[#141419] hover:bg-[#1f1f26] border border-white/[0.08] text-xs font-mono font-bold text-[#f5f5f7] transition-colors cursor-pointer"
          >
            MONZA (LOW DRAG)
          </button>
          <button
            onClick={() => applyPreset('spa')}
            className="px-2.5 py-1.5 bg-[#141419] hover:bg-[#1f1f26] border border-white/[0.08] text-xs font-mono font-bold text-[#f5f5f7] transition-colors cursor-pointer"
          >
            SPA (BALANCED)
          </button>
          <button
            onClick={() => applyPreset('monaco')}
            className="px-2.5 py-1.5 bg-[#141419] hover:bg-[#1f1f26] border border-white/[0.08] text-xs font-mono font-bold text-[#f5f5f7] transition-colors cursor-pointer"
          >
            MONACO (MAX DOWNFORCE)
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#141419] border border-white/[0.08] p-5 laser-border space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-xs font-mono font-bold text-[#8e8e99] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#ff1a35]" />
              CHASSIS CONFIGURATION
            </span>
            <span className="text-xs font-mono text-[#ff1a35] font-bold">
              {currentCar.name}
            </span>
          </div>

          {/* Slider 1: Rear Wing Angle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#f5f5f7] font-bold">REAR WING INCIDENCE</span>
              <span className="text-[#00f0ff] font-bold">{settings.rearWingAngleDeg}°</span>
            </div>
            <input
              type="range"
              min={2}
              max={18}
              step={1}
              value={settings.rearWingAngleDeg}
              onChange={(e) => setSettings({ ...settings, rearWingAngleDeg: Number(e.target.value) })}
              className="w-full accent-[#ff1a35] bg-[#0a0a0c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8e8e99]">
              <span>2° (Low Drag)</span>
              <span>10° (Default)</span>
              <span>18° (High Downforce)</span>
            </div>
          </div>

          {/* Slider 2: Front Splitter Angle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#f5f5f7] font-bold">FRONT SPLITTER FLAP</span>
              <span className="text-[#00f0ff] font-bold">{settings.frontSplitterAngleDeg}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={settings.frontSplitterAngleDeg}
              onChange={(e) => setSettings({ ...settings, frontSplitterAngleDeg: Number(e.target.value) })}
              className="w-full accent-[#ff1a35] bg-[#0a0a0c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8e8e99]">
              <span>0° (Neutral)</span>
              <span>6° (Balanced)</span>
              <span>12° (Max Front Grip)</span>
            </div>
          </div>

          {/* Sliders: Ride Heights */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8e8e99]">FRONT HEIGHT</span>
                <span className="text-[#f5f5f7] font-bold">{settings.rideHeightFrontMm} mm</span>
              </div>
              <input
                type="range"
                min={35}
                max={75}
                step={1}
                value={settings.rideHeightFrontMm}
                onChange={(e) => setSettings({ ...settings, rideHeightFrontMm: Number(e.target.value) })}
                className="w-full accent-[#ff1a35] bg-[#0a0a0c] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8e8e99]">REAR HEIGHT</span>
                <span className="text-[#f5f5f7] font-bold">{settings.rideHeightRearMm} mm</span>
              </div>
              <input
                type="range"
                min={40}
                max={85}
                step={1}
                value={settings.rideHeightRearMm}
                onChange={(e) => setSettings({ ...settings, rideHeightRearMm: Number(e.target.value) })}
                className="w-full accent-[#ff1a35] bg-[#0a0a0c] cursor-pointer"
              />
            </div>
          </div>

          {/* Brake Bias Front */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#f5f5f7] font-bold">HYDRAULIC BRAKE BIAS</span>
              <span className="text-[#00e676] font-bold">{settings.brakeBiasFrontPercent} : {100 - settings.brakeBiasFrontPercent} FRONT</span>
            </div>
            <input
              type="range"
              min={50}
              max={65}
              step={1}
              value={settings.brakeBiasFrontPercent}
              onChange={(e) => setSettings({ ...settings, brakeBiasFrontPercent: Number(e.target.value) })}
              className="w-full accent-[#00e676] bg-[#0a0a0c] cursor-pointer"
            />
          </div>

          {/* ECU Mapping Modes */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <span className="text-xs font-mono text-[#8e8e99] uppercase">ECU IGNITION &amp; BOOST MAP</span>
            <div className="grid grid-cols-3 gap-2">
              {(['ENDURANCE', 'BALANCED', 'QUALIFYING_OVERBOOST'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSettings({ ...settings, ecuMode: mode })}
                  className={`p-2 font-mono text-[11px] font-bold uppercase transition-all border cursor-pointer ${
                    settings.ecuMode === mode
                      ? 'bg-[#ff1a35] text-[#0a0a0c] border-[#ff1a35] shadow-[0_0_10px_rgba(255,26,53,0.3)]'
                      : 'bg-[#0a0a0c] text-[#8e8e99] border-white/[0.08] hover:text-[#f5f5f7]'
                  }`}
                >
                  {mode === 'QUALIFYING_OVERBOOST' ? 'OVERBOOST' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Workbench Results & Wind Tunnel / Dyno Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-Time Telemetry Calculated Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#141419] border border-white/[0.08] laser-border">
              <div className="text-[10px] font-mono text-[#8e8e99] uppercase">TOTAL DOWNFORCE</div>
              <div className="text-xl font-mono font-black text-[#00f0ff] mt-0.5">
                {calculatedDownforce} KG
              </div>
              <div className="text-[10px] font-mono text-[#8e8e99] mt-1">@ 250 KM/H</div>
            </div>

            <div className="p-3 bg-[#141419] border border-white/[0.08] laser-border">
              <div className="text-[10px] font-mono text-[#8e8e99] uppercase">DRAG COEFFICIENT</div>
              <div className="text-xl font-mono font-black text-[#ff1a35] mt-0.5">
                {calculatedCd} Cd
              </div>
              <div className="text-[10px] font-mono text-[#8e8e99] mt-1">L/D: {(calculatedDownforce / (calculatedCd * 1000)).toFixed(2)}:1</div>
            </div>

            <div className="p-3 bg-[#141419] border border-white/[0.08] laser-border">
              <div className="text-[10px] font-mono text-[#8e8e99] uppercase">EST. TOP SPEED</div>
              <div className="text-xl font-mono font-black text-[#f5f5f7] mt-0.5">
                {projectedTopSpeed} KM/H
              </div>
              <div className="text-[10px] font-mono text-[#8e8e99] mt-1">TERMINAL VELOCITY</div>
            </div>

            <div className="p-3 bg-[#141419] border border-white/[0.08] laser-border">
              <div className="text-[10px] font-mono text-[#8e8e99] uppercase">MAX CORNERING</div>
              <div className="text-xl font-mono font-black text-[#00e676] mt-0.5">
                {projectedLateralG} G
              </div>
              <div className="text-[10px] font-mono text-[#8e8e99] mt-1">LATERAL ADHESION</div>
            </div>
          </div>

          {/* Tab selector between Wind Tunnel & Engine Dyno */}
          <div className="bg-[#141419] border border-white/[0.08] p-5 laser-border space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('windtunnel')}
                  className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                    activeTab === 'windtunnel'
                      ? 'bg-[#00f0ff] text-[#0a0a0c]'
                      : 'text-[#8e8e99] hover:text-[#f5f5f7]'
                  }`}
                >
                  WIND TUNNEL FLOW
                </button>
                <button
                  onClick={() => setActiveTab('dyno')}
                  className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                    activeTab === 'dyno'
                      ? 'bg-[#ff1a35] text-[#0a0a0c]'
                      : 'text-[#8e8e99] hover:text-[#f5f5f7]'
                  }`}
                >
                  DYNO POWER CURVE
                </button>
              </div>

              <span className="text-xs font-mono text-[#8e8e99]">
                BALANCE: {calculatedAeroBalance}% FRONT / {100 - calculatedAeroBalance}% REAR
              </span>
            </div>

            {/* View 1: Wind Tunnel Streamline Simulation */}
            {activeTab === 'windtunnel' && (
              <div className="space-y-3">
                <div className="relative border border-white/[0.1] bg-[#0a0a0c] rounded-xs overflow-hidden">
                  <canvas ref={canvasRef} className="w-full h-[280px] block" />
                  <div className="absolute top-2 left-3 text-[10px] font-mono text-[#00f0ff] bg-[#0a0a0c]/80 px-2 py-0.5 border border-white/[0.1]">
                    STREAMLINE VELOCITY: 250 KM/H
                  </div>
                  <div className="absolute bottom-2 right-3 text-[10px] font-mono text-[#8e8e99] bg-[#0a0a0c]/80 px-2 py-0.5 border border-white/[0.1]">
                    LAMINAR: CYAN · TURBULENCE: RED
                  </div>
                </div>

                <div className="p-3 bg-[#0a0a0c] border border-white/[0.06] text-xs font-mono flex items-center justify-between">
                  <span className="text-[#8e8e99]">AERODYNAMIC STATUS:</span>
                  <span className={calculatedCd > 0.42 ? 'text-[#ff1a35] font-bold' : 'text-[#00e676] font-bold'}>
                    {calculatedCd > 0.42 ? 'HIGH DRAG AERO WAKE' : 'LAMINAR GROUND-EFFECT COMPLIANT'}
                  </span>
                </div>
              </div>
            )}

            {/* View 2: Dyno Power & Torque Curves */}
            {activeTab === 'dyno' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#0a0a0c] border border-white/[0.08] relative">
                  <div className="flex justify-between items-center text-xs font-mono mb-4">
                    <span className="text-[#ff1a35] font-bold">PEAK POWER: {dynoHp} HP</span>
                    <span className="text-[#00f0ff] font-bold">PEAK TORQUE: {dynoTorque} NM</span>
                  </div>

                  {/* Dyno Bar Graph simulation */}
                  <div className="h-56 flex items-end gap-2 pt-6 px-2 border-b border-l border-white/[0.1]">
                    {[2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000].map((rpm) => {
                      if (rpm > currentCar.specs.redlineRpm) return null;
                      const powerCurve = Math.min(1, Math.sin((rpm / currentCar.specs.redlineRpm) * (Math.PI * 0.75)));
                      const torqueCurve = Math.min(1, 0.4 + Math.sin((rpm / currentCar.specs.redlineRpm) * (Math.PI * 0.6)) * 0.6);

                      return (
                        <div key={rpm} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full flex items-end justify-center gap-1 h-44">
                            {/* Power Bar */}
                            <div
                              className="w-1/2 bg-[#ff1a35] rounded-t-xs transition-all duration-300"
                              style={{ height: `${powerCurve * 100}%` }}
                            />
                            {/* Torque Bar */}
                            <div
                              className="w-1/2 bg-[#00f0ff] rounded-t-xs transition-all duration-300"
                              style={{ height: `${torqueCurve * 90}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-[#8e8e99]">{rpm / 1000}k</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-[#8e8e99] mt-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#ff1a35] inline-block" /> HORSEPOWER (HP)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#00f0ff] inline-block" /> TORQUE (NM)
                    </span>
                    <span>RPM AXIS</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0a0a0c] border border-white/[0.06] text-xs font-mono flex items-center justify-between">
                  <span className="text-[#8e8e99]">ENGINE MAP MODE:</span>
                  <span className="text-[#ff1a35] font-bold">{settings.ecuMode} (+{(dynoHp - currentCar.powerHp)} HP DELTA)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
