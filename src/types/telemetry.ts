export type CarClassification = 'HYPERCAR' | 'GT3' | 'LMH_PROTOTYPE' | 'TRACK_ONLY';

export interface CarSpecs {
  displacement: string;
  engineLayout: string;
  redlineRpm: number;
  powerToWeight: string; // e.g. "1.00 hp/kg"
  aeroEfficiency: string; // e.g. "L/D 3.8:1"
  lateralG: number; // e.g. 3.5
  chassisConstruction: string;
  transmission: string;
}

export interface Hypercar {
  id: string;
  name: string;
  tagline: string;
  classification: CarClassification;
  classColor: string; // hex
  powerHp: number;
  torqueNm: number;
  weightKg: number;
  topSpeedKmh: number;
  zeroToHundredS: number;
  downforceAt250KmhKg: number;
  aeroBalanceFrontPercent: number;
  image: string;
  thumbnail: string;
  description: string;
  specIndex: string;
  specs: CarSpecs;
  stats: {
    powerScore: number; // 0 - 100
    aeroScore: number;
    agilityScore: number;
    brakingScore: number;
    speedScore: number;
  };
}

export interface LiveTelemetryState {
  speedKmh: number;
  rpm: number;
  maxRpm: number;
  gear: number; // 0 = N, -1 = R, 1-7
  throttlePercent: number;
  brakePercent: number;
  steeringAngle: number;
  drsActive: boolean;
  drsAvailable: boolean;
  pitLimiterActive: boolean;
  ersPercent: number;
  gForce: {
    lateral: number; // -3.0 to +3.0
    longitudinal: number; // -2.5 (brake) to +2.0 (accel)
  };
  tirePressures: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  tireTemps: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  brakeTemps: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  lapTimeMs: number;
  deltaToBestMs: number; // negative is faster (green), positive is slower (red)
  currentLap: number;
  bestLapMs: number;
}

export interface CircuitSector {
  sector: number;
  referenceTimeS: number;
  currentTimeS: number;
  deltaS: number;
  status: 'faster' | 'slower' | 'purple';
}

export interface TrackCircuit {
  id: string;
  name: string;
  country: string;
  flag: string;
  lengthKm: number;
  turns: number;
  lapRecordTime: string;
  lapRecordHolder: string;
  sectors: CircuitSector[];
  apexSpeeds: { turn: string; speedKmh: number; gear: number }[];
  description: string;
}

export interface AeroDynoSettings {
  frontSplitterAngleDeg: number; // 0 - 12
  rearWingAngleDeg: number; // 2 - 18
  rideHeightFrontMm: number; // 35 - 75
  rideHeightRearMm: number; // 40 - 85
  brakeBiasFrontPercent: number; // 50 - 65
  ecuMode: 'ENDURANCE' | 'BALANCED' | 'QUALIFYING_OVERBOOST';
}
