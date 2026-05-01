
import React from 'react';
import { getNarrative } from '../utils/insightEngine';

const typeStyles = {
  'Healthy flow':  { border: 'border-green-400',  bg: 'bg-green-50',  text: 'text-green-800',  label: 'bg-green-100 text-green-700'  },
  'Quality watch': { border: 'border-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-800',  label: 'bg-amber-100 text-amber-700'  },
  'Needs review':  { border: 'border-red-400',    bg: 'bg-red-50',    text: 'text-red-800',    label: 'bg-red-100   text-red-700'    },
};

const NarrativeCard = ({ data }) => {
  if (!data) return null;

  const narrative = getNarrative(data);
  if (!narrative) return null;

  const s = typeStyles[data.pattern_hint] || typeStyles['Needs review'];

  return (
    <div className={`rounded-2xl shadow-md p-6 border-l-8 ${s.border} ${s.bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <h3 className={`text-lg font-bold ${s.text}`}>Summary</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.label}`}>
          {data.pattern_hint}
        </span>
      </div>
      <p className={`text-base leading-relaxed ${s.text}`}>{narrative}</p>
    </div>
  );
};

export default NarrativeCard;
