
import React from 'react';
import { detectPattern } from '../utils/insightEngine';

const colorMap = {
  green: { bg: 'bg-green-50',  border: 'border-green-400', badge: 'bg-green-100 text-green-700',  pill: 'bg-green-100 text-green-600'  },
  amber: { bg: 'bg-amber-50',  border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700',  pill: 'bg-amber-100 text-amber-600'  },
  red:   { bg: 'bg-red-50',    border: 'border-red-400',   badge: 'bg-red-100   text-red-700',    pill: 'bg-red-100   text-red-600'    },
  blue:  { bg: 'bg-blue-50',   border: 'border-blue-400',  badge: 'bg-blue-100  text-blue-700',   pill: 'bg-blue-100  text-blue-600'   },
};

const PatternDetectionCard = ({ data }) => {
  if (!data) return null;

  const patterns = detectPattern(data);
  if (!patterns || patterns.length === 0) return null;

  const primary = patterns[0];
  const secondary = patterns.slice(1);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Pattern Detection</h3>
      <p className="text-sm text-gray-400 mb-5">
        Auto-detected behavioural patterns based on metric combinations.
      </p>

      {/* Primary pattern — prominent */}
      {(() => {
        const c = colorMap[primary.color];
        return (
          <div className={`rounded-xl border-l-4 ${c.border} ${c.bg} px-5 py-4 mb-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{primary.icon}</span>
                <span className="text-base font-bold text-gray-800">{primary.name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                  Primary
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{primary.description}</p>
            <div className="flex flex-wrap gap-2">
              {primary.signals.map((s, i) => (
                <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.pill}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Secondary patterns */}
      {secondary.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Also detected
          </p>
          {secondary.map((p, i) => {
            const c = colorMap[p.color];
            return (
              <div key={i} className={`rounded-xl border-l-4 ${c.border} ${c.bg} px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm font-bold text-gray-700">{p.name}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">{p.description}</p>
                <div className="flex flex-wrap gap-1">
                  {p.signals.map((s, j) => (
                    <span key={j} className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.pill}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatternDetectionCard;
