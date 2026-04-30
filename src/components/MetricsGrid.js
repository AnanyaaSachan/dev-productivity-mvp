import React from 'react';

const MetricCard = ({ label, value, unit }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
        <p className="text-4xl font-bold text-gray-800">{value}</p>
        {unit && <p className="text-sm text-gray-400 mt-1">{unit}</p>}
    </div>
);

const MetricsGrid = ({ data }) => {
    if (!data) return null;

    const metrics = [
        { label: 'Lead Time',            value: data.avg_lead_time_days.toFixed(1),  unit: 'days' },
        { label: 'Cycle Time',           value: data.avg_cycle_time_days.toFixed(1), unit: 'days' },
        { label: 'PR Throughput',        value: data.merged_prs,                     unit: 'merged PRs' },
        { label: 'Deployment Frequency', value: data.prod_deployments,               unit: 'deployments' },
        { label: 'Bug Rate',             value: `${data.bug_rate_pct.toFixed(1)}%`,  unit: '' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map(m => (
                <MetricCard key={m.label} label={m.label} value={m.value} unit={m.unit} />
            ))}
        </div>
    );
};

export default MetricsGrid;
