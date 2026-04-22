import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { VPKVector } from '../lib/types';

interface Props {
  vector: VPKVector;
}

export default function VPKChart({ vector }: Props) {
  const data = [
    { subject: 'Vata', A: vector.Vata, fullMark: 1 },
    { subject: 'Pitta', A: vector.Pitta, fullMark: 1 },
    { subject: 'Kapha', A: vector.Kapha, fullMark: 1 },
  ];

  return (
    <div className="w-full h-64 bg-slate-900/50 rounded-xl border border-slate-700 p-4 shadow-inner">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
          <Radar
            name="Dosha"
            dataKey="A"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
