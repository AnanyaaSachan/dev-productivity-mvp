import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import Dashboard from './components/Dashboard';
import { developers, metrics } from './data/data';

const ViewToggle = ({ mode, onChange }) => (
  <div className="flex items-center justify-center mb-6">
    <div className="bg-white/20 rounded-xl p-1 flex gap-1">
      <button
        onClick={() => onChange('developer')}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          mode === 'developer'
            ? 'bg-white text-purple-700 shadow'
            : 'text-white/80 hover:text-white'
        }`}
      >
        👨‍💻 Developer View
      </button>
      <button
        onClick={() => onChange('manager')}
        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          mode === 'manager'
            ? 'bg-white text-purple-700 shadow'
            : 'text-white/80 hover:text-white'
        }`}
      >
        👩‍💼 Manager View
      </button>
    </div>
  </div>
);

const App = () => {
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedMonth, setSelectedMonth]         = useState('');
  const [viewMode, setViewMode]                   = useState('developer');

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
        {currentData && <ViewToggle mode={viewMode} onChange={setViewMode} />}
        <Dashboard developer={currentDeveloper} data={currentData} viewMode={viewMode} />
      </div>
    </div>
  );
};

export default App;
