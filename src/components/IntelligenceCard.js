
import React from 'react';
import { getIntelligence } from '../utils/insightEngine';

const issueColor = {
  None:                  'bg-green-100 text-green-700',
  'Quality (Bug Rate)':  'bg-red-100   text-red-700',
  'Speed (Cycle Time)':  'bg-amber-100 text-amber-700',
  'Pipeline (Lead Time)':'bg-amber-100 text-amber-700',
  'Delivery (Deployments)': 'bg-amber-100 text-amber-700',
  'Throughput (PR Count)':  'bg-amber-100 text-amber-700',
};

const secondaryColor = 'bg-orange-100 text-orange-700';

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

  const primaryColorClass = issueColor[intel.primaryIssue] || 'bg-amber-100 text-amber-700';

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Intelligence Layer</h3>
      <p className="text-sm text-gray-400 mb-5">
        Automated diagnosis based on weighted metric scores and raw signal detection.
      </p>

      {/* Core rows */}
      <div className="mb-5">
        <Row label="Primary Issue">
          <Pill label={intel.primaryIssue} colorClass={primaryColorClass} />
        </Row>
        <Row label="Secondary Issue">
          <Pill label={intel.secondaryIssue} colorClass={intel.secondaryIssue === 'None' ? 'bg-green-100 text-green-700' : secondaryColor} />
        </Row>
        <Row label="Confidence">
          <Pill label={intel.confidence} colorClass={confidenceColor[intel.confidence]} />
        </Row>
        <Row label="Pattern">
          <Pill label={intel.pattern} colorClass={patternColor[intel.pattern] || patternColor['Needs review']} />
        </Row>
      </div>

      {/* Pattern explanation */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Pattern Explanation</p>
        <p className="text-sm text-gray-700 leading-relaxed">{intel.patternReason}</p>
      </div>

      {/* Secondary signals — all detected issues */}
      {intel.secondarySignals && intel.secondarySignals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Additional Signals Detected
          </p>
          <div className="flex flex-col gap-2">
            {intel.secondarySignals.map((sig, i) => (
              <div key={i} className="bg-orange-50 border-l-4 border-orange-400 rounded-lg px-4 py-3">
                <p className="text-xs font-bold text-orange-700 mb-1">{sig.label}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{sig.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligenceCard;
