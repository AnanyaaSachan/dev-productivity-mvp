
import React from 'react';
import { evaluateMetrics } from '../utils/insightEngine';

const badgeStyles = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red:   'bg-red-100   text-red-700',
};

const MetricCard = ({ label, value, unit, badge }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-2">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-4xl font-bold text-gray-800">{value}</p>
    <div className="flex items-center justify-between mt-1">
      {unit && <p className="text-sm text-gray-400">{unit}</p>}
      {badge && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeStyles[badge.color]}`}>
          {badge.label}
        </span>
      )}
    </div>
  </div>
);

const MetricsGrid = ({ data }) => {
  if (!data) return null;

  const eval_ = evaluateMetrics(data);

  const cards = [
    { label: 'Lead Time',            value: data.avg_lead_time_days.toFixed(1),  unit: 'days',        badge: eval_.lead_time        },
    { label: 'Cycle Time',           value: data.avg_cycle_time_days.toFixed(1), unit: 'days',        badge: eval_.cycle_time       },
    { label: 'PR Throughput',        value: data.merged_prs,                     unit: 'merged PRs',  badge: eval_.merged_prs       },
    { label: 'Deployment Frequency', value: data.prod_deployments,               unit: 'deployments', badge: eval_.prod_deployments },
    { label: 'Bug Rate',             value: `${data.bug_rate_pct.toFixed(1)}%`,  unit: '',            badge: eval_.bug_rate         },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(c => (
        <MetricCard key={c.label} label={c.label} value={c.value} unit={c.unit} badge={c.badge} />
      ))}
    </div>
  );
};

export default MetricsGrid;
