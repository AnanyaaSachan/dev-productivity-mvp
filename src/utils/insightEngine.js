
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

// ─── Decision Narrative — one paragraph story summarising the developer ───────
export const getNarrative = (metricRow) => {
  if (!metricRow) return null;

  const {
    developer_id, month,
    pattern_hint, bug_rate_pct,
    avg_cycle_time_days, avg_lead_time_days,
    prod_deployments, escaped_bugs,
  } = metricRow;

  const name = getFirstName(developer_id);

  // Collect risk signals
  const risks = [];
  const strengths = [];

  if (bug_rate_pct === 0)        strengths.push('zero production bugs');
  else if (bug_rate_pct >= 50)   risks.push(`a ${bug_rate_pct}% bug rate`);

  if (avg_cycle_time_days <= 4)  strengths.push(`efficient cycle time (${avg_cycle_time_days} days)`);
  else if (avg_cycle_time_days > 6) risks.push(`slow cycle time (${avg_cycle_time_days} days)`);

  if (avg_lead_time_days <= 3.5) strengths.push(`fast lead time (${avg_lead_time_days} days)`);
  else if (avg_lead_time_days > 5) risks.push(`high lead time (${avg_lead_time_days} days)`);

  const devDeps = deployments.filter(
    (d) => d.developer_id === developer_id && d.month === month
  );
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');
  if (hotfixes.length === 0 && prod_deployments >= 2) strengths.push('stable planned deployments');
  if (hotfixes.length >= 2) risks.push(`${hotfixes.length} hotfix deployments`);

  const devPRs = pullRequests.filter(
    (p) => p.developer_id === developer_id && p.month === month
  );
  if (devPRs.length > 0) {
    const avgWait = devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length;
    if (avgWait > 20) risks.push(`slow PR review wait (${avgWait.toFixed(1)} hrs)`);
    else if (avgWait <= 12) strengths.push('fast PR reviews');
  }

  // Build narrative sentence
  let narrative = '';

  if (pattern_hint === 'Healthy flow') {
    if (risks.length === 0) {
      narrative = `${name} is performing efficiently this month with ${strengths.join(', ')}. No immediate risks detected — this is a strong, consistent delivery period.`;
    } else {
      narrative = `${name} is largely on track with ${strengths.join(', ')}, though there are minor concerns around ${risks.join(' and ')} that are worth monitoring.`;
    }
  } else if (pattern_hint === 'Quality watch') {
    const riskText = risks.length > 0 ? risks.join(' and ') : `${escaped_bugs} escaped bug${escaped_bugs !== 1 ? 's' : ''}`;
    if (strengths.length > 0) {
      narrative = `${name} is delivering at a reasonable pace — ${strengths.join(', ')} — but quality needs attention due to ${riskText}. Addressing the root cause now will prevent this from becoming a recurring pattern.`;
    } else {
      narrative = `${name} has quality concerns this month with ${riskText}. Both delivery speed and testing coverage need to be reviewed before the next sprint.`;
    }
  } else if (pattern_hint === 'Needs review') {
    if (strengths.length > 0) {
      narrative = `${name} has some positives — ${strengths.join(', ')} — but the overall workflow is under strain due to ${risks.join(' and ')}. A focused conversation with the manager is recommended to identify and remove blockers.`;
    } else {
      narrative = `${name}'s workflow needs immediate attention. ${risks.length > 0 ? `Key concerns include ${risks.join(' and ')}.` : 'Multiple metrics are outside healthy ranges.'} This pattern, if unaddressed, will impact team delivery.`;
    }
  }

  return narrative;
};

// ─── Trend intelligence — time dimension analysis ────────────────────────────
export const getTrendIntelligence = (metricRow) => {
  if (!metricRow) return null;

  const prev = getPreviousMonthData(metricRow.developer_id, metricRow.month);
  if (!prev) return null;

  const name = getFirstName(metricRow.developer_id);

  const metrics_to_check = [
    {
      key:           'bug_rate_pct',
      label:         'Bug Rate',
      current:       metricRow.bug_rate_pct,
      previous:      prev.bug_rate_pct,
      lowerIsBetter: true,
      unit:          '%',
      threshold:     5,
    },
    {
      key:           'avg_cycle_time_days',
      label:         'Cycle Time',
      current:       metricRow.avg_cycle_time_days,
      previous:      prev.avg_cycle_time_days,
      lowerIsBetter: true,
      unit:          ' days',
      threshold:     0.5,
    },
    {
      key:           'avg_lead_time_days',
      label:         'Lead Time',
      current:       metricRow.avg_lead_time_days,
      previous:      prev.avg_lead_time_days,
      lowerIsBetter: true,
      unit:          ' days',
      threshold:     0.5,
    },
    {
      key:           'merged_prs',
      label:         'PR Throughput',
      current:       metricRow.merged_prs,
      previous:      prev.merged_prs,
      lowerIsBetter: false,
      unit:          '',
      threshold:     1,
    },
    {
      key:           'prod_deployments',
      label:         'Deployments',
      current:       metricRow.prod_deployments,
      previous:      prev.prod_deployments,
      lowerIsBetter: false,
      unit:          '',
      threshold:     1,
    },
  ];

  const trends = metrics_to_check.map(({ label, current, previous, lowerIsBetter, unit, threshold }) => {
    const diff   = current - previous;
    const absDiff = Math.abs(diff);

    if (absDiff < threshold) {
      return { label, current, previous, unit, direction: 'stable', icon: '➖', color: 'gray',  text: 'Stable',     reasoning: `${label} is unchanged from last month (${previous}${unit} → ${current}${unit}).` };
    }

    const improved = lowerIsBetter ? diff < 0 : diff > 0;

    // Classify magnitude
    const pctChange = previous !== 0 ? (absDiff / previous) * 100 : 100;
    const sharp = pctChange >= 30;

    if (improved) {
      const magnitude = sharp ? 'significantly improved' : 'improved';
      return {
        label, current, previous, unit,
        direction: 'improving',
        icon:      '📈',
        color:     'green',
        text:      sharp ? 'Improving fast' : 'Improving',
        reasoning: `${label} ${magnitude} from ${previous}${unit} to ${current}${unit}${sharp ? ' — a strong positive signal' : ''}.`,
      };
    } else {
      const magnitude = sharp ? 'deteriorated sharply' : 'declined';
      const regressionNote = label === 'Bug Rate' && sharp
        ? ' This looks like a recent regression — investigate what changed.'
        : label === 'Cycle Time' && sharp
        ? ' Work is taking significantly longer — check for new blockers or scope creep.'
        : '';
      return {
        label, current, previous, unit,
        direction: 'declining',
        icon:      '📉',
        color:     'red',
        text:      sharp ? 'Declining fast' : 'Declining',
        reasoning: `${label} ${magnitude} from ${previous}${unit} to ${current}${unit}.${regressionNote}`,
      };
    }
  });

  // Overall verdict
  const improving = trends.filter((t) => t.direction === 'improving').length;
  const declining = trends.filter((t) => t.direction === 'declining').length;

  let overallVerdict, overallColor, overallIcon;
  if (declining === 0 && improving >= 2) {
    overallVerdict = `${name} is on an upward trajectory this month — multiple metrics improved compared to last month.`;
    overallColor   = 'green';
    overallIcon    = '📈';
  } else if (improving === 0 && declining >= 2) {
    overallVerdict = `${name}'s performance is declining across multiple metrics — this trend needs attention before it becomes a pattern.`;
    overallColor   = 'red';
    overallIcon    = '📉';
  } else if (declining >= 1 && improving === 0) {
    overallVerdict = `${name} has a declining signal in ${trends.filter(t => t.direction === 'declining').map(t => t.label).join(' and ')} — worth monitoring closely.`;
    overallColor   = 'red';
    overallIcon    = '📉';
  } else if (improving >= 1 && declining === 0) {
    overallVerdict = `${name} is showing improvement in ${trends.filter(t => t.direction === 'improving').map(t => t.label).join(' and ')} with no declining signals.`;
    overallColor   = 'green';
    overallIcon    = '📈';
  } else {
    overallVerdict = `${name}'s metrics are mixed — some areas improving, others declining. Focus on the declining signals first.`;
    overallColor   = 'amber';
    overallIcon    = '↔️';
  }

  return { trends, overallVerdict, overallColor, overallIcon, prevMonth: prev.month };
};

// ─── Team comparison — dev vs team avg with multiplier and verdict ────────────
export const getTeamComparison = (metricRow) => {
  if (!metricRow) return null;

  const { team_name, month, avg_cycle_time_days, avg_lead_time_days,
          merged_prs, prod_deployments, bug_rate_pct } = metricRow;

  const teamAvg = getTeamAverages(team_name, month);
  if (!teamAvg) return null;

  const compare = (devVal, teamVal, lowerIsBetter, label, unit) => {
    if (teamVal === 0) return null;
    const ratio  = devVal / teamVal;
    const diff   = devVal - teamVal;
    const better = lowerIsBetter ? diff < -0.1 : diff > 0.1;
    const worse  = lowerIsBetter ? diff > 0.1  : diff < -0.1;

    let verdict, color;
    if (better)            { verdict = 'Better than team'; color = 'green'; }
    else if (worse)        { verdict = 'Worse than team';  color = 'red';   }
    else                   { verdict = 'On par with team'; color = 'gray';  }

    // Multiplier text e.g. "1.5x higher" or "0.8x lower"
    let multiplierText = '';
    if (ratio >= 1.1 || ratio <= 0.9) {
      const x = ratio.toFixed(1);
      const dir = lowerIsBetter
        ? (ratio > 1 ? 'higher' : 'lower')
        : (ratio > 1 ? 'higher' : 'lower');
      multiplierText = `${x}x ${dir} than team`;
    }

    return {
      label,
      devVal:  `${devVal}${unit}`,
      teamVal: `${teamVal}${unit}`,
      verdict,
      color,
      multiplierText,
    };
  };

  return [
    compare(avg_cycle_time_days,  teamAvg.avg_cycle_time_days,  true,  'Cycle Time',            ' days'),
    compare(avg_lead_time_days,   teamAvg.avg_lead_time_days,   true,  'Lead Time',             ' days'),
    compare(merged_prs,           teamAvg.merged_prs,           false, 'PR Throughput',         ''),
    compare(prod_deployments,     teamAvg.prod_deployments,     false, 'Deployment Frequency',  ''),
    compare(bug_rate_pct,         teamAvg.bug_rate_pct,         true,  'Bug Rate',              '%'),
  ].filter(Boolean);
};

// ─── Pattern Detection Engine ─────────────────────────────────────────────────
export const detectPattern = (metricRow) => {
  if (!metricRow) return null;

  const {
    developer_id, month,
    bug_rate_pct, avg_cycle_time_days, avg_lead_time_days,
    merged_prs, prod_deployments,
  } = metricRow;

  const devPRs   = pullRequests.filter((p) => p.developer_id === developer_id && p.month === month);
  const avgLines = devPRs.length > 0 ? devPRs.reduce((s, p) => s + p.lines_changed, 0) / devPRs.length : 0;
  const avgWait  = devPRs.length > 0 ? devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length : 0;

  const devDeps  = deployments.filter((d) => d.developer_id === developer_id && d.month === month);
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');

  const devBugs  = bugReports.filter((b) => b.developer_id === developer_id && b.month_found === month);
  const hasHighSeverity = devBugs.some((b) => b.severity === 'high');

  // ── Signal flags ─────────────────────────────────────────────────────────
  const fastCycle   = avg_cycle_time_days <= 3.5;
  const normalCycle = avg_cycle_time_days > 3.5 && avg_cycle_time_days <= 5;
  const slowCycle   = avg_cycle_time_days > 5;
  const fastLead    = avg_lead_time_days <= 3;
  const highLead    = avg_lead_time_days > 4.5;
  const zeroBug     = bug_rate_pct === 0;
  const highBug     = bug_rate_pct >= 50;
  const highOutput  = merged_prs >= 3 || prod_deployments >= 3;
  const lowOutput   = merged_prs <= 1 && prod_deployments <= 1;
  const largePRs    = avgLines > 500;
  const slowReview  = avgWait > 20;
  const hasHotfix   = hotfixes.length > 0;

  // ── Pattern matching — ordered by specificity ─────────────────────────────
  const patterns = [];

  // Fast but risky
  if (fastCycle && highBug) {
    patterns.push({
      name:        'Fast but Risky',
      icon:        '⚡',
      color:       'amber',
      description: `Cycle time is low (${avg_cycle_time_days} days) but bug rate is ${bug_rate_pct}% — moving fast at the cost of quality. Speed without testing discipline creates production risk.`,
      signals:     [`Cycle time: ${avg_cycle_time_days} days`, `Bug rate: ${bug_rate_pct}%`],
    });
  }

  // Slow but stable
  if (slowCycle && zeroBug && !hasHotfix) {
    patterns.push({
      name:        'Slow but Stable',
      icon:        '🐢',
      color:       'blue',
      description: `Cycle time is ${avg_cycle_time_days} days — above the healthy range — but zero bugs escaped and all releases were planned. Thorough but needs to pick up pace.`,
      signals:     [`Cycle time: ${avg_cycle_time_days} days`, 'Bug rate: 0%', 'No hotfixes'],
    });
  }

  // High output, low quality
  if (highOutput && highBug) {
    patterns.push({
      name:        'High Output, Low Quality',
      icon:        '📦',
      color:       'red',
      description: `High throughput (${merged_prs} PRs, ${prod_deployments} deployments) but ${bug_rate_pct}% bug rate — shipping a lot but quality is not keeping up with the pace.`,
      signals:     [`${merged_prs} merged PRs`, `${prod_deployments} deployments`, `Bug rate: ${bug_rate_pct}%`],
    });
  }

  // Consistent performer
  if (!slowCycle && zeroBug && !hasHotfix && fastLead) {
    patterns.push({
      name:        'Consistent Performer',
      icon:        '🎯',
      color:       'green',
      description: `Cycle time, lead time, and quality are all healthy. ${avg_cycle_time_days} day cycle, ${avg_lead_time_days} day lead time, zero bugs — this is the target state.`,
      signals:     [`Cycle time: ${avg_cycle_time_days} days`, `Lead time: ${avg_lead_time_days} days`, 'Bug rate: 0%'],
    });
  }

  // Pipeline bottleneck
  if (normalCycle && highLead && !highBug) {
    patterns.push({
      name:        'Pipeline Bottleneck',
      icon:        '🚧',
      color:       'amber',
      description: `Development is on track (cycle time: ${avg_cycle_time_days} days) but lead time is ${avg_lead_time_days} days — code is ready but stuck in the deployment pipeline.`,
      signals:     [`Cycle time: ${avg_cycle_time_days} days`, `Lead time: ${avg_lead_time_days} days`],
    });
  }

  // Review bottleneck
  if (slowReview && highLead) {
    patterns.push({
      name:        'Review Bottleneck',
      icon:        '🔍',
      color:       'amber',
      description: `PR review wait is ${avgWait.toFixed(1)} hours on average — reviewers are slow to respond, which is the primary driver of the ${avg_lead_time_days} day lead time.`,
      signals:     [`Review wait: ${avgWait.toFixed(1)}h`, `Lead time: ${avg_lead_time_days} days`],
    });
  }

  // Large PR risk
  if (largePRs && highBug) {
    patterns.push({
      name:        'Large PR Risk',
      icon:        '📋',
      color:       'red',
      description: `PRs average ${Math.round(avgLines)} lines — too large for effective review. Combined with ${bug_rate_pct}% bug rate, this suggests reviewers are missing issues in oversized PRs.`,
      signals:     [`Avg PR size: ${Math.round(avgLines)} lines`, `Bug rate: ${bug_rate_pct}%`],
    });
  }

  // Reactive delivery
  if (hasHotfix && highBug) {
    patterns.push({
      name:        'Reactive Delivery',
      icon:        '🚨',
      color:       'red',
      description: `${hotfixes.length} hotfix deployment${hotfixes.length > 1 ? 's' : ''} alongside a ${bug_rate_pct}% bug rate — the team is in a fix-and-ship cycle instead of a plan-build-ship cycle.`,
      signals:     [`${hotfixes.length} hotfixes`, `Bug rate: ${bug_rate_pct}%`],
    });
  }

  // High severity risk
  if (hasHighSeverity) {
    patterns.push({
      name:        'High Severity Risk',
      icon:        '🔴',
      color:       'red',
      description: `A high severity bug escaped to production this month. This is the most critical signal — high severity bugs directly impact users and require immediate post-mortem.`,
      signals:     ['High severity bug in production'],
    });
  }

  // Low output
  if (lowOutput && !slowCycle) {
    patterns.push({
      name:        'Low Throughput',
      icon:        '📉',
      color:       'amber',
      description: `Only ${merged_prs} PR${merged_prs !== 1 ? 's' : ''} merged and ${prod_deployments} deployment${prod_deployments !== 1 ? 's' : ''} this month despite reasonable cycle time — output is lower than expected.`,
      signals:     [`${merged_prs} merged PRs`, `${prod_deployments} deployments`],
    });
  }

  // Fallback if no specific pattern matched
  if (patterns.length === 0) {
    patterns.push({
      name:        'Stable Workflow',
      icon:        '✅',
      color:       'green',
      description: `No specific risk pattern detected. Metrics are within acceptable ranges across speed, quality, and stability.`,
      signals:     [`Cycle time: ${avg_cycle_time_days} days`, `Bug rate: ${bug_rate_pct}%`, `Lead time: ${avg_lead_time_days} days`],
    });
  }

  return patterns;
};

// ─── Decision Score — overall health score 0-100 (higher = healthier) ─────────
export const getDecisionScore = (metricRow) => {
  if (!metricRow) return null;

  const {
    developer_id, month,
    bug_rate_pct, avg_cycle_time_days, avg_lead_time_days,
    prod_deployments, merged_prs,
  } = metricRow;

  const devDeps  = deployments.filter((d) => d.developer_id === developer_id && d.month === month);
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');
  const devBugs  = bugReports.filter((b) => b.developer_id === developer_id && b.month_found === month);
  const hasHighSeverity = devBugs.some((b) => b.severity === 'high');

  // ── Quality score (0-100, higher = better) ──────────────────────────────
  // Based on: bug rate, bug severity
  let qualityScore = 100;
  qualityScore -= bug_rate_pct * 0.8;           // 50% bug rate → -40
  if (hasHighSeverity) qualityScore -= 15;       // high severity bug → -15
  qualityScore = Math.max(0, Math.round(qualityScore));

  // ── Speed score (0-100, higher = better) ────────────────────────────────
  // Based on: cycle time, lead time
  let speedScore = 100;
  if (avg_cycle_time_days > 2)  speedScore -= (avg_cycle_time_days - 2) * 8;
  if (avg_lead_time_days > 1.5) speedScore -= (avg_lead_time_days - 1.5) * 6;
  speedScore = Math.max(0, Math.round(speedScore));

  // ── Stability score (0-100, higher = better) ─────────────────────────────
  // Based on: hotfixes, deployment frequency, PR throughput
  let stabilityScore = 100;
  stabilityScore -= hotfixes.length * 20;        // each hotfix → -20
  if (prod_deployments < 2) stabilityScore -= 15;
  if (merged_prs < 2)       stabilityScore -= 10;
  stabilityScore = Math.max(0, Math.round(stabilityScore));

  // ── Overall: weighted average ────────────────────────────────────────────
  // Quality matters most (50%), Speed (30%), Stability (20%)
  const overall = Math.round(
    qualityScore * 0.5 +
    speedScore   * 0.3 +
    stabilityScore * 0.2
  );

  const getLabel = (score) =>
    score >= 85 ? { label: 'Excellent', icon: '✅', color: 'green' } :
    score >= 70 ? { label: 'Good',      icon: '✅', color: 'green' } :
    score >= 50 ? { label: 'Moderate',  icon: '⚠️', color: 'amber' } :
    score >= 30 ? { label: 'At Risk',   icon: '⚠️', color: 'red'   } :
                  { label: 'Critical',  icon: '🔴', color: 'red'   };

  return {
    overall,
    overallMeta: getLabel(overall),
    dimensions: [
      { label: 'Quality',   score: qualityScore,   meta: getLabel(qualityScore),   weight: '50%', desc: 'Bug rate + severity' },
      { label: 'Speed',     score: speedScore,     meta: getLabel(speedScore),     weight: '30%', desc: 'Cycle time + lead time' },
      { label: 'Stability', score: stabilityScore, meta: getLabel(stabilityScore), weight: '20%', desc: 'Hotfixes + deployments' },
    ],
  };
};

// ─── Weighted scoring system ──────────────────────────────────────────────────
// Normalises each metric to a 0–1 risk scale, applies weights, returns scores.
export const getWeightedScore = (metricRow) => {
  if (!metricRow) return null;

  const {
    bug_rate_pct,
    avg_cycle_time_days,
    avg_lead_time_days,
    prod_deployments,
    merged_prs,
  } = metricRow;

  // Normalise each metric to a 0–1 risk score (1 = worst, 0 = best)
  // Thresholds chosen from healthy/critical ranges used elsewhere
  const normBugRate     = Math.min(bug_rate_pct / 100, 1);                        // 0% → 0, 100% → 1
  const normCycleTime   = Math.min(Math.max(avg_cycle_time_days - 2, 0) / 6, 1);  // 2d → 0, 8d → 1
  const normLeadTime    = Math.min(Math.max(avg_lead_time_days  - 1, 0) / 6, 1);  // 1d → 0, 7d → 1
  const normDeployments = Math.max(1 - (prod_deployments / 4), 0);                // 4+ → 0, 0 → 1
  const normPRs         = Math.max(1 - (merged_prs / 4), 0);                      // 4+ → 0, 0 → 1

  // Weighted risk contributions
  const weights = {
    quality:    { value: normBugRate,     weight: 0.40, label: 'Quality (Bug Rate)'       },
    speed:      { value: normCycleTime,   weight: 0.20, label: 'Speed (Cycle Time)'       },
    pipeline:   { value: normLeadTime,    weight: 0.20, label: 'Pipeline (Lead Time)'     },
    delivery:   { value: normDeployments, weight: 0.10, label: 'Delivery (Deployments)'   },
    throughput: { value: normPRs,         weight: 0.10, label: 'Throughput (PR Count)'    },
  };

  // Compute weighted scores
  const scored = Object.entries(weights).map(([key, { value, weight, label }]) => ({
    key,
    label,
    rawScore:      parseFloat((value * weight * 100).toFixed(1)),   // contribution to total
    normalised:    parseFloat((value * 100).toFixed(1)),            // 0–100 risk %
    weight:        weight * 100,                                     // weight as %
  }));

  // Total risk score (0–100)
  const totalScore = parseFloat(
    scored.reduce((s, m) => s + m.rawScore, 0).toFixed(1)
  );

  // Sort by raw contribution descending → highest = primary issue
  const sorted = [...scored].sort((a, b) => b.rawScore - a.rawScore);
  const primaryIssue   = sorted[0].rawScore > 0 ? sorted[0].label : 'None';
  const secondaryIssue = sorted[1].rawScore > 0 ? sorted[1].label : 'None';

  // Overall health label
  const health =
    totalScore <= 15 ? { label: 'Healthy',  color: 'green' } :
    totalScore <= 35 ? { label: 'Moderate', color: 'amber' } :
    totalScore <= 55 ? { label: 'At Risk',  color: 'red'   } :
                       { label: 'Critical', color: 'red'   };

  return { scored, totalScore, primaryIssue, secondaryIssue, health };
};

// ─── Mini intelligence layer — powered by weighted scoring ───────────────────
export const getIntelligence = (metricRow) => {
  if (!metricRow) return null;

  const scored = getWeightedScore(metricRow);
  if (!scored) return null;

  const {
    developer_id, month,
    bug_rate_pct, avg_cycle_time_days, avg_lead_time_days, pattern_hint,
  } = metricRow;

  // ── Raw signals from fact tables ────────────────────────────────────────
  const devPRs   = pullRequests.filter((p) => p.developer_id === developer_id && p.month === month);
  const avgWait  = devPRs.length > 0 ? devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length : 0;
  const avgLines = devPRs.length > 0 ? devPRs.reduce((s, p) => s + p.lines_changed, 0) / devPRs.length : 0;

  const devDeps  = deployments.filter((d) => d.developer_id === developer_id && d.month === month);
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');

  const devBugs  = bugReports.filter((b) => b.developer_id === developer_id && b.month_found === month);
  const bugCauses = [...new Set(devBugs.map((b) => b.root_cause_bucket))];
  const hasHighSeverityBug = devBugs.some((b) => b.severity === 'high');

  const highBug    = bug_rate_pct >= 50;
  const slowCycle  = avg_cycle_time_days > 5;
  const highLead   = avg_lead_time_days > 4.5;
  const largePRs   = avgLines > 500;
  const slowReview = avgWait > 20;

  // ── Detect secondary issues from raw signals ─────────────────────────────
  // These go beyond the weighted score — they catch specific patterns
  const secondarySignals = [];

  if (largePRs && highBug) {
    secondarySignals.push({
      label: 'Review Quality Issue',
      reason: `Large PRs (avg ${Math.round(avgLines)} lines) combined with high bug rate — reviewers are likely missing issues due to PR size.`,
    });
  }

  if (hotfixes.length > 0) {
    secondarySignals.push({
      label: 'Release Instability',
      reason: `${hotfixes.length} hotfix deployment${hotfixes.length > 1 ? 's' : ''} this month — reactive releases indicate issues are escaping the standard release process.`,
    });
  }

  if (slowReview && highLead) {
    secondarySignals.push({
      label: 'Review Bottleneck',
      reason: `PR review wait is ${avgWait.toFixed(1)} hours on average — slow reviews are directly driving the high lead time.`,
    });
  }

  if (hasHighSeverityBug) {
    secondarySignals.push({
      label: 'High Severity Bug',
      reason: `At least one escaped bug was high severity — this increases production risk and warrants a post-mortem.`,
    });
  }

  if (bugCauses.includes('test gap') && highBug) {
    secondarySignals.push({
      label: 'Test Coverage Gap',
      reason: `Bug root cause is a test gap — the affected code paths are not covered by automated tests.`,
    });
  }

  if (bugCauses.includes('edge case') && highBug) {
    secondarySignals.push({
      label: 'Edge Case Handling',
      reason: `Bug root cause is an unhandled edge case — these are typically missed during design or ticket grooming.`,
    });
  }

  // Primary secondary issue = first signal detected (most specific)
  const secondaryIssue = secondarySignals.length > 0
    ? secondarySignals[0].label
    : scored.secondaryIssue;

  // ── Confidence: high if top weighted score is clearly dominant ───────────
  const sortedScores = [...scored.scored].sort((a, b) => b.rawScore - a.rawScore);
  const topScore     = sortedScores[0].rawScore;
  const secondScore  = sortedScores[1].rawScore;
  const confidence   =
    topScore === 0                ? 'High'   :
    topScore >= secondScore * 2   ? 'High'   :
    topScore >= secondScore * 1.3 ? 'Medium' :
                                    'Low';

  // ── Pattern reason ───────────────────────────────────────────────────────
  let patternReason = '';
  if (pattern_hint === 'Healthy flow') {
    patternReason = scored.totalScore <= 15
      ? 'All weighted signals are low — no dominant risk area detected.'
      : `Mostly healthy (risk score: ${scored.totalScore}/100), but a minor ${scored.primaryIssue.toLowerCase()} signal is present.`;
  } else if (pattern_hint === 'Quality watch') {
    if (highBug && !slowCycle) {
      patternReason = `High bug rate (${bug_rate_pct}%) despite normal throughput — quality is the dominant risk (weighted contribution: ${sortedScores[0].rawScore.toFixed(1)}).`;
    } else {
      patternReason = `Quality signals are elevated. Bug rate is ${bug_rate_pct}% — total risk score: ${scored.totalScore}/100.`;
    }
  } else if (pattern_hint === 'Needs review') {
    patternReason = `Multiple metrics are elevated — total risk score is ${scored.totalScore}/100. Primary driver: ${scored.primaryIssue}.`;
  }

  return {
    primaryIssue:     scored.primaryIssue,
    secondaryIssue,
    secondarySignals,
    confidence,
    pattern:          pattern_hint,
    patternReason,
    totalScore:       scored.totalScore,
    health:           scored.health,
  };
};

// ─── Reasoning logic — diagnoses root problem from metric combinations ────────
export const getReasoning = (metricRow) => {
  if (!metricRow) return null;

  const {
    developer_id, month,
    bug_rate_pct, avg_cycle_time_days, avg_lead_time_days,
    prod_deployments, escaped_bugs,
  } = metricRow;

  const name = getFirstName(developer_id);

  const highBug      = bug_rate_pct >= 50;
  const normalCycle  = avg_cycle_time_days <= 5;
  const slowCycle    = avg_cycle_time_days > 5;
  const highLead     = avg_lead_time_days > 4.5;
  const normalLead   = avg_lead_time_days <= 4.5;
  const zeroBug      = bug_rate_pct === 0;

  const devPRs   = pullRequests.filter((p) => p.developer_id === developer_id && p.month === month);
  const avgWait  = devPRs.length > 0 ? devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length : 0;
  const avgLines = devPRs.length > 0 ? devPRs.reduce((s, p) => s + p.lines_changed, 0) / devPRs.length : 0;
  const slowReview = avgWait > 20;
  const largePRs   = avgLines > 500;

  const devDeps  = deployments.filter((d) => d.developer_id === developer_id && d.month === month);
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');

  const devIssues      = jiraIssues.filter((j) => j.developer_id === developer_id && j.month === month);
  const highComplexity = devIssues.filter((j) => j.story_points >= 5);

  // ── Evaluate each combination and return a diagnosis ──────────────────────
  const diagnoses = [];

  // 1. High bug + normal cycle → pure quality issue, not a speed issue
  if (highBug && normalCycle) {
    diagnoses.push({
      condition: `Bug rate high (${bug_rate_pct}%) + Cycle time normal (${avg_cycle_time_days} days)`,
      diagnosis: `This is a quality issue, not a speed issue. ${name} is completing work at a normal pace but bugs are escaping — the problem is in testing or review coverage, not delivery speed.`,
      type: 'bad',
    });
  }

  // 2. High bug + slow cycle → both speed and quality are broken
  if (highBug && slowCycle) {
    diagnoses.push({
      condition: `Bug rate high (${bug_rate_pct}%) + Cycle time slow (${avg_cycle_time_days} days)`,
      diagnosis: `Both speed and quality are under pressure. ${name} is taking longer to complete work AND bugs are escaping — this suggests tasks are too large, rushed at the end, or lacking proper review.`,
      type: 'bad',
    });
  }

  // 3. Slow cycle + normal lead → bottleneck is in development, not deployment
  if (slowCycle && normalLead) {
    diagnoses.push({
      condition: `Cycle time slow (${avg_cycle_time_days} days) + Lead time normal (${avg_lead_time_days} days)`,
      diagnosis: `The bottleneck is in development, not deployment. Once ${name} finishes work, it ships quickly — the delay is happening during coding or review, not in the pipeline.`,
      type: 'warn',
    });
  }

  // 4. Normal cycle + high lead → bottleneck is in deployment pipeline
  if (normalCycle && highLead) {
    diagnoses.push({
      condition: `Cycle time normal (${avg_cycle_time_days} days) + Lead time high (${avg_lead_time_days} days)`,
      diagnosis: `${name} is completing work efficiently but it is taking too long to reach production. The bottleneck is in the deployment pipeline — likely slow approvals, environment queues, or manual gates.`,
      type: 'warn',
    });
  }

  // 5. Slow review + high lead → review wait is the lead time driver
  if (slowReview && highLead) {
    diagnoses.push({
      condition: `PR review wait high (${avgWait.toFixed(1)} hrs) + Lead time high (${avg_lead_time_days} days)`,
      diagnosis: `The high lead time is directly driven by slow PR reviews. ${name}'s code is ready but sitting idle waiting for reviewers — this is a team process issue, not an individual performance issue.`,
      type: 'bad',
    });
  }

  // 6. Large PRs + high bug → PR size is causing review gaps
  if (largePRs && highBug) {
    diagnoses.push({
      condition: `Large PRs (avg ${Math.round(avgLines)} lines) + Bug rate high (${bug_rate_pct}%)`,
      diagnosis: `Large PRs are likely contributing to the bug rate. When PRs are too big, reviewers miss edge cases. ${name} should split work into smaller, focused PRs to make reviews more effective.`,
      type: 'bad',
    });
  }

  // 7. High complexity + slow cycle → complexity is the cycle time driver
  if (highComplexity.length > 0 && slowCycle) {
    diagnoses.push({
      condition: `High-complexity issues (${highComplexity.length} tickets ≥5 pts) + Cycle time slow (${avg_cycle_time_days} days)`,
      diagnosis: `The slow cycle time is explained by task complexity, not inefficiency. ${name} is working on high-point tickets that naturally take longer — this is expected, but breaking them into sub-tasks would help.`,
      type: 'warn',
    });
  }

  // 8. Hotfixes + high bug → reactive pattern
  if (hotfixes.length >= 1 && highBug) {
    diagnoses.push({
      condition: `Hotfix deployments (${hotfixes.length}) + Bug rate high (${bug_rate_pct}%)`,
      diagnosis: `${name} is in a reactive cycle — bugs escape, then hotfixes are deployed to fix them. This pattern increases risk and disrupts the team. The fix is upstream: better testing before merge, not faster hotfixes after.`,
      type: 'bad',
    });
  }

  // 9. Zero bug + fast cycle + normal lead → everything is working
  if (zeroBug && !slowCycle && normalLead) {
    diagnoses.push({
      condition: `Bug rate 0% + Cycle time ${avg_cycle_time_days} days + Lead time ${avg_lead_time_days} days`,
      diagnosis: `All three core signals are healthy. ${name} is writing quality code, completing it efficiently, and shipping it quickly. This is the target state for any developer.`,
      type: 'good',
    });
  }

  // 10. Zero bug + slow cycle → quality is good but speed needs work
  if (zeroBug && slowCycle) {
    diagnoses.push({
      condition: `Bug rate 0% + Cycle time slow (${avg_cycle_time_days} days)`,
      diagnosis: `${name} is writing quality code with no production bugs, but work is taking longer than expected to complete. The focus should be on reducing task scope or removing blockers — quality should not be sacrificed to speed up.`,
      type: 'warn',
    });
  }

  return diagnoses;
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

// ─── Action recommendations — fully personalized with name + metric values ─────
export const getRecommendedActions = (metricRow, developerId, month) => {
  if (!metricRow) return [];

  const { bug_rate_pct, avg_cycle_time_days, avg_lead_time_days, pattern_hint, merged_prs } = metricRow;
  const name = getFirstName(developerId);
  const actions = [];

  // ── Bug quality ──────────────────────────────────────────────────────────────
  if (bug_rate_pct >= 50) {
    const devBugs = bugReports.filter(
      (b) => b.developer_id === developerId && b.month_found === month
    );
    const causes = [...new Set(devBugs.map((b) => b.root_cause_bucket))];
    const highSeverity = devBugs.some((b) => b.severity === 'high');

    if (causes.includes('test gap')) {
      actions.push(
        `${name}'s bug rate is ${bug_rate_pct}% due to a test gap — add unit and integration tests specifically for the feature areas where bugs escaped.`
      );
    }
    if (causes.includes('edge case')) {
      actions.push(
        `The escaped bug was caused by an unhandled edge case — ${name} should add edge cases explicitly to acceptance criteria during ticket grooming.`
      );
    }
    if (causes.includes('release config')) {
      actions.push(
        `A release config issue caused a production bug — ${name}'s team should add a pre-deploy config validation step to the pipeline.`
      );
    }
    if (highSeverity) {
      actions.push(
        `At least one bug was high severity — ${name} should prioritize a post-mortem to understand the root cause and prevent recurrence.`
      );
    }

    const devPRsForBug = pullRequests.filter(
      (p) => p.developer_id === developerId && p.month === month
    );
    const avgLines = devPRsForBug.length > 0
      ? devPRsForBug.reduce((s, p) => s + p.lines_changed, 0) / devPRsForBug.length
      : 0;
    if (avgLines > 400) {
      actions.push(
        `${name}'s PRs average ${Math.round(avgLines)} lines — reducing PR size will make it easier for reviewers to catch issues before they reach production.`
      );
    }
  }

  // ── Cycle time ───────────────────────────────────────────────────────────────
  if (avg_cycle_time_days > 6) {
    const devIssues = jiraIssues.filter(
      (j) => j.developer_id === developerId && j.month === month
    );
    const highComplexity = devIssues.filter((j) => j.story_points >= 5);
    if (highComplexity.length > 0) {
      actions.push(
        `${name}'s cycle time is ${avg_cycle_time_days} days, partly driven by ${highComplexity.length} high-complexity issue${highComplexity.length > 1 ? 's' : ''} — break these into smaller sub-tasks during sprint planning.`
      );
    } else {
      actions.push(
        `${name}'s cycle time is ${avg_cycle_time_days} days — identify what is causing work to stay in progress so long and escalate blockers earlier in the sprint.`
      );
    }
  } else if (avg_cycle_time_days > 4) {
    actions.push(
      `${name}'s cycle time is ${avg_cycle_time_days} days — slightly above the healthy range. Review ticket scope during grooming to keep tasks focused and completable within 3–4 days.`
    );
  }

  // ── Lead time / PR review wait ───────────────────────────────────────────────
  const devPRs = pullRequests.filter(
    (p) => p.developer_id === developerId && p.month === month
  );
  if (devPRs.length > 0) {
    const avgWait = devPRs.reduce((s, p) => s + p.review_wait_hours, 0) / devPRs.length;
    if (avgWait > 20) {
      actions.push(
        `${name}'s PRs are waiting ${avgWait.toFixed(1)} hours on average for review — the team should agree on a review SLA (e.g. first review within 4 hours) to reduce lead time.`
      );
    }
  }

  if (avg_lead_time_days > 4.5) {
    actions.push(
      `${name}'s lead time is ${avg_lead_time_days} days — look for manual approval gates or environment queues in the deployment pipeline that can be automated or parallelised.`
    );
  }

  // ── Hotfix pattern ───────────────────────────────────────────────────────────
  const devDeps = deployments.filter(
    (d) => d.developer_id === developerId && d.month === month
  );
  const hotfixes = devDeps.filter((d) => d.release_type === 'hotfix');
  if (hotfixes.length >= 1) {
    actions.push(
      `${name} had ${hotfixes.length} hotfix deployment${hotfixes.length > 1 ? 's' : ''} this month — investigate what slipped through and add regression tests to prevent the same issue recurring.`
    );
  }

  // ── Healthy flow — positive, specific actions ────────────────────────────────
  if (pattern_hint === 'Healthy flow' && actions.length === 0) {
    if (bug_rate_pct === 0 && avg_cycle_time_days <= 4) {
      actions.push(
        `Since ${name}'s bug rate is 0% and cycle time is ${avg_cycle_time_days} days, consider taking on code review ownership to help raise team-wide quality.`
      );
      actions.push(
        `${name} is completing work efficiently — this is a good time to tackle a higher-complexity ticket or a technical debt item that the team has been deferring.`
      );
    }
    if (merged_prs >= 2) {
      actions.push(
        `${name} merged ${merged_prs} PRs cleanly this month — document the review patterns that are working well so the team can adopt them consistently.`
      );
    }
    actions.push(
      `${name}'s workflow is stable — use this momentum to mentor a teammate who is struggling with cycle time or quality issues.`
    );
  }

  return actions;
};
