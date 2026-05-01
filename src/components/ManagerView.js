
import React from 'react';
import { getManagerSummary } from '../utils/insightEngine';
import ProfileCard from './ProfileCard';
import ChartsCard from './ChartsCard';
import TeamComparisonCard from './TeamComparisonCard';

const riskStyle = {
  green: { bg: 'bg-green-50',  border: 'border-green-400', badge: 'bg-green-100 text-green-700',  text: 'text-green-800'  },
  amber: { bg: 'bg-amber-50',  border: 'border-amber-400', badge: 'bg-amber-100 text-amber-700',  text: 'text-amber-800'  },
  red:   { bg: 'bg-red-50',    border: 'border-red-400',   badge: 'bg-red-100   text-red-700',    text: 'text-red-800'    },
};

const Section = ({ title, items, icon, itemColor }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${itemColor}`}>
            <span className="flex-shrink-0 mt-0.5">{icon}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ManagerView = ({ developer, data }) => {
  if (!developer || !data) return null;

  const summary = getManagerSummary(data);
  if (!summary) return null;

  const s = riskStyle[summary.riskColor];

  return (
    <div className="flex flex-col gap-6">

      {/* Profile */}
      <ProfileCard developer={developer} />

      {/* Manager verdict card */}
      <div className={`rounded-2xl shadow-md p-6 border-l-8 ${s.border} ${s.bg}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800">Manager Summary</h3>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.badge}`}>
              {summary.riskLevel}
            </span>
            <span className={`text-2xl font-bold ${s.text}`}>
              {summary.healthScore}/100
            </span>
          </div>
        </div>
        <p className={`text-base font-medium leading-relaxed ${s.text}`}>{summary.verdict}</p>
      </div>

      {/* Concerns + Positives side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <Section
            title="Concerns"
            items={summary.concerns}
            icon="⚠️"
            itemColor="bg-red-50 text-red-700"
          />
          {summary.concerns.length === 0 && (
            <p className="text-sm text-green-600 font-medium">No concerns this month.</p>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
          <Section
            title="Positive Signals"
            items={summary.positives}
            icon="✅"
            itemColor="bg-green-50 text-green-700"
          />
          {summary.positives.length === 0 && (
            <p className="text-sm text-gray-400">No standout positives this month.</p>
          )}
        </div>
      </div>

      {/* Manager actions */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Suggested Manager Actions</h3>
        <ul className="flex flex-col gap-3">
          {summary.managerActions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 bg-purple-50 border-l-4 border-purple-400 rounded-lg px-4 py-3 text-sm text-gray-700">
              <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">→</span>
              {action}
            </li>
          ))}
        </ul>
      </div>

      {/* Charts + team comparison — useful for manager too */}
      <ChartsCard data={data} />
      <TeamComparisonCard data={data} />

    </div>
  );
};

export default ManagerView;
