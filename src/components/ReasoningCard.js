
import React from 'react';
import { getReasoning } from '../utils/insightEngine';

const typeStyles = {
  good: { bg: 'bg-green-50', border: 'border-green-400', dot: 'bg-green-500', condition: 'text-green-700', text: 'text-gray-700' },
  warn: { bg: 'bg-amber-50', border: 'border-amber-400', dot: 'bg-amber-500', condition: 'text-amber-700', text: 'text-gray-700' },
  bad:  { bg: 'bg-red-50',   border: 'border-red-400',   dot: 'bg-red-500',   condition: 'text-red-700',   text: 'text-gray-700' },
};

const ReasoningCard = ({ data }) => {
  if (!data) return null;

  const diagnoses = getReasoning(data);
  if (!diagnoses || diagnoses.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Reasoning</h3>
      <p className="text-sm text-gray-400 mb-5">
        What the combination of metrics tells us about the real problem.
      </p>
      <div className="flex flex-col gap-4">
        {diagnoses.map((d, i) => {
          const s = typeStyles[d.type];
          return (
            <div key={i} className={`rounded-xl border-l-4 ${s.border} ${s.bg} px-4 py-4`}>
              /* Condition label */
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                <span className={`text-xs font-semibold uppercase tracking-wide ${s.condition}`}>
                  {d.condition}
                </span>
              </div>
              /* Diagnosis */
              <p className={`text-sm leading-relaxed ${s.text}`}>{d.diagnosis}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReasoningCard;
