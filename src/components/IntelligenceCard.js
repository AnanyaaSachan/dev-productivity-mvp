
import React from 'react';
import { getIntelligence } from '../utils/insightEngine';

const issueColor = {
  None:       'bg-green-100 text-green-700',
  Quality:    'bg-red-100   text-red-700',
  Speed:      'bg-amber-100 text-amber-700',
  Pipeline:   'bg-amber-100 text-amber-700',
  Review:     'bg-amber-100 text-amber-700',
  Throughput: 'bg-amber-100 text-amber-700',
  Stability:  'bg-red-100   text-red-700',
};

const confidenceColor = {
  High:   'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-gray-100  text-gray-500',
};

const patternColor = {
  'Healthy flow':  'bg-green-100 text-green-700',
  'Quality watch': 'bg-amber-100 text-amber-700',
  'Needs review':  'bg-red-100   text-red-700',
};

const Pill = ({ label, colorClass }) => (
  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colorClass}`}>
    {label}
  </span>
);

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <div>{children}</div>
  </div>
);

const IntelligenceCard = ({ data }) => {
  if (!data) return null;

  const intel = getIntelligence(data);
  if (!intel) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Intelligence Layer</h3>
      <p className="text-sm text-gray-400 mb-5">
        Automated diagnosis based on metric signal weights.
      </p>

      <div className="mb-5">
        <Row label="Primary Issue">
          <Pill label={intel.primaryIssue} colorClass={issueColor[intel.primaryIssue] || issueColor.None} />
        </Row>
        <Row label="Secondary Issue">
          <Pill label={intel.secondaryIssue} colorClass={issueColor[intel.secondaryIssue] || issueColor.None} />
        </Row>
        <Row label="Confidence">
          <Pill label={intel.confidence} colorClass={confidenceColor[intel.confidence]} />
        </Row>
        <Row label="Pattern">
          <Pill label={intel.pattern} colorClass={patternColor[intel.pattern] || patternColor['Needs review']} />
        </Row>
      </div>

      {/* Pattern explanation */}
      <div className="bg-gray-50 rounded-xl px-4 py-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pattern Explanation</p>
        <p className="text-sm text-gray-700 leading-relaxed">{intel.patternReason}</p>
      </div>
    </div>
  );
};

export default IntelligenceCard;
