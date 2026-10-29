import React, { useState, useEffect, useRef } from 'react';
import { Hypercar, LiveTelemetryState } from '../types/telemetry';
import { HYPERCARS } from '../data/cars';
import { audioEngine } from '../utils/audio';
import {
  Gauge,
  Zap,
  ShieldAlert,
  Play,
  Square,
  ChevronUp,
  ChevronDown,
  Activity,
  Layers,
  Thermometer,
  RotateCcw,
} from 'lucide-react';

interface CockpitDashboardProps {
  currentCar: Hypercar;
  onSelectCar: (car: Hypercar) => void;
  isEngineRunning: boolean;
  onIgnitionToggle: () => void;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({
  currentCar,
  onSelectCar,
  isEngineRunning,
  onIgnitionToggle,
}) => {
  // Speed units
  const [speedUnit, setSpeedUnit] = useState<'kmh' | 'mph'>('kmh');
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);

  // Live telemetry state
  const [telemetry, setTelemetry] = useState<LiveTelemetryState>({
    speedKmh: 0,
    rpm: 0,
    maxRpm: currentCar.specs.redlineRpm,
    gear: 0, // N
    throttlePercent: 0,
    brakePercent: 0,
    steeringAngle: 0,
    drsActive: false,
    drsAvailable: true,
    pitLimiterActive: false,
    ersPercent: 88,
    gForce: { lateral: 0.0, longitudinal: 0.0 },
    tirePressures: { fl: 27.4, fr: 27.6, rl: 26.8, rr: 27.0 },
    tireTemps: { fl: 92, fr: 94, rl: 88, rr: 90 },
    brakeTemps: { fl: 480, fr: 495, rl: 390, rr: 410 },
    lapTimeMs: 42150,
    deltaToBestMs: -342, // -0.342s green
    currentLap: 4,
    bestLapMs: 104250,
  });

  // Telemetry trace history for sparkline
  const [speedHistory, setSpeedHistory] = useState<number[]>([120, 145, 190, 240, 290, 310, 180, 130, 220, 280, 305, 320]);

  // Ref for animation loop
  const simStepRef = useRef<number>(0);
  const gearRatios = [0, 3.4, 2.3, 1.7, 1.35, 1.1, 0.92, 0.78]; // N, 1, 2, 3, 4, 5, 6, 7

  // Update maxRpm when currentCar changes
  useEffect(() => {
    setTelemetry((prev) => ({
      ...prev,
      maxRpm: currentCar.specs.redlineRpm,
    }));
  }, [currentCar]);

  // Simulation / Drive Loop
  useEffect(() => {
    if (!isEngineRunning) {
      setTelemetry((prev) => ({
        ...prev,
        speedKmh: 0,
        rpm: 0,
        throttlePercent: 0,
        brakePercent: 0,
        gForce: { lateral: 0, longitudinal: 0 },
      }));
      audioEngine.updateEngine(0, currentCar.specs.redlineRpm, 0);
      return;
    }

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        let newSpeed = prev.speedKmh;
        let newRpm = prev.rpm;
        let newGear = prev.gear;
        let newThrottle = prev.throttlePercent;
        let newBrake = prev.brakePercent;
        let newDrs = prev.drsActive;
        let latG = prev.gForce.lateral;
        let longG = prev.gForce.longitudinal;

        if (autoSimulate) {
          // Automated Hot Lap loop simulating a dynamic track sequence
          simStepRef.current = (simStepRef.current + 1) % 400;
          const s = simStepRef.current;

          // Lap sequence:
          // 0-100: Hard acceleration down main straight with DRS
          // 100-140: Heavy braking into Turn 1 chicane (5.0G braking, downshifts)
          // 140-200: Mid-corner lateral load (3.2G cornering)
          // 200-280: High-speed sweepers (Eau Rouge style)
          // 280-330: Heavy braking into hairpin
          // 330-400: Acceleration onto pit straight

          if (s >= 0 && s < 95) {
            // Straight line acceleration
            newThrottle = 100;
            newBrake = 0;
            newDrs = true;
            longG = 1.4;
            latG = (Math.sin(s * 0.1) * 0.15);
            newSpeed = Math.min(currentCar.topSpeedKmh, 180 + s * 1.8);
            if (newSpeed < 100) newGear = 2;
            else if (newSpeed < 160) newGear = 3;
            else if (newSpeed < 220) newGear = 4;
            else if (newSpeed < 275) newGear = 5;
            else if (newSpeed < 320) newGear = 6;
            else newGear = 7;
            newRpm = 6500 + ((newSpeed % 60) / 60) * (currentCar.specs.redlineRpm - 6500);
          } else if (s >= 95 && s < 135) {
            // Braking Zone
            newThrottle = 0;
            newBrake = 92;
            newDrs = false;
            longG = -3.2;
            latG = 0.4;
            const progress = (s - 95) / 40;
            newSpeed = Math.max(75, 330 - progress * 240);
            newGear = newSpeed < 100 ? 2 : 3;
            newRpm = 4500 + ((newSpeed % 50) / 50) * 3500;
          } else if (s >= 135 && s < 210) {
            // Cornering apex
            newThrottle = 65;
            newBrake = 0;
            newDrs = false;
            latG = -2.8 + Math.sin((s - 135) * 0.08) * 0.6;
            longG = 0.3;
            newGear = 3;
            newSpeed = 110 + (s - 135) * 1.1;
            newRpm = 6200 + (newSpeed - 110) * 35;
          } else if (s >= 210 && s < 300) {
            // High speed uphill sweepers
            newThrottle = 95;
            newBrake = 0;
            newDrs = false;
            latG = 2.4 * Math.cos((s - 210) * 0.06);
            longG = 0.9;
            newGear = 5;
            newSpeed = 195 + (s - 210) * 1.1;
            newRpm = 7200 + ((newSpeed % 40) / 40) * 2200;
          } else {
            // Hairpin deceleration and exit
            newThrottle = 30 + (s - 300);
            newBrake = s < 330 ? 60 : 0;
            newDrs = false;
            latG = -1.5;
            longG = s < 330 ? -1.8 : 0.8;
            newGear = s < 330 ? 2 : 4;
            newSpeed = s < 330 ? Math.max(82, 195 - (s - 300) * 4) : 85 + (s - 330) * 2.2;
            newRpm = 5000 + ((newSpeed % 50) / 50) * 4000;
          }

          if (prev.pitLimiterActive) {
            newSpeed = Math.min(newSpeed, 80);
            newGear = 2;
            newRpm = 4200;
            newDrs = false;
          }
        } else {
          // Manual mode: respond to pedals
          if (prev.throttlePercent > 0) {
            newSpeed = Math.min(currentCar.topSpeedKmh, prev.speedKmh + (prev.throttlePercent / 100) * 2.5);
            newRpm = Math.min(currentCar.specs.redlineRpm, 1500 + (newSpeed / (prev.gear || 1)) * 32);
          } else if (prev.brakePercent > 0) {
            newSpeed = Math.max(0, prev.speedKmh - (prev.brakePercent / 100) * 4.2);
            newRpm = Math.max(1000, prev.rpm - 150);
          } else {
            // Coasting
            newSpeed = Math.max(0, prev.speedKmh - 0.4);
            newRpm = Math.max(1000, prev.rpm - 40);
          }
        }

        // Check if rev limiter reached
        if (newRpm >= currentCar.specs.redlineRpm - 200) {
          audioEngine.playRevLimiterBeep();
        }

        // Feed synthesizer
        audioEngine.updateEngine(newRpm, currentCar.specs.redlineRpm, newThrottle);

        // Dynamic tire temps and brake heating
        const flBrake = Math.min(850, Math.max(220, prev.brakeTemps.fl + (newBrake > 20 ? newBrake * 0.45 : -1.8)));
        const frBrake = Math.min(850, Math.max(220, prev.brakeTemps.fr + (newBrake > 20 ? newBrake * 0.48 : -1.8)));

        // Update lap timing
        const newLapTime = prev.lapTimeMs + 50;
        const newDelta = -342 + Math.round(Math.sin(newLapTime / 5000) * 280);

        return {
          ...prev,
          speedKmh: Math.round(newSpeed),
          rpm: Math.round(newRpm),
          gear: newGear,
          throttlePercent: Math.round(newThrottle),
          brakePercent: Math.round(newBrake),
          drsActive: newDrs,
          gForce: {
            lateral: Number(latG.toFixed(2)),
            longitudinal: Number(longG.toFixed(2)),
          },
          brakeTemps: {
            fl: Math.round(flBrake),
            fr: Math.round(frBrake),
            rl: Math.round(prev.brakeTemps.rl + (newBrake > 20 ? newBrake * 0.25 : -1.5)),
            rr: Math.round(prev.brakeTemps.rr + (newBrake > 20 ? newBrake * 0.25 : -1.5)),
          },
          lapTimeMs: newLapTime,
          deltaToBestMs: newDelta,
        };
      });
    }, 50);

    // Update speed history array every 400ms
    const traceInterval = setInterval(() => {
      setSpeedHistory((prev) => [...prev.slice(1), telemetry.speedKmh]);
    }, 400);

    return () => {
      clearInterval(interval);
      clearInterval(traceInterval);
    };
  }, [isEngineRunning, autoSimulate, currentCar, telemetry.speedKmh]);

  // Shift controls
  const handleShiftUp = () => {
    if (telemetry.gear < 7) {
      audioEngine.playShiftPop();
      setTelemetry((prev) => ({
        ...prev,
        gear: prev.gear + 1,
        rpm: Math.max(3000, prev.rpm - 1800),
      }));
    }
  };

  const handleShiftDown = () => {
    if (telemetry.gear > 1) {
      audioEngine.playShiftPop();
      setTelemetry((prev) => ({
        ...prev,
        gear: prev.gear - 1,
        rpm: Math.min(currentCar.specs.redlineRpm, prev.rpm + 2100),
      }));
    } else if (telemetry.gear === 1) {
      setTelemetry((prev) => ({ ...prev, gear: 0 }));
    }
  };

  const handleDrsToggle = () => {
    setTelemetry((prev) => ({ ...prev, drsActive: !prev.drsActive }));
  };

  const handlePitLimiterToggle = () => {
    setTelemetry((prev) => ({ ...prev, pitLimiterActive: !prev.pitLimiterActive }));
  };

  // Convert speed
  const displayedSpeed = speedUnit === 'kmh' ? telemetry.speedKmh : Math.round(telemetry.speedKmh * 0.621371);

  // Rev limiter LEDs calculation (16 segments total: 6 Green, 5 Yellow, 5 Red/Flash)
  const rpmRatio = telemetry.rpm / currentCar.specs.redlineRpm;
  const activeLeds = Math.min(16, Math.floor(rpmRatio * 16));
  const isRevBlinking = rpmRatio >= 0.96;

  // Format millisecond lap time: mm:ss.sss
  const formatLapTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    return `${mins}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Cockpit Header & Car Selector Strip */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-[#141419] border border-white/[0.08] chamfer-card-tr">
        <div className="flex items-center gap-4">
          <div className="w-3 h-10 bg-[#ff1a35] shrink-0" />
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-[#8e8e99] font-mono">
                TELEMETRY DASHBOARD // LIVE INSTRUMENTATION
              </span>
              <span className="text-xs px-2 py-0.5 bg-[#0a0a0c] font-mono font-bold text-[#ff1a35] border-l-2 border-[#ff1a35]">
                {currentCar.classification}
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black uppercase text-[#f5f5f7] tracking-tight">
              {currentCar.name}
            </h1>
          </div>
        </div>

        {/* Vehicle Switcher & Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#0a0a0c] p-1 border border-white/[0.08] rounded">
            <label htmlFor="vehicle-select" className="text-xs font-mono text-[#8e8e99] px-2">CHASSIS:</label>
            <select
              id="vehicle-select"
              value={currentCar.id}
              onChange={(e) => {
                const found = HYPERCARS.find((c) => c.id === e.target.value);
                if (found) onSelectCar(found);
              }}
              className="bg-transparent text-xs font-mono text-[#f5f5f7] font-bold focus:outline-none cursor-pointer pr-2"
            >
              {HYPERCARS.map((car) => (
                <option key={car.id} value={car.id} className="bg-[#141419] text-[#f5f5f7]">
                  {car.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center bg-[#0a0a0c] p-1 border border-white/[0.08] rounded font-mono text-xs">
            <button
              onClick={() => setSpeedUnit('kmh')}
              className={`px-2 py-1 rounded transition-colors ${
                speedUnit === 'kmh' ? 'bg-[#ff1a35] text-[#0a0a0c] font-bold' : 'text-[#8e8e99] hover:text-[#f5f5f7]'
              }`}
            >
              KM/H
            </button>
            <button
              onClick={() => setSpeedUnit('mph')}
              className={`px-2 py-1 rounded transition-colors ${
                speedUnit === 'mph' ? 'bg-[#ff1a35] text-[#0a0a0c] font-bold' : 'text-[#8e8e99] hover:text-[#f5f5f7]'
              }`}
            >
              MPH
            </button>
          </div>

          {/* Sim Mode Toggle */}
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase transition-all rounded flex items-center gap-1.5 border ${
              autoSimulate
                ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'bg-[#1f1f26] text-[#8e8e99] border-white/10 hover:text-[#f5f5f7]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{autoSimulate ? 'Sim Auto-Lap: ON' : 'Manual Pedals'}</span>
          </button>
        </div>
      </div>

      {/* Cockpit HUD Main Cluster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: G-Force HUD & Pedals (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* G-Force Telemetry Reticle */}
          <div className="p-4 bg-[#141419] border border-white/[0.08] relative laser-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#8e8e99] uppercase tracking-wider">
                G-FORCE VECTOR
              </span>
              <span className="text-xs font-mono text-[#00f0ff] font-bold">
                {Math.hypot(telemetry.gForce.lateral, telemetry.gForce.longitudinal).toFixed(2)} G
              </span>
            </div>

            {/* Circular G-Force Reticle */}
            <div className="relative w-full aspect-square max-w-[200px] mx-auto border border-white/[0.1] rounded-full flex items-center justify-center bg-[#0a0a0c]">
              {/* Concentric rings: 1G, 2G, 3G */}
              <div className="absolute inset-4 border border-dashed border-white/[0.08] rounded-full" />
              <div className="absolute inset-10 border border-white/[0.06] rounded-full" />
              {/* Crosshairs */}
              <div className="absolute w-full h-[1px] bg-white/[0.1]" />
              <div className="absolute h-full w-[1px] bg-white/[0.1]" />

              {/* Dynamic G Point */}
              <div
                className="absolute w-4 h-4 bg-[#ff1a35] rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_#ff1a35] transition-all duration-75"
                style={{
                  left: `${50 + (telemetry.gForce.lateral / 4.0) * 45}%`,
                  top: `${50 - (telemetry.gForce.longitudinal / 4.0) * 45}%`,
                }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-center font-mono">
              <div className="bg-[#0a0a0c] p-2 border border-white/[0.05]">
                <div className="text-[10px] text-[#8e8e99]">LATERAL</div>
                <div className="text-sm font-bold text-[#f5f5f7]">
                  {telemetry.gForce.lateral > 0 ? `+${telemetry.gForce.lateral}` : telemetry.gForce.lateral} G
                </div>
              </div>
              <div className="bg-[#0a0a0c] p-2 border border-white/[0.05]">
                <div className="text-[10px] text-[#8e8e99]">LONGITUDINAL</div>
                <div className="text-sm font-bold text-[#f5f5f7]">
                  {telemetry.gForce.longitudinal > 0 ? `+${telemetry.gForce.longitudinal}` : telemetry.gForce.longitudinal} G
                </div>
              </div>
            </div>
          </div>

          {/* Throttle & Brake Live Input Bars */}
          <div className="p-4 bg-[#141419] border border-white/[0.08] laser-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#8e8e99] uppercase tracking-wider">
                PEDAL TELEMETRY
              </span>
              <span className="text-[11px] font-mono text-[#8e8e99]">INPUT TRACE</span>
            </div>

            {/* Throttle Gauge */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#00e676] font-bold">THROTTLE</span>
                <span className="text-[#f5f5f7] font-bold">{telemetry.throttlePercent}%</span>
              </div>
              <div className="h-3 bg-[#0a0a0c] border border-white/[0.08] p-0.5 rounded-xs">
                <div
                  className="h-full bg-gradient-to-r from-[#00e676]/60 to-[#00e676] transition-all duration-75 rounded-xs shadow-[0_0_10px_rgba(0,230,118,0.4)]"
                  style={{ width: `${telemetry.throttlePercent}%` }}
                />
              </div>
            </div>

            {/* Brake Gauge */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#ff1a35] font-bold">BRAKE PRESSURE</span>
                <span className="text-[#f5f5f7] font-bold">{telemetry.brakePercent}%</span>
              </div>
              <div className="h-3 bg-[#0a0a0c] border border-white/[0.08] p-0.5 rounded-xs">
                <div
                  className="h-full bg-gradient-to-r from-[#ff1a35]/60 to-[#ff1a35] transition-all duration-75 rounded-xs shadow-[0_0_10px_rgba(255,26,53,0.5)]"
                  style={{ width: `${telemetry.brakePercent}%` }}
                />
              </div>
            </div>

            {/* ERS Hybrid Battery */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-[#00f0ff] font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> ERS DEPLOYMENT
                </span>
                <span className="text-[#f5f5f7] font-bold">{telemetry.ersPercent}%</span>
              </div>
              <div className="h-2 bg-[#0a0a0c] border border-white/[0.08] p-0.5 rounded-xs">
                <div
                  className="h-full bg-[#00f0ff] transition-all duration-300 rounded-xs"
                  style={{ width: `${telemetry.ersPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Big Cockpit Instrument Cluster (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 bg-[#141419] border border-white/[0.08] laser-border relative overflow-hidden chamfer-card-tr">
            {/* Background tachometer radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[#ff1a35]/10 blur-3xl pointer-events-none" />

            {/* Rev-Limiter Progress Bar LED Segment Array */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono text-[#8e8e99] flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#ff1a35] inline-block" />
                  <span>REV LIMITER INDUCTION</span>
                </div>
                <div className={`font-mono text-xs font-bold ${isRevBlinking ? 'text-[#ff1a35] animate-rev-flash' : 'text-[#8e8e99]'}`}>
                  {telemetry.rpm.toLocaleString()} / {currentCar.specs.redlineRpm.toLocaleString()} RPM
                </div>
              </div>

              {/* 16-Segment Shift Light Bar */}
              <div className="grid grid-cols-16 gap-1 p-1.5 bg-[#0a0a0c] border border-white/[0.1] rounded-xs">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const isActive = idx < activeLeds;
                  let colorClass = 'bg-[#1f1f26] border-white/5';

                  if (isActive) {
                    if (idx < 6) {
                      colorClass = 'bg-[#00e676] shadow-[0_0_8px_#00e676]';
                    } else if (idx < 11) {
                      colorClass = 'bg-[#ffd600] shadow-[0_0_8px_#ffd600]';
                    } else {
                      colorClass = isRevBlinking
                        ? 'bg-[#ff1a35] animate-rev-flash shadow-[0_0_12px_#ff1a35]'
                        : 'bg-[#ff1a35] shadow-[0_0_8px_#ff1a35]';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className={`h-5 rounded-xs transition-all duration-75 border ${colorClass}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Main Instrument Cluster: Huge Gear & Speed Readout */}
            <div className="grid grid-cols-12 gap-4 items-center my-4 py-4 border-y border-white/[0.08]">
              {/* Gear Box */}
              <div className="col-span-4 flex flex-col items-center justify-center p-4 bg-[#0a0a0c] border border-white/[0.08] relative">
                <span className="text-[10px] font-mono text-[#8e8e99] tracking-widest uppercase mb-1">
                  CURRENT GEAR
                </span>
                <span className="text-7xl lg:text-8xl font-mono font-black text-[#f5f5f7] leading-none">
                  {telemetry.gear === 0 ? 'N' : telemetry.gear === -1 ? 'R' : telemetry.gear}
                </span>
                <span className="text-[10px] font-mono text-[#ff1a35] mt-1 font-bold">
                  {telemetry.gear === 0 ? 'NEUTRAL' : 'SEQUENTIAL'}
                </span>
              </div>

              {/* Speedometer & RPM */}
              <div className="col-span-8 flex flex-col justify-center px-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl lg:text-7xl font-mono font-black text-[#f5f5f7] tracking-tight leading-none tabular-nums">
                    {displayedSpeed}
                  </span>
                  <span className="text-xl font-mono font-bold text-[#ff1a35] uppercase">
                    {speedUnit}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between font-mono text-xs border-t border-white/[0.06] pt-2">
                  <span className="text-[#8e8e99]">PEAK VELOCITY</span>
                  <span className="text-[#f5f5f7] font-bold">
                    {speedUnit === 'kmh' ? `${currentCar.topSpeedKmh} KM/H` : `${Math.round(currentCar.topSpeedKmh * 0.621371)} MPH`}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between font-mono text-xs">
                  <span className="text-[#8e8e99]">0-100 KM/H</span>
                  <span className="text-[#00f0ff] font-bold">{currentCar.zeroToHundredS}s</span>
                </div>
              </div>
            </div>

            {/* Delta Timers & DRS Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {/* Delta Readout */}
              <div className="p-3 bg-[#0a0a0c] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-[#8e8e99] uppercase">LAP DELTA</div>
                <div
                  className={`text-base font-mono font-black ${
                    telemetry.deltaToBestMs <= 0
                      ? 'text-[#00e676] shadow-[0_0_10px_rgba(0,230,118,0.2)]'
                      : 'text-[#ff1a35]'
                  }`}
                >
                  {telemetry.deltaToBestMs <= 0 ? '-' : '+'}
                  {Math.abs(telemetry.deltaToBestMs / 1000).toFixed(3)}s
                </div>
              </div>

              {/* Current Lap Time */}
              <div className="p-3 bg-[#0a0a0c] border border-white/[0.08]">
                <div className="text-[10px] font-mono text-[#8e8e99] uppercase">LAP TIME</div>
                <div className="text-base font-mono font-bold text-[#f5f5f7] tabular-nums">
                  {formatLapTime(telemetry.lapTimeMs)}
                </div>
              </div>

              {/* DRS Indicator */}
              <div
                className={`p-3 border font-mono transition-colors ${
                  telemetry.drsActive
                    ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff]'
                    : 'bg-[#0a0a0c] border-white/[0.08] text-[#8e8e99]'
                }`}
              >
                <div className="text-[10px] uppercase">DRS WING</div>
                <div className="text-sm font-black uppercase">
                  {telemetry.drsActive ? 'OPEN [ACTIVE]' : 'CLOSED'}
                </div>
              </div>

              {/* Pit Limiter */}
              <div
                className={`p-3 border font-mono transition-colors ${
                  telemetry.pitLimiterActive
                    ? 'bg-[#ffd600]/10 border-[#ffd600] text-[#ffd600]'
                    : 'bg-[#0a0a0c] border-white/[0.08] text-[#8e8e99]'
                }`}
              >
                <div className="text-[10px] uppercase">PIT LIMITER</div>
                <div className="text-sm font-black uppercase">
                  {telemetry.pitLimiterActive ? 'ENGAGED 80K' : 'OFF'}
                </div>
              </div>
            </div>

            {/* Sparkline speed history */}
            <div className="mt-5 pt-3 border-t border-white/[0.06]">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#8e8e99] mb-1">
                <span>VELOCITY PROFILE (LAST 5 SECONDS)</span>
                <span className="text-[#00f0ff]">LIVE RUN</span>
              </div>
              <div className="h-8 flex items-end gap-1.5 bg-[#0a0a0c] p-1 border border-white/[0.05]">
                {speedHistory.map((s, i) => {
                  const hPercent = Math.min(100, Math.max(10, (s / currentCar.topSpeedKmh) * 100));
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#ff1a35]/40 to-[#ff1a35] rounded-xs transition-all duration-300"
                      style={{ height: `${hPercent}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Cockpit Controls Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleShiftDown}
              disabled={!isEngineRunning || autoSimulate}
              className="p-3 bg-[#141419] hover:bg-[#1f1f26] border border-white/[0.08] active:border-[#ff1a35] disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs font-bold text-[#f5f5f7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 text-[#ff1a35]" />
              <span>DOWN PADDLE</span>
            </button>

            <button
              onClick={handleShiftUp}
              disabled={!isEngineRunning || autoSimulate}
              className="p-3 bg-[#141419] hover:bg-[#1f1f26] border border-white/[0.08] active:border-[#ff1a35] disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs font-bold text-[#f5f5f7] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronUp className="w-4 h-4 text-[#00e676]" />
              <span>UP PADDLE</span>
            </button>

            <button
              onClick={handleDrsToggle}
              className={`p-3 border font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                telemetry.drsActive
                  ? 'bg-[#00f0ff] text-[#0a0a0c] border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-[#141419] text-[#8e8e99] hover:text-[#f5f5f7] border-white/[0.08]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>DRS TOGGLE</span>
            </button>

            <button
              onClick={handlePitLimiterToggle}
              className={`p-3 border font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                telemetry.pitLimiterActive
                  ? 'bg-[#ffd600] text-[#0a0a0c] border-[#ffd600]'
                  : 'bg-[#141419] text-[#8e8e99] hover:text-[#f5f5f7] border-white/[0.08]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>PIT 80 KM/H</span>
            </button>
          </div>
        </div>

        {/* Right Column: 4-Corner Chassis Telemetry & Tire Heatmap (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          <div className="p-4 bg-[#141419] border border-white/[0.08] laser-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#8e8e99] uppercase tracking-wider">
                CHASSIS &amp; TIRES
              </span>
              <span className="text-[11px] font-mono text-[#00f0ff]">4-CORNER SENSORS</span>
            </div>

            {/* Car Chassis Diagram with 4 Corners */}
            <div className="relative w-full max-w-[220px] mx-auto py-2">
              {/* Chassis Silhouette Box */}
              <div className="w-24 h-44 mx-auto border-2 border-white/[0.15] bg-[#0a0a0c] rounded-md flex flex-col items-center justify-between py-3 relative">
                <div className="w-8 h-2 bg-[#ff1a35]/40 rounded-xs" />
                <div className="text-[9px] font-mono text-[#8e8e99] text-center">
                  <div>MONOCOQUE</div>
                  <div className="text-[#00f0ff] font-bold">AERO 44:56</div>
                </div>
                <div className="w-12 h-3 bg-white/[0.1] rounded-xs" />
              </div>

              {/* Front Left Tire */}
              <div className="absolute top-4 left-0 w-16 p-1.5 bg-[#0a0a0c] border border-white/[0.1] text-center font-mono">
                <div className="text-[9px] text-[#8e8e99]">FL</div>
                <div className="text-xs font-bold text-[#00e676]">{telemetry.tireTemps.fl}°C</div>
                <div className="text-[10px] text-[#8e8e99]">{telemetry.tirePressures.fl} PSI</div>
              </div>

              {/* Front Right Tire */}
              <div className="absolute top-4 right-0 w-16 p-1.5 bg-[#0a0a0c] border border-white/[0.1] text-center font-mono">
                <div className="text-[9px] text-[#8e8e99]">FR</div>
                <div className="text-xs font-bold text-[#00e676]">{telemetry.tireTemps.fr}°C</div>
                <div className="text-[10px] text-[#8e8e99]">{telemetry.tirePressures.fr} PSI</div>
              </div>

              {/* Rear Left Tire */}
              <div className="absolute bottom-4 left-0 w-16 p-1.5 bg-[#0a0a0c] border border-white/[0.1] text-center font-mono">
                <div className="text-[9px] text-[#8e8e99]">RL</div>
                <div className="text-xs font-bold text-[#00e676]">{telemetry.tireTemps.rl}°C</div>
                <div className="text-[10px] text-[#8e8e99]">{telemetry.tirePressures.rl} PSI</div>
              </div>

              {/* Rear Right Tire */}
              <div className="absolute bottom-4 right-0 w-16 p-1.5 bg-[#0a0a0c] border border-white/[0.1] text-center font-mono">
                <div className="text-[9px] text-[#8e8e99]">RR</div>
                <div className="text-xs font-bold text-[#00e676]">{telemetry.tireTemps.rr}°C</div>
                <div className="text-[10px] text-[#8e8e99]">{telemetry.tirePressures.rr} PSI</div>
              </div>
            </div>

            {/* Brake Rotor Disc Temperatures */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
              <div className="text-[11px] font-mono text-[#8e8e99] flex items-center justify-between">
                <span>CARBON CERAMIC ROTORS</span>
                <span className="text-[#ff1a35] font-bold">BRAKE TEMP</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-[#0a0a0c] border border-white/[0.05] flex justify-between">
                  <span className="text-[#8e8e99]">FL ROTOR</span>
                  <span className={telemetry.brakeTemps.fl > 600 ? 'text-[#ff1a35] font-bold' : 'text-[#f5f5f7]'}>
                    {telemetry.brakeTemps.fl}°C
                  </span>
                </div>
                <div className="p-2 bg-[#0a0a0c] border border-white/[0.05] flex justify-between">
                  <span className="text-[#8e8e99]">FR ROTOR</span>
                  <span className={telemetry.brakeTemps.fr > 600 ? 'text-[#ff1a35] font-bold' : 'text-[#f5f5f7]'}>
                    {telemetry.brakeTemps.fr}°C
                  </span>
                </div>
                <div className="p-2 bg-[#0a0a0c] border border-white/[0.05] flex justify-between">
                  <span className="text-[#8e8e99]">RL ROTOR</span>
                  <span className="text-[#f5f5f7]">{telemetry.brakeTemps.rl}°C</span>
                </div>
                <div className="p-2 bg-[#0a0a0c] border border-white/[0.05] flex justify-between">
                  <span className="text-[#8e8e99]">RR ROTOR</span>
                  <span className="text-[#f5f5f7]">{telemetry.brakeTemps.rr}°C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Vehicle Specs Callout */}
          <div className="p-4 bg-[#141419] border border-white/[0.08] laser-border text-xs font-mono space-y-2">
            <div className="text-[#8e8e99] text-[10px] tracking-wider uppercase">POWERTRAIN BENCHMARK</div>
            <div className="flex justify-between py-1 border-b border-white/[0.05]">
              <span className="text-[#8e8e99]">OUTPUT</span>
              <span className="text-[#f5f5f7] font-bold">{currentCar.powerHp} HP</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.05]">
              <span className="text-[#8e8e99]">TORQUE</span>
              <span className="text-[#f5f5f7] font-bold">{currentCar.torqueNm} NM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/[0.05]">
              <span className="text-[#8e8e99]">DOWNFORCE @ 250</span>
              <span className="text-[#00f0ff] font-bold">{currentCar.downforceAt250KmhKg} KG</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8e8e99]">DRY WEIGHT</span>
              <span className="text-[#f5f5f7] font-bold">{currentCar.weightKg} KG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
