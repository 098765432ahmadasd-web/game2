import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { CockpitDashboard } from './components/CockpitDashboard';
import { HypercarGarage } from './components/HypercarGarage';
import { AeroDynoLab } from './components/AeroDynoLab';
import { TrackStrategy } from './components/TrackStrategy';
import { Hypercar } from './types/telemetry';
import { HYPERCARS } from './data/cars';
import { audioEngine } from './utils/audio';
import { Gauge, Car, Wind, Flag } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cockpit');
  const [currentCar, setCurrentCar] = useState<Hypercar>(HYPERCARS[0]);
  const [isEngineRunning, setIsEngineRunning] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  // Toggle Ignition
  const handleIgnitionToggle = () => {
    if (!isEngineRunning) {
      setIsEngineRunning(true);
      audioEngine.playIgnition();
    } else {
      setIsEngineRunning(false);
      audioEngine.stop();
    }
  };

  // Toggle Audio Mute
  const handleAudioToggle = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  // Switch car and launch directly into cockpit
  const handleLaunchToCockpit = (car: Hypercar) => {
    setCurrentCar(car);
    setActiveTab('cockpit');
    if (!isEngineRunning) {
      setIsEngineRunning(true);
      audioEngine.playIgnition();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e5e1e4] flex flex-col selection:bg-[#ff1a35] selection:text-white">
      {/* Top Bar adhering strictly to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isEngineRunning={isEngineRunning}
        onIgnitionToggle={handleIgnitionToggle}
        isAudioMuted={isAudioMuted}
        onAudioToggle={handleAudioToggle}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-24 md:pb-12">
        {activeTab === 'cockpit' && (
          <CockpitDashboard
            currentCar={currentCar}
            onSelectCar={setCurrentCar}
            isEngineRunning={isEngineRunning}
            onIgnitionToggle={handleIgnitionToggle}
          />
        )}

        {activeTab === 'garage' && (
          <HypercarGarage
            currentCar={currentCar}
            onSelectCar={setCurrentCar}
            onLaunchToCockpit={handleLaunchToCockpit}
          />
        )}

        {activeTab === 'dyno' && (
          <AeroDynoLab currentCar={currentCar} />
        )}

        {activeTab === 'strategy' && (
          <TrackStrategy />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (<15% viewport height cap) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0c]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 py-2 flex items-center justify-around font-mono text-[10px]">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors cursor-pointer ${
            activeTab === 'cockpit' ? 'text-[#ff1a35] font-bold' : 'text-[#8e8e99]'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Cockpit</span>
        </button>

        <button
          onClick={() => setActiveTab('garage')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors cursor-pointer ${
            activeTab === 'garage' ? 'text-[#ff1a35] font-bold' : 'text-[#8e8e99]'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Garage</span>
        </button>

        <button
          onClick={() => setActiveTab('dyno')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors cursor-pointer ${
            activeTab === 'dyno' ? 'text-[#ff1a35] font-bold' : 'text-[#8e8e99]'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Aero Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('strategy')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors cursor-pointer ${
            activeTab === 'strategy' ? 'text-[#ff1a35] font-bold' : 'text-[#8e8e99]'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Strategy</span>
        </button>
      </div>

      {/* Clean quiet footer */}
      <footer className="border-t border-white/[0.06] bg-[#0a0a0c] px-6 lg:px-10 py-5 text-xs text-[#8e8e99] font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#ff1a35] inline-block" />
          <span>APEX VELOCITY &amp; PRECISION ENGINEERING</span>
        </div>
        <div>
          <span>ISO 9001 AERODYNAMICS · FIA TELEMETRY PROTOCOL COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
}
