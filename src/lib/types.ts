export type Dosha = 'Vata' | 'Pitta' | 'Kapha';

export interface VPKVector {
  Vata: number;
  Pitta: number;
  Kapha: number;
}

export interface Symptom {
  id: string;
  label: string;
  labelTh: string;
  icon?: string;
  doshaImpact: Partial<VPKVector>;
}

export interface Herb {
  name: string;
  nameTh: string;
  scientificName: string;
  imageUrl?: string;
  activeCompounds: string[];
  taste: string;
  property: string;
  targetDosha: Dosha[];
  synergy?: string[];
  safetyNote?: string;
  source: string;
}

export interface DiagnosticResult {
  vector: VPKVector;
  dominantDosha: Dosha;
  baseDoseMg: number;
  capsulesPerDay: number;
  recommendations: HerbRecommendation[];
}

export interface HerbRecommendation extends Herb {
  dosePerDayMg: number;
  reason: string;
  reasonTh: string;
}
