
import React from 'react';
import { getTeamAverages } from '../utils/insightEngine';
import { developers } from '../data/data';

const metrics = [
  { label: 'Cycle Time',            devKey: 'avg_cycle_time_days',  teamKey: 'avg_cycle_time_days',  unit: ' days', lowerIsBetter: true  },
  { label: 'Lead Time',             devKey: 'avg_lead_time_days',   teamKey: 'avg_lead_time_days',   unit: ' days', lowerIsBetter: true  },
  { label: 'Bug Rate',              devKey: 'bug_rate_pct',         teamKey: 'bug_rate_pct',         unit: '%',     lowerIsBetter: true  },
  { label: 'PR Throughput',         devKey: 'merged_prs',           teamKey: 'merged_prs',           unit: ' PRs',  lowerIsBetter: false },
  { label: 'Deployment Frequency',  devKey: 'prod_deployments',     teamKey: 'prod_deployments',     unit: '',      lowerIsBetter: false },
];

const getVerdict = (devVal, teamVal, lowerIsBetter) => {
  const diff = devVal - teamVal;
  if (Math.abs(diff) < 0.05) return { icon: '➖', color: 'text-gray-400', bg: 'bg-gray-50',   label: 'On par'  };
  const better = lowerIsBetter ? diff < 0 : diff > 0;
  return better
    ? { icon: '✅', color: 'text-green-600', bg: 'bg-green-50',  label: 'Better' }
    : { icon: '❌', color: 'text-red-600',   bg: 'bg-red-50',    label: 'Worse'  };
};

const TeamComparisonCard = ({ data }) => {
  if (!data) return null;

  const teamAvg = getTeamAverages(data.team_name, data.month);
  if (!teamAvg) return null;

  // Get manager name from developers table
  const dev = developers.find((d) => d.developer_id === data.developer_id);
  const managerName = dev?.manager_name || 'Team';

  // Count better / worse
  let betterCount = 0, worseCount = 0;
  metrics.forEach(({ devKey, teamKey, lowerIsBetter }) => {
    const v = getVerdict(data[devKey], teamAvg[teamKey], lowerIsBetter);
    if (v.label === 'Better') betterCount++;
    if (v.label === 'Worse')  worseCount++;
  });

  const overallColor =
    worseCount === 0  ? 'text-green-700' :
    worseCount <= 2   ? 'text-amber-700' :
                        'text-red-700';

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-xl font-bold text-gray-800">You vs Team</h3>
        <span className={`text-sm font-semibold ${overallColor}`}>
          {betterCount} better · {worseCount} worse
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Comparing against {data.team_name} team average for {data.month}.
        Manager: <span className="font-medium text-gray-600">{managerName}</span>
      </p>

      {/* Metric rows */}
      <div className="flex flex-col gap-3">
        {metrics.map(({ label, devKey, teamKey, unit, lowerIsBetter }) => {
          const devVal  = data[devKey];
          const teamVal = teamAvg[teamKey];
          const verdict = getVerdict(devVal, teamVal, lowerIsBetter);

          // Multiplier
          const ratio = teamVal !== 0 ? devVal / teamVal : 1;
          const pctDiff = Math.abs(((devVal - teamVal) / teamVal) * 100).toFixed(0);
          const showMultiplier = Math.abs(devVal - teamVal) >= 0.1;

          return (
            <div key={label} className={`rounded-xl px-4 py-3 ${verdict.bg}`}>
              <div className="flex items-center justify-between">
                {/* Left: label + verdict icon */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{verdict.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>

                {/* Right: you vs team */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-gray-800">
                    {devVal}{unit}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-gray-500">
                    {teamVal}{unit} team avg
                  </span>
                  {showMultiplier && (
                    <span className={`text-xs font-semibold ml-1 ${verdict.color}`}>
                      ({pctDiff}% {devVal > teamVal ? 'higher' : 'lower'})
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamComparisonCard;
