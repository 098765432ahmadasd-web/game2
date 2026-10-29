import React from 'react';
import { Volume2, VolumeX, Flame } from 'lucide-react';
import { audioEngine } from '../utils/audio';

export type ActiveTab = 'cockpit' | 'garage' | 'dyno' | 'strategy';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isEngineRunning: boolean;
  onIgnitionToggle: () => void;
  isAudioMuted: boolean;
  onAudioToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isEngineRunning,
  onIgnitionToggle,
  isAudioMuted,
  onAudioToggle,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 lg:px-10 py-3.5 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/[0.08]">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#telemetry"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('cockpit');
        }}
        className="text-xl lg:text-2xl font-black tracking-tight uppercase whitespace-nowrap shrink-0 text-[#f5f5f7] flex items-center gap-2 group"
      >
        <span className="inline-block w-2.5 h-2.5 bg-[#ff1a35] transform rotate-45 transition-transform group-hover:scale-125" />
        <span className="font-['Chivo'] font-black">APEX VELOCITY</span>
      </a>

      {/* Zone 2: 4 single-line nav links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#8e8e99]">
        <button
          onClick={() => onTabChange('cockpit')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer font-['Space_Grotesk'] text-sm tracking-wide relative ${
            activeTab === 'cockpit'
              ? 'text-[#f5f5f7] font-semibold'
              : 'hover:text-[#f5f5f7]'
          }`}
        >
          Cockpit Telemetry
          {activeTab === 'cockpit' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff1a35]" />
          )}
        </button>

        <button
          onClick={() => onTabChange('garage')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer font-['Space_Grotesk'] text-sm tracking-wide relative ${
            activeTab === 'garage'
              ? 'text-[#f5f5f7] font-semibold'
              : 'hover:text-[#f5f5f7]'
          }`}
        >
          Hypercar Garage
          {activeTab === 'garage' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff1a35]" />
          )}
        </button>

        <button
          onClick={() => onTabChange('dyno')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer font-['Space_Grotesk'] text-sm tracking-wide relative ${
            activeTab === 'dyno'
              ? 'text-[#f5f5f7] font-semibold'
              : 'hover:text-[#f5f5f7]'
          }`}
        >
          Aero &amp; Dyno Lab
          {activeTab === 'dyno' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff1a35]" />
          )}
        </button>

        <button
          onClick={() => onTabChange('strategy')}
          className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer font-['Space_Grotesk'] text-sm tracking-wide relative ${
            activeTab === 'strategy'
              ? 'text-[#f5f5f7] font-semibold'
              : 'hover:text-[#f5f5f7]'
          }`}
        >
          Track Strategy
          {activeTab === 'strategy' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff1a35]" />
          )}
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onAudioToggle}
          title={isAudioMuted ? 'Unmute Cockpit Audio' : 'Mute Cockpit Audio'}
          className="p-2 text-[#8e8e99] hover:text-[#f5f5f7] transition-colors rounded border border-white/[0.08] hover:border-white/20 bg-[#141419]"
          aria-label={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00f0ff]" />}
        </button>

        <button
          onClick={onIgnitionToggle}
          className={`chamfer-btn px-4 lg:px-5 py-2 font-['Chivo'] font-black uppercase tracking-wider text-xs lg:text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            isEngineRunning
              ? 'bg-[#141419] text-[#ff1a35] border border-[#ff1a35]/60 hover:bg-[#ff1a35]/10 shadow-[0_0_15px_rgba(255,26,53,0.3)]'
              : 'bg-[#ff1a35] text-[#0a0a0c] hover:bg-[#ff334b] shadow-[0_0_20px_rgba(255,26,53,0.6)]'
          }`}
        >
          <Flame className={`w-4 h-4 ${isEngineRunning ? 'animate-pulse text-[#ff1a35]' : 'text-[#0a0a0c]'}`} />
          <span>{isEngineRunning ? 'Kill Engine' : 'Ignition Launch'}</span>
        </button>
      </div>
    </header>
  );
};
