import React from 'react';

const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-md p-16 text-center">
        <div className="text-6xl mb-5">📊</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Developer and Month</h3>
        <p className="text-gray-400">Choose a developer and month from the filters above to view their productivity metrics and insights.</p>
    </div>
);

export default EmptyState;
