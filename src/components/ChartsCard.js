
import React from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { metrics as allMetrics } from '../data/data';
import { getTeamAverages } from '../utils/insightEngine';

// ─── Line chart — developer trend over all available months ──────────────────
const TrendLineChart = ({ developerId }) => {
  const devData = allMetrics
    .filter((m) => m.developer_id === developerId)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      month:      m.month,
      'Cycle Time':  m.avg_cycle_time_days,
      'Lead Time':   m.avg_lead_time_days,
      'Bug Rate':    m.bug_rate_pct,
    }));

  if (devData.length < 2) {
    return <p className="text-sm text-gray-400 text-center py-8">Not enough data for trend chart (need at least 2 months).</p>;
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-600 mb-4">Trend Over Time</h4>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={devData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Cycle threshold', fontSize: 10, fill: '#f59e0b' }} />
          <Line type="monotone" dataKey="Cycle Time"  stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Lead Time"   stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Bug Rate"    stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Bar chart — developer vs team average ────────────────────────────────────
const TeamBarChart = ({ metricRow }) => {
  const teamAvg = getTeamAverages(metricRow.team_name, metricRow.month);
  if (!teamAvg) return null;

  const barData = [
    { metric: 'Cycle Time',  You: metricRow.avg_cycle_time_days, Team: teamAvg.avg_cycle_time_days },
    { metric: 'Lead Time',   You: metricRow.avg_lead_time_days,  Team: teamAvg.avg_lead_time_days  },
    { metric: 'Bug Rate',    You: metricRow.bug_rate_pct,        Team: teamAvg.bug_rate_pct        },
    { metric: 'PR Count',    You: metricRow.merged_prs,          Team: teamAvg.merged_prs          },
    { metric: 'Deployments', You: metricRow.prod_deployments,    Team: teamAvg.prod_deployments    },
  ];

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-600 mb-4">You vs Team Average — {metricRow.month}</h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="You"  fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Team" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ChartsCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Visual Analysis</h3>
      <p className="text-sm text-gray-400 mb-6">
        Charts showing trend over time and comparison against team average.
      </p>

      <div className="flex flex-col gap-8">
        <TrendLineChart developerId={data.developer_id} />
        <div className="h-px bg-gray-100" />
        <TeamBarChart metricRow={data} />
      </div>
    </div>
  );
};

export default ChartsCard;
