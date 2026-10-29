import React, { useState } from 'react';
import { Hypercar, CarClassification } from '../types/telemetry';
import { HYPERCARS } from '../data/cars';
import { ChevronRight, Sliders, ExternalLink, ShieldCheck, Flame, Compass } from 'lucide-react';

interface HypercarGarageProps {
  currentCar: Hypercar;
  onSelectCar: (car: Hypercar) => void;
  onLaunchToCockpit: (car: Hypercar) => void;
}

export const HypercarGarage: React.FC<HypercarGarageProps> = ({
  currentCar,
  onSelectCar,
  onLaunchToCockpit,
}) => {
  const [filterClass, setFilterClass] = useState<CarClassification | 'ALL'>('ALL');
  const [inspectCar, setInspectCar] = useState<Hypercar | null>(null);

  const filteredCars = filterClass === 'ALL'
    ? HYPERCARS
    : HYPERCARS.filter((c) => c.classification === filterClass);

  // Render 10-tick segmented performance bar
  const renderSegmentedBar = (score: number, label: string) => {
    const activeSegments = Math.round((score / 100) * 10);

    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-[#8e8e99]">{label}</span>
          <span className="text-[#f5f5f7] font-bold">{score}/100</span>
        </div>
        <div className="grid grid-cols-10 gap-1 h-2 bg-[#0a0a0c] p-0.5 border border-white/[0.06] rounded-xs">
          {Array.from({ length: 10 }).map((_, i) => {
            const isFilled = i < activeSegments;
            return (
              <div
                key={i}
                className={`h-full rounded-xs transition-colors ${
                  isFilled
                    ? i >= 7
                      ? 'bg-[#ff1a35] shadow-[0_0_6px_#ff1a35]'
                      : 'bg-[#f5f5f7]'
                    : 'bg-[#1f1f26]'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Garage Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff1a35] font-bold uppercase tracking-widest mb-1">
            <span>FLEET REGISTRY</span>
            <span>·</span>
            <span>SPECIFICATION VAULT</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase text-[#f5f5f7] tracking-tight">
            Hypercar Engineering Garage
          </h1>
          <p className="text-sm text-[#8e8e99] max-w-2xl mt-1">
            Track-focused carbon chassis, ground-effect aero packages, and extreme power-to-weight prototypes engineered for the ultimate lap delta.
          </p>
        </div>

        {/* Filter Controls (Segmented Tabs) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#141419] border border-white/[0.08] rounded">
          {(['ALL', 'HYPERCAR', 'GT3', 'LMH_PROTOTYPE', 'TRACK_ONLY'] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors rounded-xs cursor-pointer ${
                filterClass === cls
                  ? 'bg-[#ff1a35] text-[#0a0a0c]'
                  : 'text-[#8e8e99] hover:text-[#f5f5f7]'
              }`}
            >
              {cls === 'LMH_PROTOTYPE' ? 'LMH' : cls === 'TRACK_ONLY' ? 'TRACK' : cls}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Supercar Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => {
          const isSelected = currentCar.id === car.id;

          return (
            <div
              key={car.id}
              className={`bg-[#141419] border rounded-xs transition-all duration-300 flex flex-col justify-between overflow-hidden relative group ${
                isSelected
                  ? 'border-[#ff1a35] shadow-[0_8px_32px_rgba(255,26,53,0.18)]'
                  : 'border-white/[0.08] hover:border-white/30'
              }`}
            >
              {/* Card Image Area with fallback */}
              <div className="relative aspect-[16/10] bg-[#0a0a0c] overflow-hidden">
                <img
                  src={car.image}
                  alt={car.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized SVG placeholder if image network fails
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                    }
                  }}
                />

                {/* Laser Top Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-black/60 pointer-events-none" />

                {/* Upper Left: Racing Badge / Class Tag */}
                <div className="absolute top-3 left-3 flex items-center bg-[#0a0a0c]/90 border border-white/[0.1] px-2.5 py-1 text-[11px] font-mono font-bold text-[#f5f5f7] border-l-2" style={{ borderLeftColor: car.classColor }}>
                  {car.classification}
                </div>

                {/* Upper Right: Tachometer Spec Marker */}
                <div className="absolute top-3 right-3 font-mono text-[11px] font-bold text-[#8e8e99] bg-[#0a0a0c]/90 px-2 py-0.5 border border-white/[0.08]">
                  {car.specIndex}
                </div>

                {/* Bottom title inside image overlay */}
                <div className="absolute bottom-2 left-3 right-3">
                  <div className="text-xl font-black uppercase text-[#f5f5f7] leading-tight">
                    {car.name}
                  </div>
                  <div className="text-xs text-[#8e8e99] line-clamp-1">
                    {car.tagline}
                  </div>
                </div>
              </div>

              {/* Card Body & Specs */}
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                {/* Dual-Cell Stat Badges */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex border border-white/[0.08] bg-[#0a0a0c] font-mono text-xs overflow-hidden">
                    <span className="bg-[#1f1f26] px-1.5 py-1 text-[10px] text-[#8e8e99] italic border-r border-white/[0.08] flex items-center">
                      PWR
                    </span>
                    <span className="px-2 py-1 font-bold text-[#f5f5f7] flex items-center truncate">
                      {car.powerHp} HP
                    </span>
                  </div>

                  <div className="flex border border-white/[0.08] bg-[#0a0a0c] font-mono text-xs overflow-hidden">
                    <span className="bg-[#1f1f26] px-1.5 py-1 text-[10px] text-[#8e8e99] italic border-r border-white/[0.08] flex items-center">
                      AERO
                    </span>
                    <span className="px-2 py-1 font-bold text-[#00f0ff] flex items-center truncate">
                      {car.downforceAt250KmhKg} KG
                    </span>
                  </div>

                  <div className="flex border border-white/[0.08] bg-[#0a0a0c] font-mono text-xs overflow-hidden">
                    <span className="bg-[#1f1f26] px-1.5 py-1 text-[10px] text-[#8e8e99] italic border-r border-white/[0.08] flex items-center">
                      WT
                    </span>
                    <span className="px-2 py-1 font-bold text-[#f5f5f7] flex items-center truncate">
                      {car.weightKg} KG
                    </span>
                  </div>
                </div>

                {/* Performance Segmented Bars */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  {renderSegmentedBar(car.stats.aeroScore, 'AERODYNAMIC DOWNFORCE')}
                  {renderSegmentedBar(car.stats.powerScore, 'POWER-TO-WEIGHT')}
                  {renderSegmentedBar(car.stats.speedScore, 'TERMINAL VELOCITY')}
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06]">
                  <button
                    onClick={() => setInspectCar(car)}
                    className="px-3 py-2 bg-[#1f1f26] hover:bg-[#2a2a35] text-[#f5f5f7] font-mono text-xs font-bold border border-white/[0.08] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span>INSPECT SPEC</span>
                  </button>

                  <button
                    onClick={() => onLaunchToCockpit(car)}
                    className="chamfer-badge px-3 py-2 bg-[#ff1a35] hover:bg-[#ff334b] text-[#0a0a0c] font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,26,53,0.3)]"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>LAUNCH COCKPIT</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Car Inspection Modal Drawer */}
      {inspectCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-3xl bg-[#141419] border border-white/[0.15] p-6 chamfer-card-tr relative space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-[#ff1a35] font-bold">
                  <span>{inspectCar.specIndex}</span>
                  <span>·</span>
                  <span>CHASSIS BLUEPRINT SPECIFICATION</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#f5f5f7]">
                  {inspectCar.name}
                </h2>
                <div className="text-xs text-[#8e8e99] mt-0.5">{inspectCar.tagline}</div>
              </div>

              <button
                onClick={() => setInspectCar(null)}
                className="px-3 py-1 bg-[#1f1f26] text-[#8e8e99] hover:text-[#f5f5f7] border border-white/[0.08] font-mono text-xs cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Modal Image & Specs Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="aspect-[16/10] bg-[#0a0a0c] border border-white/[0.08] overflow-hidden relative">
                <img
                  src={inspectCar.image}
                  alt={inspectCar.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-[#0a0a0c]/90 px-2 py-1 text-[11px] font-mono text-[#00f0ff] border border-white/[0.1]">
                  LATERAL GRIP: {inspectCar.specs.lateralG} G
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-[#8e8e99]">DISPLACEMENT</span>
                  <span className="text-[#f5f5f7] font-bold text-right">{inspectCar.specs.displacement}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-[#8e8e99]">LAYOUT</span>
                  <span className="text-[#f5f5f7] font-bold text-right">{inspectCar.specs.engineLayout}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-[#8e8e99]">REDLINE</span>
                  <span className="text-[#ff1a35] font-bold">{inspectCar.specs.redlineRpm.toLocaleString()} RPM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-[#8e8e99]">POWER-TO-WEIGHT</span>
                  <span className="text-[#f5f5f7] font-bold">{inspectCar.specs.powerToWeight}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-[#8e8e99]">AERO EFFICIENCY</span>
                  <span className="text-[#00f0ff] font-bold">{inspectCar.specs.aeroEfficiency}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                  <span className="text-[#8e8e99]">TRANSMISSION</span>
                  <span className="text-[#f5f5f7] font-bold text-right">{inspectCar.specs.transmission}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#8e8e99]">CHASSIS</span>
                  <span className="text-[#f5f5f7] font-bold text-right">{inspectCar.specs.chassisConstruction}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#8e8e99] bg-[#0a0a0c] p-3 border border-white/[0.06]">
              {inspectCar.description}
            </p>

            {/* Modal Footer CTA */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => setInspectCar(null)}
                className="px-4 py-2 bg-[#1f1f26] text-[#8e8e99] hover:text-[#f5f5f7] font-mono text-xs font-bold border border-white/[0.08] cursor-pointer"
              >
                DISMISS
              </button>
              <button
                onClick={() => {
                  onLaunchToCockpit(inspectCar);
                  setInspectCar(null);
                }}
                className="chamfer-btn px-6 py-2 bg-[#ff1a35] hover:bg-[#ff334b] text-[#0a0a0c] font-mono text-xs font-black uppercase cursor-pointer shadow-[0_0_20px_rgba(255,26,53,0.5)]"
              >
                APPLY &amp; TEST IN COCKPIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
