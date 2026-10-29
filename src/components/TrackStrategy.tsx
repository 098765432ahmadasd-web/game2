import React, { useState } from 'react';
import { TrackCircuit } from '../types/telemetry';
import { TRACK_CIRCUITS } from '../data/circuits';
import { Flag, Timer, Zap, MapPin, Fuel, Clock, Gauge, ArrowRight } from 'lucide-react';

export const TrackStrategy: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<TrackCircuit>(TRACK_CIRCUITS[0]);
  const [selectedCompound, setSelectedCompound] = useState<'SOFT' | 'MEDIUM' | 'HARD' | 'WET'>('SOFT');
  const [fuelLoadKg, setFuelLoadKg] = useState<number>(45);
  const [targetLaps, setTargetLaps] = useState<number>(18);

  // Tire compound degradation physics
  const compoundSpecs = {
    SOFT: { name: 'Pirelli P-Zero Red (Soft)', gripBase: 1.0, degPerLap: 0.048, optimalLaps: 14, color: '#ff1a35' },
    MEDIUM: { name: 'Pirelli P-Zero Yellow (Medium)', gripBase: 0.94, degPerLap: 0.024, optimalLaps: 24, color: '#ffd600' },
    HARD: { name: 'Pirelli P-Zero White (Hard)', gripBase: 0.88, degPerLap: 0.012, optimalLaps: 36, color: '#f5f5f7' },
    WET: { name: 'Cinturato Blue (Full Wet)', gripBase: 0.82, degPerLap: 0.018, optimalLaps: 28, color: '#00f0ff' },
  };

  const currentCompound = compoundSpecs[selectedCompound];

  // Fuel penalty: 0.035s per lap per kg of fuel
  const fuelPenaltyPerLapS = Number((fuelLoadKg * 0.035).toFixed(3));
  // Tire degradation loss at target lap
  const tireLossS = Number((targetLaps * currentCompound.degPerLap * 0.85).toFixed(3));

  // Recommended Pitstop window
  const pitWindowStart = Math.max(1, currentCompound.optimalLaps - 3);
  const pitWindowEnd = currentCompound.optimalLaps + 2;

  return (
    <div className="space-y-8">
      {/* Track Strategy Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00e676] font-bold uppercase tracking-widest mb-1">
            <span>RACE ENGINEERING</span>
            <span>·</span>
            <span>DELTA ANALYSIS &amp; PIT STRATEGY</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase text-[#f5f5f7] tracking-tight">
            Track Delta &amp; Pit Strategy
          </h1>
          <p className="text-sm text-[#8e8e99] max-w-2xl mt-1">
            Analyze sector split deltas against session benchmarks, apex cornering telemetry, and optimize tire compound degradation curves for pit windows.
          </p>
        </div>

        {/* Circuit Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {TRACK_CIRCUITS.map((circuit) => (
            <button
              key={circuit.id}
              onClick={() => setSelectedCircuit(circuit)}
              className={`px-3 py-2 text-xs font-mono font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                selectedCircuit.id === circuit.id
                  ? 'bg-[#ff1a35] text-[#0a0a0c] border-[#ff1a35] shadow-[0_0_15px_rgba(255,26,53,0.3)]'
                  : 'bg-[#141419] text-[#8e8e99] border-white/[0.08] hover:text-[#f5f5f7]'
              }`}
            >
              <span>{circuit.flag}</span>
              <span>{circuit.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Circuit Overview Card */}
      <div className="bg-[#141419] border border-white/[0.08] p-6 laser-border chamfer-card-tr">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCircuit.flag}</span>
            <div>
              <h2 className="text-2xl font-black uppercase text-[#f5f5f7]">
                {selectedCircuit.name}
              </h2>
              <div className="text-xs text-[#8e8e99] font-mono">
                {selectedCircuit.country} · {selectedCircuit.lengthKm} KM · {selectedCircuit.turns} TURNS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="p-2 bg-[#0a0a0c] border border-white/[0.08]">
              <div className="text-[10px] text-[#8e8e99]">ALL-TIME RECORD</div>
              <div className="text-sm font-bold text-[#00f0ff]">{selectedCircuit.lapRecordTime}</div>
            </div>
            <div className="hidden sm:block text-[#8e8e99] text-xs">
              <div>BENCHMARK PILOT</div>
              <div className="text-[#f5f5f7] font-bold">{selectedCircuit.lapRecordHolder}</div>
            </div>
          </div>
        </div>

        {/* Sectors Delta Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {selectedCircuit.sectors.map((sec) => (
            <div
              key={sec.sector}
              className="p-4 bg-[#0a0a0c] border border-white/[0.08] relative laser-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#8e8e99]">
                  SECTOR {sec.sector}
                </span>
                <span
                  className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-xs ${
                    sec.status === 'purple'
                      ? 'bg-[#b388ff] text-[#0a0a0c]'
                      : sec.status === 'faster'
                      ? 'bg-[#00e676] text-[#0a0a0c]'
                      : 'bg-[#ff1a35] text-[#0a0a0c]'
                  }`}
                >
                  {sec.status === 'purple' ? 'FASTEST SESSION' : sec.status === 'faster' ? 'DELTA GREEN' : 'DELTA RED'}
                </span>
              </div>

              <div className="flex items-baseline justify-between font-mono my-2">
                <div className="text-2xl font-black text-[#f5f5f7]">
                  {sec.currentTimeS.toFixed(3)}s
                </div>
                <div
                  className={`text-sm font-bold ${
                    sec.deltaS <= 0 ? 'text-[#00e676]' : 'text-[#ff1a35]'
                  }`}
                >
                  {sec.deltaS <= 0 ? '-' : '+'}
                  {Math.abs(sec.deltaS).toFixed(3)}s
                </div>
              </div>

              <div className="flex justify-between text-[11px] font-mono text-[#8e8e99] border-t border-white/[0.06] pt-2">
                <span>TARGET REF:</span>
                <span>{sec.referenceTimeS.toFixed(3)}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Apex Telemetry & Pit Strategy Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Apex Speeds & Gear Selection (6 cols) */}
        <div className="lg:col-span-6 bg-[#141419] border border-white/[0.08] p-5 laser-border space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-xs font-mono font-bold text-[#8e8e99] uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#ff1a35]" />
              APEX CORNERING VELOCITY
            </span>
            <span className="text-xs font-mono text-[#00f0ff]">GPS TELEMETRY</span>
          </div>

          <div className="space-y-2">
            {selectedCircuit.apexSpeeds.map((turn, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-[#0a0a0c] border border-white/[0.06] hover:border-white/20 transition-colors font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#ff1a35] font-bold">0{i + 1}</span>
                  <span className="text-[#f5f5f7] font-bold">{turn.turn}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-2 py-0.5 bg-[#1f1f26] text-[#8e8e99] text-[10px] font-bold border border-white/[0.06]">
                    GEAR {turn.gear}
                  </span>
                  <span className="text-[#00e676] font-bold w-16 text-right">
                    {turn.speedKmh} KM/H
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs font-mono text-[#8e8e99] bg-[#0a0a0c] p-3 border border-white/[0.06]">
            {selectedCircuit.description}
          </p>
        </div>

        {/* Pit Strategy & Compound Simulator (6 cols) */}
        <div className="lg:col-span-6 bg-[#141419] border border-white/[0.08] p-5 laser-border space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-xs font-mono font-bold text-[#8e8e99] uppercase tracking-wider flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#00f0ff]" />
              TIRE COMPOUND &amp; FUEL STRATEGY
            </span>
            <span className="text-xs font-mono text-[#f5f5f7] font-bold">
              {currentCompound.name}
            </span>
          </div>

          {/* Tire Compound Selector */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#8e8e99] uppercase">SELECT COMPOUND ALLOCATION</span>
            <div className="grid grid-cols-4 gap-2">
              {(['SOFT', 'MEDIUM', 'HARD', 'WET'] as const).map((comp) => {
                const isSelected = selectedCompound === comp;
                return (
                  <button
                    key={comp}
                    onClick={() => setSelectedCompound(comp)}
                    className={`p-2.5 font-mono text-xs font-bold transition-all border cursor-pointer text-center ${
                      isSelected
                        ? 'border-white text-[#0a0a0c] shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                        : 'bg-[#0a0a0c] text-[#8e8e99] border-white/[0.08] hover:text-[#f5f5f7]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? compoundSpecs[comp].color : undefined,
                      color: isSelected && comp === 'MEDIUM' ? '#0a0a0c' : undefined,
                    }}
                  >
                    {comp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stint Length Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#f5f5f7] font-bold">STINT DURATION</span>
              <span className="text-[#00f0ff] font-bold">{targetLaps} LAPS</span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={targetLaps}
              onChange={(e) => setTargetLaps(Number(e.target.value))}
              className="w-full accent-[#00f0ff] bg-[#0a0a0c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8e8e99]">
              <span>5 Laps</span>
              <span>Optimal Window: {pitWindowStart}–{pitWindowEnd} Laps</span>
              <span>35 Laps</span>
            </div>
          </div>

          {/* Fuel Load Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#f5f5f7] font-bold">STARTING FUEL LOAD</span>
              <span className="text-[#ffd600] font-bold">{fuelLoadKg} KG</span>
            </div>
            <input
              type="range"
              min={15}
              max={110}
              step={5}
              value={fuelLoadKg}
              onChange={(e) => setFuelLoadKg(Number(e.target.value))}
              className="w-full accent-[#ffd600] bg-[#0a0a0c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8e8e99]">
              <span>15 kg (Qualifying Sprint)</span>
              <span>110 kg (Full Grand Prix Tank)</span>
            </div>
          </div>

          {/* Strategy Calculation Summary Card */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08] font-mono text-xs">
            <div className="p-3 bg-[#0a0a0c] border border-white/[0.08]">
              <div className="text-[10px] text-[#8e8e99]">FUEL WEIGHT PENALTY</div>
              <div className="text-base font-bold text-[#ff1a35] mt-0.5">
                +{fuelPenaltyPerLapS}s / LAP
              </div>
            </div>

            <div className="p-3 bg-[#0a0a0c] border border-white/[0.08]">
              <div className="text-[10px] text-[#8e8e99]">TIRE DEG AT LAP {targetLaps}</div>
              <div className="text-base font-bold text-[#ffd600] mt-0.5">
                +{tireLossS}s / LAP
              </div>
            </div>

            <div className="col-span-2 p-3 bg-[#0a0a0c] border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#8e8e99]">RECOMMENDED PIT WINDOW</div>
                <div className="text-sm font-bold text-[#00e676]">
                  LAPS {pitWindowStart} — {pitWindowEnd}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#8e8e99]">STINT DELTA LOSS</div>
                <div className="text-sm font-bold text-[#f5f5f7]">
                  +{(fuelPenaltyPerLapS + tireLossS).toFixed(3)}s Total
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
