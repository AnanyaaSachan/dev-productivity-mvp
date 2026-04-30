
import React from 'react';
import { getRecommendedActions } from '../utils/insightEngine';

const ActionCard = ({ data }) => {
  if (!data) return null;

  const actions = getRecommendedActions(data, data.developer_id, data.month);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-5">Recommended Actions</h3>
      <ul className="space-y-3">
        {actions.map((action, index) => (
          <li
            key={index}
            className="flex items-start gap-3 bg-gray-50 border-l-4 border-purple-500 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 hover:translate-x-1 transition-all duration-200"
          >
            <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">→</span>
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActionCard;
