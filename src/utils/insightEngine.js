// ============================================
// INSIGHT ENGINE — pattern_hint → interpretation
// ============================================
export const getInsightData = (data) => {
    if (!data) return null;

    const { pattern_hint } = data;

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

// ============================================
// ACTION ENGINE — metrics → recommended actions
// ============================================
export const getRecommendedActions = (data) => {
    if (!data) return [];

    const { bug_rate_pct, avg_cycle_time_days, avg_lead_time_days, pattern_hint } = data;
    const actions = [];

    // Bug rate analysis
    if (bug_rate_pct >= 50) {
        actions.push('Improve test coverage before merging PRs');
        actions.push('Add code review checklist focusing on edge cases');
        actions.push('Implement automated testing for critical paths');
    } else if (bug_rate_pct > 0) {
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

    // Healthy flow fallback
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
