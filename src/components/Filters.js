import React from 'react';

const Filters = ({ developers, months, selectedDeveloper, selectedMonth, onDeveloperChange, onMonthChange }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-8 flex flex-wrap gap-6">
        <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
                Select Developer
            </label>
            <select
                value={selectedDeveloper}
                onChange={(e) => onDeveloperChange(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
                <option value="">-- Choose a developer --</option>
                {developers.map(dev => (
                    <option key={dev.developer_id} value={dev.developer_id}>
                        {dev.developer_name} ({dev.developer_id})
                    </option>
                ))}
            </select>
        </div>

        <div className="flex-1 min-w-[240px]">
            <label className="block text-sm font-semibold text-gray-600 mb-2">
                Select Month
            </label>
            <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                disabled={!selectedDeveloper}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:border-purple-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="">-- Choose a month --</option>
                {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
        </div>
    </div>
);

export default Filters;
