
import React from 'react';
import { getTrendIntelligence } from '../utils/insightEngine';

const rowColor = {
  green: { bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700',  text: 'text-green-700'  },
  red:   { bg: 'bg-red-50',    badge: 'bg-red-100   text-red-700',    text: 'text-red-700'    },
  gray:  { bg: 'bg-gray-50',   badge: 'bg-gray-100  text-gray-500',   text: 'text-gray-500'   },
};

const overallBg = {
  green: 'bg-green-50 border-green-400',
  red:   'bg-red-50   border-red-400',
  amber: 'bg-amber-50 border-amber-400',
};

const overallText = {
  green: 'text-green-800',
  red:   'text-red-800',
  amber: 'text-amber-800',
};

const TrendCard = ({ data }) => {
  if (!data) return null;

  const result = getTrendIntelligence(data);
  if (!result) return null;

  const { trends, overallVerdict, overallColor, overallIcon, prevMonth } = result;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Trend Intelligence</h3>
      <p className="text-sm text-gray-400 mb-5">
        Month-over-month change vs {prevMonth}.
      </p>

      {/* Overall verdict banner */}
      <div className={`rounded-xl border-l-4 px-4 py-3 mb-5 ${overallBg[overallColor]}`}>
        <p className={`text-sm font-semibold leading-relaxed ${overallText[overallColor]}`}>
          {overallIcon} {overallVerdict}
        </p>
      </div>

      {/* Per-metric trend rows */}
      <div className="flex flex-col gap-3">
        {trends.map((t) => {
          const s = rowColor[t.color];
          return (
            <div key={t.label} className={`rounded-xl px-4 py-3 ${s.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  {t.icon} {t.label}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                  {t.text}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${s.text}`}>{t.reasoning}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendCard;
