import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import Dashboard from './components/Dashboard';
import { developers, metrics } from './data/data';

const App = () => {
    const [selectedDeveloper, setSelectedDeveloper] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    const availableMonths = useMemo(() => {
        if (!selectedDeveloper) return [];
        return [...new Set(
            metrics
                .filter(m => m.developer_id === selectedDeveloper)
                .map(m => m.month)
        )].sort();
    }, [selectedDeveloper]);

    const currentDeveloper = useMemo(() =>
        developers.find(d => d.developer_id === selectedDeveloper) || null,
        [selectedDeveloper]
    );

    const currentData = useMemo(() => {
        if (!selectedDeveloper || !selectedMonth) return null;
        return metrics.find(
            m => m.developer_id === selectedDeveloper && m.month === selectedMonth
        ) || null;
    }, [selectedDeveloper, selectedMonth]);

    const handleDeveloperChange = (id) => {
        setSelectedDeveloper(id);
        setSelectedMonth('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-6">
            <div className="max-w-6xl mx-auto">
                <Header />
                <Filters
                    developers={developers}
                    months={availableMonths}
                    selectedDeveloper={selectedDeveloper}
                    selectedMonth={selectedMonth}
                    onDeveloperChange={handleDeveloperChange}
                    onMonthChange={setSelectedMonth}
                />
                <Dashboard developer={currentDeveloper} data={currentData} />
            </div>
        </div>
    );
};

export default App;
