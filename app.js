const { useState, useMemo } = React;

const getInsightData = (data) => {
    if (!data) return null;

    const { pattern_hint, bug_rate_pct, avg_cycle_time_days, avg_lead_time_days } = data;

    // Pattern-based insights
    const insights = {
        'Healthy flow': {
            icon: '✅',
            title: 'Healthy Flow',
            description: 'All metrics are within expected ranges. The developer is maintaining a good balance between speed and quality.',
            type: 'healthy'
        },
        'Quality watch': {
            icon: '⚠️',
            title: 'Quality Watch',
            description: 'High bug rate detected. This indicates potential quality issues in development or testing processes that need attention.',
            type: 'warning'
        },
        'Needs review': {
            icon: '❗',
            title: 'Needs Review',
            description: 'Multiple metrics are outside normal ranges. A comprehensive review of the development workflow is recommended.',
            type: 'critical'
        }
    };

    return insights[pattern_hint] || insights['Needs review'];
};

const getRecommendedActions = (data) => {
    if (!data) return [];

    const { bug_rate_pct, avg_cycle_time_days, avg_lead_time_days, pattern_hint } = data;
    const actions = [];

    // Bug rate analysis
    if (bug_rate_pct >= 50) {
        actions.push('Improve test coverage before merging PRs');
        actions.push('Add code review checklist focusing on edge cases');
        actions.push('Implement automated testing for critical paths');
    } else if (bug_rate_pct > 0 && bug_rate_pct < 50) {
        actions.push('Continue current testing practices');
        actions.push('Document common bug patterns for team learning');
    }

    // Cycle time analysis
    if (avg_cycle_time_days > 5) {
        actions.push('Break down large tasks into smaller, manageable pieces');
        actions.push('Identify and remove blockers in the development process');
        actions.push('Consider pair programming for complex features');
    } else if (avg_cycle_time_days > 4) {
        actions.push('Monitor task complexity and adjust sprint planning');
    }

    // Lead time analysis
    if (avg_lead_time_days > 4) {
        actions.push('Streamline deployment pipeline to reduce lead time');
        actions.push('Reduce dependencies between features');
        actions.push('Implement continuous deployment practices');
    }

    // Pattern-specific actions
    if (pattern_hint === 'Healthy flow' && actions.length === 0) {
        actions.push('Maintain current workflow and practices');
        actions.push('Share best practices with team members');
        actions.push('Consider mentoring junior developers');
    }

    if (pattern_hint === 'Needs review') {
        actions.push('Schedule 1-on-1 with manager to discuss workflow');
        actions.push('Review recent sprint retrospectives for patterns');
    }

    return actions;
};



const Header = () => (
    <div className="header">
        <h1>🚀 Developer Productivity Dashboard</h1>
        <p>Transform metrics into actionable insights</p>
    </div>
);


const Filters = ({ developers, months, selectedDeveloper, selectedMonth, onDeveloperChange, onMonthChange }) => (
    <div className="filters">
        <div className="filter-group">
            <label htmlFor="developer-select">Select Developer</label>
            <select 
                id="developer-select"
                value={selectedDeveloper} 
                onChange={(e) => onDeveloperChange(e.target.value)}
            >
                <option value="">-- Choose a developer --</option>
                {developers.map(dev => (
                    <option key={dev.developer_id} value={dev.developer_id}>
                        {dev.developer_name} ({dev.developer_id})
                    </option>
                ))}
            </select>
        </div>
        <div className="filter-group">
            <label htmlFor="month-select">Select Month</label>
            <select 
                id="month-select"
                value={selectedMonth} 
                onChange={(e) => onMonthChange(e.target.value)}
                disabled={!selectedDeveloper}
            >
                <option value="">-- Choose a month --</option>
                {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
        </div>
    </div>
);


const ProfileCard = ({ developer }) => {
    if (!developer) return null;

    const initials = developer.developer_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

    return (
        <div className="profile-card">
            <div className="profile-icon">{initials}</div>
            <div className="profile-info">
                <h2>{developer.developer_name}</h2>
                <div className="profile-details">
                    <div className="profile-detail">
                        <span className="profile-detail-label">Team</span>
                        <span className="profile-detail-value">{developer.team_name}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="profile-detail-label">Manager</span>
                        <span className="profile-detail-value">{developer.manager_name}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="profile-detail-label">Role</span>
                        <span className="profile-detail-value">{developer.service_type}</span>
                    </div>
                    <div className="profile-detail">
                        <span className="profile-detail-label">Level</span>
                        <span className="profile-detail-value">{developer.level}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const MetricCard = ({ label, value, unit }) => (
    <div className="metric-card">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        {unit && <div className="metric-unit">{unit}</div>}
    </div>
);

// Metrics Grid Component
const MetricsGrid = ({ data }) => {
    if (!data) return null;

    return (
        <div className="metrics-grid">
            <MetricCard 
                label="Lead Time" 
                value={data.avg_lead_time_days.toFixed(1)} 
                unit="days" 
            />
            <MetricCard 
                label="Cycle Time" 
                value={data.avg_cycle_time_days.toFixed(1)} 
                unit="days" 
            />
            <MetricCard 
                label="PR Throughput" 
                value={data.merged_prs} 
                unit="merged PRs" 
            />
            <MetricCard 
                label="Deployment Frequency" 
                value={data.prod_deployments} 
                unit="deployments" 
            />
            <MetricCard 
                label="Bug Rate" 
                value={`${data.bug_rate_pct.toFixed(1)}%`} 
                unit="" 
            />
        </div>
    );
};

// Insight Card Component
const InsightCard = ({ data }) => {
    if (!data) return null;

    const insight = getInsightData(data);
    if (!insight) return null;

    return (
        <div className={`insight-card ${insight.type}`}>
            <div className="insight-header">
                <span className="insight-icon">{insight.icon}</span>
                <h3 className="insight-title">{insight.title}</h3>
            </div>
            <p className="insight-description">{insight.description}</p>
        </div>
    );
};

// Action Card Component
const ActionCard = ({ data }) => {
    if (!data) return null;

    const actions = getRecommendedActions(data);

    return (
        <div className="action-card">
            <h3>🎯 Recommended Actions</h3>
            <ul className="action-list">
                {actions.map((action, index) => (
                    <li key={index} className="action-item">
                        {action}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Empty State Component
const EmptyState = () => (
    <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>Select a Developer and Month</h3>
        <p>Choose a developer and month from the filters above to view their productivity metrics and insights.</p>
    </div>
);

// Dashboard Component
const Dashboard = ({ developer, data }) => {
    if (!developer || !data) {
        return <EmptyState />;
    }

    return (
        <div className="dashboard">
            <ProfileCard developer={developer} />
            <MetricsGrid data={data} />
            <InsightCard data={data} />
            <ActionCard data={data} />
        </div>
    );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
const App = () => {
    const [selectedDeveloper, setSelectedDeveloper] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    // Get unique developers
    const developers = useMemo(() => {
        return window.developersData || [];
    }, []);

    // Get available months for selected developer
    const availableMonths = useMemo(() => {
        if (!selectedDeveloper) return [];
        
        const devMetrics = window.metricsData.filter(
            m => m.developer_id === selectedDeveloper
        );
        
        return [...new Set(devMetrics.map(m => m.month))].sort();
    }, [selectedDeveloper]);

    // Get current developer info
    const currentDeveloper = useMemo(() => {
        if (!selectedDeveloper) return null;
        return developers.find(d => d.developer_id === selectedDeveloper);
    }, [selectedDeveloper, developers]);

    // Get current metric data
    const currentData = useMemo(() => {
        if (!selectedDeveloper || !selectedMonth) return null;
        
        return window.metricsData.find(
            m => m.developer_id === selectedDeveloper && m.month === selectedMonth
        );
    }, [selectedDeveloper, selectedMonth]);

    // Handle developer change
    const handleDeveloperChange = (developerId) => {
        setSelectedDeveloper(developerId);
        setSelectedMonth(''); // Reset month when developer changes
    };

    return (
        <div className="app">
            <Header />
            <Filters 
                developers={developers}
                months={availableMonths}
                selectedDeveloper={selectedDeveloper}
                selectedMonth={selectedMonth}
                onDeveloperChange={handleDeveloperChange}
                onMonthChange={setSelectedMonth}
            />
            <Dashboard 
                developer={currentDeveloper}
                data={currentData}
            />
        </div>
    );
};

// ============================================
// RENDER APP
// ============================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
