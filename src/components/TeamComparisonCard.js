
import React from 'react';
import { getTeamComparison } from '../utils/insightEngine';

const colorMap = {
  green: { row: 'bg-green-50',  badge: 'bg-green-100 text-green-700',  bar: 'bg-green-400', mult: 'text-green-600' },
  red:   { row: 'bg-red-50',    badge: 'bg-red-100   text-red-700',    bar: 'bg-red-400',   mult: 'text-red-600'   },
  gray:  { row: 'bg-gray-50',   badge: 'bg-gray-100  text-gray-500',   bar: 'bg-gray-300',  mult: 'text-gray-400'  },
};

const TeamComparisonCard = ({ data }) => {
  if (!data) return null;

  const rows = getTeamComparison(data);
  if (!rows || rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Team Comparison</h3>
      <p className="text-sm text-gray-400 mb-5">
        How this developer compares to the team average for {data.month}.
      </p>

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const s = colorMap[row.color];
          return (
            <div key={row.label} className={`rounded-xl px-4 py-3 ${s.row}`}>
              <div className="flex items-center justify-between mb-1">
                {/* Metric name */}
                <span className="text-sm font-semibold text-gray-700">{row.label}</span>
                {/* Verdict badge */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                  {row.verdict}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {/* Dev value vs team avg */}
                <span className="text-xs text-gray-500">
                  <span className="font-bold text-gray-800">{row.devVal}</span>
                  {' '}vs team avg{' '}
                  <span className="font-semibold text-gray-600">{row.teamVal}</span>
                </span>
                {/* Multiplier */}
                {row.multiplierText && (
                  <span className={`text-xs font-semibold ${s.mult}`}>
                    {row.multiplierText}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamComparisonCard;
