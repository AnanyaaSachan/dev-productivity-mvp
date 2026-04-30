import React from 'react';
import { getInsightData } from '../utils/insightEngine';

const styleMap = {
    healthy: {
        border: 'border-l-green-500',
        bg:     'bg-green-50',
        title:  'text-green-700',
        text:   'text-green-600',
    },
    warning: {
        border: 'border-l-yellow-500',
        bg:     'bg-yellow-50',
        title:  'text-yellow-700',
        text:   'text-yellow-600',
    },
    critical: {
        border: 'border-l-red-500',
        bg:     'bg-red-50',
        title:  'text-red-700',
        text:   'text-red-600',
    },
};

const InsightCard = ({ data }) => {
    if (!data) return null;

    const insight = getInsightData(data);
    if (!insight) return null;

    const s = styleMap[insight.type];

    return (
        <div className={`rounded-2xl shadow-md p-6 border-l-8 ${s.border} ${s.bg}`}>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{insight.icon}</span>
                <h3 className={`text-xl font-bold ${s.title}`}>{insight.title}</h3>
            </div>
            <p className={`text-base leading-relaxed ${s.text}`}>{insight.description}</p>
        </div>
    );
};

export default InsightCard;
