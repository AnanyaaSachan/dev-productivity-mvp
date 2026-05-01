
import React from 'react';
import { getDeepSignals } from '../utils/insightEngine';

const statusStyles = {
  good: {
    bg:     'bg-green-50',
    border: 'border-green-400',
    dot:    'bg-green-500',
    text:   'text-gray-700',
  },
  warn: {
    bg:     'bg-amber-50',
    border: 'border-amber-400',
    dot:    'bg-amber-500',
    text:   'text-gray-700',
  },
  bad: {
    bg:     'bg-red-50',
    border: 'border-red-400',
    dot:    'bg-red-500',
    text:   'text-gray-700',
  },
};

const DeepSignals = ({ data }) => {
  if (!data) return null;

  const signals = getDeepSignals(data.developer_id, data.month, data);
  if (signals.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Why is this happening?</h3>
      <p className="text-sm text-gray-400 mb-5">
        Each metric explained using PR data, issue complexity, deployments, and bug reports.
      </p>
      <ul className="space-y-3">
        {signals.map((signal, index) => {
          const s = statusStyles[signal.status];
          return (
            <li
              key={index}
              className={`flex items-start gap-3 ${s.bg} border-l-4 ${s.border} rounded-lg px-4 py-3 text-sm ${s.text}`}
            >
              <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
              {signal.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DeepSignals;
