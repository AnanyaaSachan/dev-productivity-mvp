import React from 'react';
import ProfileCard from './ProfileCard';
import NarrativeCard from './NarrativeCard';
import DecisionScoreCard from './DecisionScoreCard';
import IntelligenceCard from './IntelligenceCard';
import DeepSignals from './DeepSignals';
import ReasoningCard from './ReasoningCard';
import MetricsGrid from './MetricsGrid';
import TeamComparisonCard from './TeamComparisonCard';
import TrendCard from './TrendCard';
import ScorecardCard from './ScorecardCard';
import InsightCard from './InsightCard';
import DrillDownCard from './DrillDownCard';
import ActionCard from './ActionCard';
import EmptyState from './EmptyState';

/*
  Storytelling flow:
  ─────────────────────────────────────────────────────
  1. WHO      → ProfileCard       (context: who is this?)
  2. SUMMARY  → NarrativeCard     (1-line verdict: what's happening overall?)
  3. PROBLEM  → IntelligenceCard  (what is the main problem + confidence?)
  4. WHY      → DeepSignals       (why is it happening — per-metric explanation)
  5. WHY MORE → ReasoningCard     (what do the metric combinations tell us?)
  6. EVIDENCE → MetricsGrid       (the actual numbers with badges)
               TeamComparisonCard (you vs team — is this normal?)
               TrendCard          (is it getting better or worse?)
               ScorecardCard      (weighted risk score breakdown)
  7. PATTERN  → InsightCard       (pattern classification)
  8. DETAILS  → DrillDownCard     (raw PR / bug / deployment data)
  9. ACTIONS  → ActionCard        (what to do next)
  ─────────────────────────────────────────────────────
*/

const Divider = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-white/20" />
    <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">{label}</span>
    <div className="flex-1 h-px bg-white/20" />
  </div>
);

const Dashboard = ({ developer, data }) => {
  if (!developer || !data) return <EmptyState />;

  return (
    <div className="flex flex-col gap-4">

      {/* 1. WHO */}
      <ProfileCard developer={developer} />

      {/* 2. SUMMARY — one line verdict */}
      <Divider label="Summary" />
      <NarrativeCard data={data} />
      <DecisionScoreCard data={data} />

      {/* 3. MAIN PROBLEM */}
      <Divider label="Main Problem" />
      <IntelligenceCard data={data} />

      {/* 4 + 5. WHY IT HAPPENED */}
      <Divider label="Why It Happened" />
      <DeepSignals data={data} />
      <ReasoningCard data={data} />

      {/* 6. EVIDENCE */}
      <Divider label="Evidence" />
      <MetricsGrid data={data} />
      <TeamComparisonCard data={data} />
      <TrendCard data={data} />
      <ScorecardCard data={data} />

      {/* 7. PATTERN */}
      <Divider label="Pattern" />
      <InsightCard data={data} />

      {/* 8. RAW DETAILS */}
      <Divider label="Raw Details" />
      <DrillDownCard data={data} />

      {/* 9. ACTIONS */}
      <Divider label="Actions" />
      <ActionCard data={data} />

    </div>
  );
};

export default Dashboard;
