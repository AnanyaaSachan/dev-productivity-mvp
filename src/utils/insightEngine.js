
import { jiraIssues, pullRequests, deployments, bugReports } from '../data/data';

// ─── Pattern → top-level interpretation ───────────────────────────────────────
export const getInsightData = (metricRow) => {
  if (!metricRow) return null;

  const map = {
    'Healthy flow': {
      icon: '✅',
      title: 'Healthy Flow',
      description:
        'All metrics are within expected ranges. The developer is maintaining a good balance between speed and quality.',
      type: 'healthy',
    },
    'Quality watch': {
      icon: '⚠️',
      title: 'Quality Watch',
      description:
        'A production bug escaped this month. This signals a gap in testing or review coverage that needs attention.',
      type: 'warning',
    },
    'Needs review': {
      icon: '❗',
      title: 'Needs Review',
      description:
        'Cycle time is high and no bugs escaped, but the pace of delivery is slower than expected. The workflow needs a closer look.',
      type: 'critical',
    },
  };

  return map[metricRow.pattern_hint] || map['Needs review'];
};

// ─── Deep "why" signals derived from raw fact tables ──────────────────────────
export const getDeepSignals = (developerId, month) => {
  const signals = [];

  // 1. PR review wait time
  const devPRs = pullRequests.filter(
    (p) => p.developer_id === developerId && p.month === month
  );
  if (devPRs.length > 0) {
    const avgWait =
      devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length;
    if (avgWait > 20) {
      signals.push(
        `Average PR review wait is ${avgWait.toFixed(1)} hours — reviewers are slow to respond, which is adding to lead time.`
      );
    }
    const avgLines =
      devPRs.reduce((s, p) => s + p.lines_changed, 0) / devPRs.length;
    if (avgLines > 500) {
      signals.push(
        `PRs are large on average (${Math.round(avgLines)} lines changed) — bigger PRs are harder to review and more likely to introduce bugs.`
      );
    }
  }

  // 2. Jira issue complexity
  const devIssues = jiraIssues.filter(
    (j) => j.developer_id === developerId && j.month === month
  );
  if (devIssues.length > 0) {
    const highComplexity = devIssues.filter((j) => j.story_points >= 5);
    if (highComplexity.length > 0) {
      signals.push(
        `${highComplexity.length} of ${devIssues.length} issues had high story points (≥5), indicating complex work that naturally takes longer.`
      );
    }
  }

  // 3. Hotfix deployments
  const devDeps = deployments.filter(
    (d) => d.developer_id === developerId && d.month === month
  );
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');
  if (hotfixes.length > 0) {
    signals.push(
      `${hotfixes.length} of ${devDeps.length} deployments were hotfixes — reactive releases suggest issues slipped through before the standard release.`
    );
  }

  // 4. Bug root cause
  const devBugs = bugReports.filter(
    (b) => b.developer_id === developerId && b.month_found === month
  );
  if (devBugs.length > 0) {
    const causes = [...new Set(devBugs.map((b) => b.root_cause_bucket))];
    const severities = devBugs.map((b) => b.severity);
    const hasHigh = severities.includes('high');
    signals.push(
      `Bug root cause${causes.length > 1 ? 's' : ''}: ${causes.join(', ')}${
        hasHigh ? ' — at least one was high severity' : ''
      }.`
    );
  }

  return signals;
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
