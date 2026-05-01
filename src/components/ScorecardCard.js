
import React from 'react';
import { getWeightedScore } from '../utils/insightEngine';

const healthStyle = {
  green: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
  red:   { bg: 'bg-red-100',   text: 'text-red-700',   bar: 'bg-red-500'   },
};

const ScorecardCard = ({ data }) => {
  if (!data) return null;

  const result = getWeightedScore(data);
  if (!result) return null;

  const { scored, totalScore, primaryIssue, secondaryIssue, health } = result;
  const s = healthStyle[health.color];

  // Sort by raw score descending for display
  const sorted = [...scored].sort((a, b) => b.rawScore - a.rawScore);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Weighted Risk Score</h3>
      <p className="text-sm text-gray-400 mb-5">
        Each metric is normalised and weighted to compute an overall risk score.
      </p>

      {/* Total score banner */}
      <div className={`rounded-xl px-5 py-4 mb-6 flex items-center justify-between ${s.bg}`}>
        <div>
          <p className={`text-3xl font-bold ${s.text}`}>{totalScore} <span className="text-base font-normal">/ 100</span></p>
          <p className={`text-sm font-semibold mt-0.5 ${s.text}`}>{health.label}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-500">Primary issue</p>
          <p className={`font-bold ${s.text}`}>{primaryIssue}</p>
          <p className="text-gray-500 mt-1">Secondary issue</p>
          <p className={`font-semibold ${s.text}`}>{secondaryIssue}</p>
        </div>
      </div>

      /* Per-metric breakdown */
      <div className="flex flex-col gap-4">
        {sorted.map((m) => {
          const barWidth = Math.min(m.rawScore / 40 * 100, 100); // scale bar to max 40 contribution
          return (
            <div key={m.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{m.label}</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Weight: {m.weight}%</span>
                  <span>Risk: {m.normalised}%</span>
                  <span className="font-bold text-gray-700">Score: {m.rawScore}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    m.rawScore >= 15 ? 'bg-red-400' :
                    m.rawScore >= 7  ? 'bg-amber-400' :
                                       'bg-green-400'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Formula: score = (bug_rate × 0.4) + (cycle_time × 0.2) + (lead_time × 0.2) + (deployments × 0.1) + (PRs × 0.1)
      </p>
    </div>
  );
};

export default ScorecardCard;
