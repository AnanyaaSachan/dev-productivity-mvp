
import React from 'react';
import { evaluateMetrics, getTeamAverages, getPreviousMonthData } from '../utils/insightEngine';

const badgeStyles = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red:   'bg-red-100   text-red-700',
};

// For cycle time and lead time, lower is better. For PRs and deployments, higher is better.
const getTrend = (current, previous, lowerIsBetter = true) => {
  if (previous === null || previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return { arrow: '→', label: 'No change', color: 'text-gray-400' };
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  return improved
    ? { arrow: '↓', label: `${Math.abs(diff).toFixed(1)} vs last month`, color: 'text-green-600' }
    : { arrow: '↑', label: `${Math.abs(diff).toFixed(1)} vs last month`, color: 'text-red-500' };
};

const MetricCard = ({ label, value, unit, badge, teamAvg, teamAvgUnit, trend }) => (
  <div className="bg-white rounded-2xl shadow-md p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col gap-2">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>

    <p className="text-4xl font-bold text-gray-800">{value}</p>

    {unit && <p className="text-sm text-gray-400">{unit}</p>}

    {/* Status badge */}
    {badge && (
      <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${badgeStyles[badge.color]}`}>
        {badge.label}
      </span>
    )}

    {/* Team average */}
    {teamAvg !== null && teamAvg !== undefined && (
      <p className="text-xs text-gray-400">
        Team avg: <span className="font-semibold text-gray-600">{teamAvg}{teamAvgUnit}</span>
      </p>
    )}

    {/* Month-over-month trend */}
    {trend && (
      <p className={`text-xs font-semibold flex items-center gap-1 ${trend.color}`}>
        <span>{trend.arrow}</span>
        <span>{trend.label}</span>
      </p>
    )}
  </div>
);

const MetricsGrid = ({ data }) => {
  if (!data) return null;

  const eval_   = evaluateMetrics(data);
  const teamAvg = getTeamAverages(data.team_name, data.month);
  const prev    = getPreviousMonthData(data.developer_id, data.month);

  const cards = [
    {
      label:       'Lead Time',
      value:       data.avg_lead_time_days.toFixed(1),
      unit:        'days',
      badge:       eval_.lead_time,
      teamAvg:     teamAvg?.avg_lead_time_days,
      teamAvgUnit: ' days',
      trend:       getTrend(data.avg_lead_time_days, prev?.avg_lead_time_days, true),
    },
    {
      label:       'Cycle Time',
      value:       data.avg_cycle_time_days.toFixed(1),
      unit:        'days',
      badge:       eval_.cycle_time,
      teamAvg:     teamAvg?.avg_cycle_time_days,
      teamAvgUnit: ' days',
      trend:       getTrend(data.avg_cycle_time_days, prev?.avg_cycle_time_days, true),
    },
    {
      label:       'PR Throughput',
      value:       data.merged_prs,
      unit:        'merged PRs',
      badge:       eval_.merged_prs,
      teamAvg:     teamAvg?.merged_prs,
      teamAvgUnit: ' PRs',
      trend:       getTrend(data.merged_prs, prev?.merged_prs, false),
    },
    {
      label:       'Deployment Frequency',
      value:       data.prod_deployments,
      unit:        'deployments',
      badge:       eval_.prod_deployments,
      teamAvg:     teamAvg?.prod_deployments,
      teamAvgUnit: '',
      trend:       getTrend(data.prod_deployments, prev?.prod_deployments, false),
    },
    {
      label:       'Bug Rate',
      value:       `${data.bug_rate_pct.toFixed(1)}%`,
      unit:        '',
      badge:       eval_.bug_rate,
      teamAvg:     teamAvg?.bug_rate_pct,
      teamAvgUnit: '%',
      trend:       getTrend(data.bug_rate_pct, prev?.bug_rate_pct, true),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(c => (
        <MetricCard
          key={c.label}
          label={c.label}
          value={c.value}
          unit={c.unit}
          badge={c.badge}
          teamAvg={c.teamAvg}
          teamAvgUnit={c.teamAvgUnit}
          trend={c.trend}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
