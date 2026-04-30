import React from 'react';
import ProfileCard from './ProfileCard';
import MetricsGrid from './MetricsGrid';
import InsightCard from './InsightCard';
import ActionCard from './ActionCard';
import EmptyState from './EmptyState';

const Dashboard = ({ developer, data }) => {
    if (!developer || !data) {
        return <EmptyState />;
    }

    return (
        <div className="flex flex-col gap-6">
            <ProfileCard developer={developer} />
            <MetricsGrid data={data} />
            <InsightCard data={data} />
            <ActionCard data={data} />
        </div>
    );
};

export default Dashboard;
