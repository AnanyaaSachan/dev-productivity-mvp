
import React from 'react';
import ProfileCard from './ProfileCard';
import NarrativeCard from './NarrativeCard';
import MetricsGrid from './MetricsGrid';
import InsightCard from './InsightCard';
import ReasoningCard from './ReasoningCard';
import DeepSignals from './DeepSignals';
import ActionCard from './ActionCard';
import EmptyState from './EmptyState';

const Dashboard = ({ developer, data }) => {
  if (!developer || !data) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileCard developer={developer} />
      <NarrativeCard data={data} />
      <MetricsGrid data={data} />
      <InsightCard data={data} />
      <ReasoningCard data={data} />
      <DeepSignals data={data} />
      <ActionCard data={data} />
    </div>
  );
};

export default Dashboard;
