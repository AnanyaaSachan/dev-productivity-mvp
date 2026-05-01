
import React from 'react';
import ProfileCard from './ProfileCard';
import NarrativeCard from './NarrativeCard';
import IntelligenceCard from './IntelligenceCard';
import ScorecardCard from './ScorecardCard';
import MetricsGrid from './MetricsGrid';
import TeamComparisonCard from './TeamComparisonCard';
import TrendCard from './TrendCard';
import InsightCard from './InsightCard';
import ReasoningCard from './ReasoningCard';
import DeepSignals from './DeepSignals';
import ActionCard from './ActionCard';
import EmptyState from './EmptyState';

const Dashboard = ({ developer, data }) => {
  if (!developer || !data) return <EmptyState />;

  return (
    <div className="flex flex-col gap-6">
      <ProfileCard developer={developer} />
      <NarrativeCard data={data} />
      <IntelligenceCard data={data} />
      <ScorecardCard data={data} />
      <MetricsGrid data={data} />
      <TeamComparisonCard data={data} />
      <TrendCard data={data} />
      <InsightCard data={data} />
      <ReasoningCard data={data} />
      <DeepSignals data={data} />
      <ActionCard data={data} />
    </div>
  );
};

export default Dashboard;
