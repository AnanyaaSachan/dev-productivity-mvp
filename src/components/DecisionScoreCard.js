
import React from 'react';
import { getDecisionScore } from '../utils/insightEngine';

const colorMap = {
  green: {
    ring:   'ring-green-400',
    score:  'text-green-600',
    bar:    'bg-green-500',
    badge:  'bg-green-100 text-green-700',
    bg:     'bg-green-50',
  },
  amber: {
    ring:   'ring-amber-400',
    score:  'text-amber-600',
    bar:    'bg-amber-500',
    badge:  'bg-amber-100 text-amber-700',
    bg:     'bg-amber-50',
  },
  red: {
    ring:   'ring-red-400',
    score:  'text-red-600',
    bar:    'bg-red-500',
    badge:  'bg-red-100 text-red-700',
    bg:     'bg-red-50',
  },
};

const ScoreRing = ({ score, color }) => {
  const c = colorMap[color];
  return (
    <div className={`w-28 h-28 rounded-full ring-8 ${c.ring} flex flex-col items-center justify-center flex-shrink-0`}>
      <span className={`text-3xl font-bold ${c.score}`}>{score}</span>
      <span className="text-xs text-gray-400 font-medium">/ 100</span>
    </div>
  );
};

const DimensionBar = ({ label, score, meta, weight, desc }) => {
  const c = colorMap[meta.color];
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-xs text-gray-400">({weight})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{desc}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
            {score}/100
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${c.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const DecisionScoreCard = ({ data }) => {
  if (!data) return null;

  const result = getDecisionScore(data);
  if (!result) return null;

  const { overall, overallMeta, dimensions } = result;
  const c = colorMap[overallMeta.color];

  return (
    <div className={`rounded-2xl shadow-md p-6 ${c.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Overall Health Score</h3>
          <p className="text-sm text-gray-500">
            Weighted across Quality (50%), Speed (30%), and Stability (20%).
          </p>
        </div>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${c.badge}`}>
          {overallMeta.icon} {overallMeta.label}
        </span>
      </div>

      {/* Score ring + dimensions */}
      <div className="flex items-center gap-8">
        <ScoreRing score={overall} color={overallMeta.color} />

        <div className="flex-1 flex flex-col gap-4">
          {dimensions.map((d) => (
            <DimensionBar
              key={d.label}
              label={d.label}
              score={d.score}
              meta={d.meta}
              weight={d.weight}
              desc={d.desc}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecisionScoreCard;
