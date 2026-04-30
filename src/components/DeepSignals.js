
import React from 'react';
import { getDeepSignals } from '../utils/insightEngine';

const DeepSignals = ({ data }) => {
  if (!data) return null;

  const signals = getDeepSignals(data.developer_id, data.month);
  if (signals.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Why is this happening?</h3>
      <p className="text-sm text-gray-400 mb-5">
        Signals derived from PR data, issue complexity, deployments, and bug reports.
      </p>
      <ul className="space-y-3">
        {signals.map((signal, index) => (
          <li
            key={index}
            className="flex items-start gap-3 bg-amber-50 border-l-4 border-amber-400 rounded-lg px-4 py-3 text-gray-700 text-sm"
          >
            <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">!</span>
            {signal}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeepSignals;
