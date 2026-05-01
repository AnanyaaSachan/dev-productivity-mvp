
import { jiraIssues, pullRequests, deployments, bugReports, developers } from '../data/data';

// ─── Helper: get first name from developer_id ─────────────────────────────────
const getFirstName = (developerId) => {
  const dev = developers.find((d) => d.developer_id === developerId);
  if (!dev) return 'This developer';
  return dev.developer_name.split(' ')[0];
};

// ─── Pattern → personalized, data-driven interpretation ───────────────────────
export const getInsightData = (metricRow) => {
  if (!metricRow) return null;

  const {
    developer_id,
    pattern_hint,
    avg_cycle_time_days,
    avg_lead_time_days,
    bug_rate_pct,
    merged_prs,
    prod_deployments,
    escaped_bugs,
  } = metricRow;

  const name = getFirstName(developer_id);

  // Pull PR data for extra context
  const devPRs = pullRequests.filter(
    (p) => p.developer_id === developer_id && p.month === metricRow.month
  );
  const avgReviewWait =
    devPRs.length > 0
      ? devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length
      : null;

  // Bug root causes for this month
  const devBugs = bugReports.filter(
    (b) => b.developer_id === developer_id && b.month_found === metricRow.month
  );
  const bugCauses = [...new Set(devBugs.map((b) => b.root_cause_bucket))];

  let description = '';
  let type = 'healthy';

  if (pattern_hint === 'Healthy flow') {
    type = 'healthy';
    if (avg_cycle_time_days <= 3 && bug_rate_pct === 0) {
      description = `${name} is in strong form this month — cycle time is low at ${avg_cycle_time_days} days, no bugs escaped to production, and all ${merged_prs} PRs were merged cleanly.`;
    } else if (avg_cycle_time_days > 4 && bug_rate_pct === 0) {
      description = `${name} is delivering reliably with zero production bugs. Cycle time is ${avg_cycle_time_days} days which is slightly elevated, but quality is holding steady.`;
    } else {
      description = `${name} is maintaining a balanced workflow — cycle time is ${avg_cycle_time_days} days, bug rate is ${bug_rate_pct}%, and ${prod_deployments} deployment${prod_deployments !== 1 ? 's' : ''} completed successfully this month.`;
    }
  } else if (pattern_hint === 'Quality watch') {
    type = 'warning';
    const causeText = bugCauses.length > 0 ? ` Root cause: ${bugCauses.join(', ')}.` : '';
    if (avg_cycle_time_days > 5) {
      description = `${name} shipped code this month but ${escaped_bugs} bug${escaped_bugs !== 1 ? 's' : ''} escaped to production and cycle time is high at ${avg_cycle_time_days} days. Both speed and quality need attention.${causeText}`;
    } else {
      description = `${name} is moving at a reasonable pace (cycle time: ${avg_cycle_time_days} days) but ${escaped_bugs} production bug${escaped_bugs !== 1 ? 's' : ''} slipped through, pointing to a gap in testing or review coverage.${causeText}`;
    }
    if (avgReviewWait && avgReviewWait > 20) {
      description += ` PR reviews are also taking an average of ${avgReviewWait.toFixed(1)} hours, which may be reducing the time available for thorough review.`;
    }
  } else if (pattern_hint === 'Needs review') {
    type = 'critical';
    if (avg_cycle_time_days > 6) {
      description = `${name}'s cycle time is ${avg_cycle_time_days} days — significantly above the healthy range. Work is taking too long to complete, which is compressing review and testing time even though no bugs escaped this month.`;
    } else {
      description = `${name}'s workflow shows signs of strain. Cycle time is ${avg_cycle_time_days} days and lead time is ${avg_lead_time_days} days. While no bugs escaped, the delivery pace suggests blockers or scope issues that need to be addressed.`;
    }
    if (avgReviewWait && avgReviewWait > 20) {
      description += ` PR review wait time is ${avgReviewWait.toFixed(1)} hours on average, which is contributing to the slowdown.`;
    }
  }

  const titleMap = {
    healthy: 'Healthy Flow',
    warning: 'Quality Watch',
    critical: 'Needs Review',
  };

  const iconMap = {
    healthy: '✅',
    warning: '⚠️',
    critical: '❗',
  };

  return {
    icon: iconMap[type],
    title: titleMap[type],
    description,
    type,
  };
};

// ─── Deep "why" signals — always present, positive or negative ────────────────
// Each signal has: { text, status } where status = 'good' | 'warn' | 'bad'
export const getDeepSignals = (developerId, month, metricRow) => {
  const signals = [];
  if (!metricRow) return signals;

  const { bug_rate_pct, avg_cycle_time_days, avg_lead_time_days, prod_deployments } = metricRow;

  // 1. Bug rate interpretation
  if (bug_rate_pct === 0) {
    signals.push({ text: 'Bug rate is 0% — no production bugs escaped, indicating good testing practices and thorough code review.', status: 'good' });
  } else if (bug_rate_pct <= 25) {
    signals.push({ text: `Bug rate is ${bug_rate_pct}% — minor quality issues present but mostly under control.`, status: 'warn' });
  } else {
    const devBugs = bugReports.filter((b) => b.developer_id === developerId && b.month_found === month);
    const causes = [...new Set(devBugs.map((b) => b.root_cause_bucket))];
    const causeText = causes.length > 0 ? ` Root cause: ${causes.join(', ')}.` : '';
    signals.push({ text: `Bug rate is ${bug_rate_pct}% — production bugs escaped, pointing to gaps in testing or review coverage.${causeText}`, status: 'bad' });
  }

  // 2. Cycle time interpretation
  if (avg_cycle_time_days <= 3) {
    signals.push({ text: `Cycle time is ${avg_cycle_time_days} days — work is completing quickly, indicating efficient development and minimal blockers.`, status: 'good' });
  } else if (avg_cycle_time_days <= 5) {
    signals.push({ text: `Cycle time is ${avg_cycle_time_days} days — within an acceptable range, though there may be room to reduce task scope or dependencies.`, status: 'warn' });
  } else {
    const devIssues = jiraIssues.filter((j) => j.developer_id === developerId && j.month === month);
    const highComplexity = devIssues.filter((j) => j.story_points >= 5);
    const complexText = highComplexity.length > 0 ? ` ${highComplexity.length} of ${devIssues.length} issues had high story points (≥5), which contributes to longer completion times.` : '';
    signals.push({ text: `Cycle time is ${avg_cycle_time_days} days — above the healthy range, suggesting blockers, large task scope, or complex work.${complexText}`, status: 'bad' });
  }

  // 3. Lead time interpretation
  if (avg_lead_time_days <= 3) {
    signals.push({ text: `Lead time is ${avg_lead_time_days} days — code is moving from PR to production quickly, indicating a smooth release pipeline.`, status: 'good' });
  } else if (avg_lead_time_days <= 4.5) {
    signals.push({ text: `Lead time is ${avg_lead_time_days} days — moderate, but worth monitoring for pipeline delays or approval bottlenecks.`, status: 'warn' });
  } else {
    signals.push({ text: `Lead time is ${avg_lead_time_days} days — elevated, suggesting delays in the deployment pipeline or slow approval gates.`, status: 'bad' });
  }

  // 4. Deployment frequency interpretation
  if (prod_deployments >= 2) {
    signals.push({ text: `Deployment frequency is ${prod_deployments} this month — stable release cadence, indicating consistent delivery.`, status: 'good' });
  } else {
    signals.push({ text: `Only ${prod_deployments} deployment this month — low frequency may indicate delivery bottlenecks or blocked work.`, status: 'warn' });
  }

  // 5. PR review wait time
  const devPRs = pullRequests.filter((p) => p.developer_id === developerId && p.month === month);
  if (devPRs.length > 0) {
    const avgWait = devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length;
    const avgLines = devPRs.reduce((s, p) => s + p.lines_changed, 0) / devPRs.length;

    if (avgWait <= 12) {
      signals.push({ text: `PR review wait averages ${avgWait.toFixed(1)} hours — reviewers are responding promptly, keeping lead time low.`, status: 'good' });
    } else if (avgWait <= 20) {
      signals.push({ text: `PR review wait averages ${avgWait.toFixed(1)} hours — slightly slow, which may be adding to overall lead time.`, status: 'warn' });
    } else {
      signals.push({ text: `PR review wait averages ${avgWait.toFixed(1)} hours — reviewers are slow to respond, directly contributing to higher lead time.`, status: 'bad' });
    }

    if (avgLines > 500) {
      signals.push({ text: `PRs average ${Math.round(avgLines)} lines changed — large PRs are harder to review thoroughly and more likely to introduce bugs.`, status: 'bad' });
    } else {
      signals.push({ text: `PRs average ${Math.round(avgLines)} lines changed — reasonable PR size, making reviews more focused and effective.`, status: 'good' });
    }
  }

  // 6. Hotfix deployments
  const devDeps = deployments.filter((d) => d.developer_id === developerId && d.month === month);
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');
  if (hotfixes.length === 0) {
    signals.push({ text: 'No hotfix deployments this month — all releases were planned, indicating stable and predictable delivery.', status: 'good' });
  } else {
    signals.push({ text: `${hotfixes.length} of ${devDeps.length} deployments were hotfixes — reactive releases suggest issues slipped through before the standard release cycle.`, status: 'bad' });
  }

  return signals;
};

// ─── Team averages for a given month ─────────────────────────────────────────
import { metrics as allMetrics } from '../data/data';

export const getTeamAverages = (teamName, month) => {
  const teamRows = allMetrics.filter(
    (m) => m.team_name === teamName && m.month === month
  );
  if (teamRows.length === 0) return null;

  const avg = (key) =>
    teamRows.reduce((s, r) => s + r[key], 0) / teamRows.length;

  return {
    avg_cycle_time_days:  parseFloat(avg('avg_cycle_time_days').toFixed(1)),
    avg_lead_time_days:   parseFloat(avg('avg_lead_time_days').toFixed(1)),
    merged_prs:           parseFloat(avg('merged_prs').toFixed(1)),
    prod_deployments:     parseFloat(avg('prod_deployments').toFixed(1)),
    bug_rate_pct:         parseFloat(avg('bug_rate_pct').toFixed(1)),
  };
};

// ─── Month-over-month trend for a developer ───────────────────────────────────
export const getPreviousMonthData = (developerId, currentMonth) => {
  const sorted = allMetrics
    .filter((m) => m.developer_id === developerId && m.month < currentMonth)
    .sort((a, b) => b.month.localeCompare(a.month));
  return sorted[0] || null;
};

// ─── Metric evaluation — returns { label, color } for each metric ─────────────
export const evaluateMetrics = (metricRow) => {
  if (!metricRow) return {};

  const { avg_cycle_time_days, avg_lead_time_days, merged_prs, prod_deployments, bug_rate_pct } = metricRow;

  const badge = (label, color) => ({ label, color });

  return {
    cycle_time:
      avg_cycle_time_days <= 3   ? badge('Excellent', 'green') :
      avg_cycle_time_days <= 5   ? badge('Good',      'green') :
      avg_cycle_time_days <= 7   ? badge('At Risk',   'amber') :
                                   badge('Critical',  'red'),

    lead_time:
      avg_lead_time_days <= 2.5  ? badge('Excellent', 'green') :
      avg_lead_time_days <= 4    ? badge('Good',      'green') :
      avg_lead_time_days <= 5.5  ? badge('At Risk',   'amber') :
                                   badge('Critical',  'red'),

    merged_prs:
      merged_prs >= 3            ? badge('High',      'green') :
      merged_prs === 2           ? badge('Normal',    'green') :
                                   badge('Low',       'amber'),

    prod_deployments:
      prod_deployments >= 3      ? badge('High',      'green') :
      prod_deployments === 2     ? badge('Stable',    'green') :
                                   badge('Low',       'amber'),

    bug_rate:
      bug_rate_pct === 0         ? badge('Excellent', 'green') :
      bug_rate_pct <= 25         ? badge('Acceptable','amber') :
                                   badge('High Risk', 'red'),
  };
};

// ─── Action recommendations ────────────────────────────────────────────────────
export const getRecommendedActions = (metricRow, developerId, month) => {
  if (!metricRow) return [];

  const { bug_rate_pct, avg_cycle_time_days, avg_lead_time_days, pattern_hint } = metricRow;
  const actions = [];

  // Bug quality actions
  if (bug_rate_pct >= 50) {
    const devBugs = bugReports.filter(
      (b) => b.developer_id === developerId && b.month_found === month
    );
    const causes = [...new Set(devBugs.map((b) => b.root_cause_bucket))];
    if (causes.includes('test gap')) {
      actions.push('Add unit and integration tests for the areas where bugs escaped.');
    }
    if (causes.includes('edge case')) {
      actions.push('Review edge cases during design — add them explicitly to acceptance criteria.');
    }
    if (causes.includes('release config')) {
      actions.push('Audit release configuration and add a pre-deploy config validation step.');
    }
    actions.push('Reduce PR size so reviewers can catch issues more easily.');
  }

  // Cycle time actions
  if (avg_cycle_time_days > 5) {
    actions.push('Break down large tickets into smaller sub-tasks to reduce time in progress.');
    actions.push('Identify blockers early in the sprint and escalate them quickly.');
  } else if (avg_cycle_time_days > 4) {
    actions.push('Monitor ticket complexity during sprint planning and flag high-point items.');
  }

  // Lead time / PR wait actions
  const devPRs = pullRequests.filter(
    (p) => p.developer_id === developerId && p.month === month
  );
  if (devPRs.length > 0) {
    const avgWait =
      devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length;
    if (avgWait > 20) {
      actions.push('Agree on a team SLA for PR reviews (e.g. first review within 4 hours).');
    }
  }

  if (avg_lead_time_days > 4) {
    actions.push('Streamline the deployment pipeline — look for manual approval gates that can be automated.');
  }

  // Hotfix pattern
  const devDeps = deployments.filter(
    (d) => d.developer_id === developerId && d.month === month
  );
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');
  if (hotfixes.length >= 1) {
    actions.push('Investigate why hotfixes were needed and add regression tests to prevent recurrence.');
  }

  // Healthy flow fallback
  if (pattern_hint === 'Healthy flow' && actions.length === 0) {
    actions.push('Maintain current workflow and practices.');
    actions.push('Share your process with teammates as a reference.');
    actions.push('Consider taking on a mentoring or code-review ownership role.');
  }

  return actions;
};
