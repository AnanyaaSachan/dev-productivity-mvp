
import React, { useState } from 'react';
import { pullRequests, deployments, bugReports, jiraIssues } from '../data/data';

// Expandable section wrapper
const Section = ({ title, count, countColor, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${countColor}`}>
            {count}
          </span>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲ Hide' : '▼ View details'}</span>
      </button>

      {open && (
        <div className="px-5 py-4 bg-white overflow-x-auto">
          {children}
        </div>
      )}
    </div>
  );
};

// Table helpers 
const Th = ({ children }) => (
  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4 whitespace-nowrap">
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`text-sm text-gray-700 py-2 pr-4 whitespace-nowrap ${className}`}>
    {children}
  </td>
);

const severityColor = {
  high:   'bg-red-100   text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-green-100 text-green-700',
};

const releaseColor = {
  hotfix:   'bg-red-100   text-red-700',
  standard: 'bg-green-100 text-green-700',
};

//  Main component 
const DrillDownCard = ({ data }) => {
  if (!data) return null;

  const { developer_id, month } = data;

  // Filter raw data for this developer + month
  const devPRs  = pullRequests.filter((p) => p.developer_id === developer_id && p.month === month);
  const devDeps = deployments.filter((d) => d.developer_id === developer_id && d.month === month);
  const devBugs = bugReports.filter((b) => b.developer_id === developer_id && b.month_found === month);
  const devIssues = jiraIssues.filter((j) => j.developer_id === developer_id && j.month === month);

  const hotfixCount = devDeps.filter((d) => d.release_type === 'hotfix').length;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-1">Drill Down</h3>
      <p className="text-sm text-gray-400 mb-5">
        Expand any section to see the raw data behind the metrics.
      </p>

      <div className="flex flex-col gap-3">

        /* PR Details  */
        <Section
          title="Pull Request Details"
          count={`${devPRs.length} PRs`}
          countColor="bg-purple-100 text-purple-700"
        >
          {devPRs.length === 0 ? (
            <p className="text-sm text-gray-400">No PRs found for this period.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th>PR ID</Th>
                  <Th>Issue</Th>
                  <Th>Review Wait</Th>
                  <Th>Merge Time</Th>
                  <Th>Lines Changed</Th>
                  <Th>Review Rounds</Th>
                </tr>
              </thead>
              <tbody>
                {devPRs.map((pr) => (
                  <tr key={pr.pr_id} className="border-t border-gray-100">
                    <Td className="font-mono text-purple-600">{pr.pr_id}</Td>
                    <Td className="font-mono text-gray-500">{pr.issue_id}</Td>
                    <Td className={pr.review_wait_hours > 20 ? 'text-red-600 font-semibold' : ''}>
                      {pr.review_wait_hours}h
                    </Td>
                    <Td>{pr.merge_time_hours}h</Td>
                    <Td className={pr.lines_changed > 500 ? 'text-amber-600 font-semibold' : ''}>
                      {pr.lines_changed}
                    </Td>
                    <Td>{pr.review_rounds}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        /*Bug Details */
        <Section
          title="Bug Reports"
          count={devBugs.length === 0 ? 'No bugs' : `${devBugs.length} bug${devBugs.length > 1 ? 's' : ''}`}
          countColor={devBugs.length === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        >
          {devBugs.length === 0 ? (
            <p className="text-sm text-green-600 font-medium">No production bugs found for this period.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Bug ID</Th>
                  <Th>Linked Issue</Th>
                  <Th>Severity</Th>
                  <Th>Root Cause</Th>
                  <Th>Status</Th>
                  <Th>Escaped to Prod</Th>
                </tr>
              </thead>
              <tbody>
                {devBugs.map((bug) => (
                  <tr key={bug.bug_id} className="border-t border-gray-100">
                    <Td className="font-mono text-red-600">{bug.bug_id}</Td>
                    <Td className="font-mono text-gray-500">{bug.linked_issue_id}</Td>
                    <Td>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColor[bug.severity] || ''}`}>
                        {bug.severity}
                      </span>
                    </Td>
                    <Td>{bug.root_cause_bucket}</Td>
                    <Td>{bug.status}</Td>
                    <Td>{bug.escaped_to_prod ? '✅ Yes' : '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        /* Deployment Logs  */
        <Section
          title="Deployment Logs"
          count={hotfixCount > 0 ? `${devDeps.length} deployments (${hotfixCount} hotfix)` : `${devDeps.length} deployments`}
          countColor={hotfixCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}
        >
          {devDeps.length === 0 ? (
            <p className="text-sm text-gray-400">No deployments found for this period.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Deployment ID</Th>
                  <Th>PR</Th>
                  <Th>Lead Time</Th>
                  <Th>Release Type</Th>
                </tr>
              </thead>
              <tbody>
                {devDeps.map((dep) => (
                  <tr key={dep.deployment_id} className="border-t border-gray-100">
                    <Td className="font-mono text-indigo-600">{dep.deployment_id}</Td>
                    <Td className="font-mono text-gray-500">{dep.pr_id || '—'}</Td>
                    <Td className={dep.lead_time_days > 4.5 ? 'text-red-600 font-semibold' : ''}>
                      {dep.lead_time_days} days
                    </Td>
                    <Td>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${releaseColor[dep.release_type] || ''}`}>
                        {dep.release_type}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        /* Jira Issues */
        <Section
          title="Jira Issues"
          count={`${devIssues.length} issues`}
          countColor="bg-blue-100 text-blue-700"
        >
          {devIssues.length === 0 ? (
            <p className="text-sm text-gray-400">No issues found for this period.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Issue ID</Th>
                  <Th>Type</Th>
                  <Th>Story Points</Th>
                  <Th>Cycle Time</Th>
                </tr>
              </thead>
              <tbody>
                {devIssues.map((issue) => (
                  <tr key={issue.issue_id} className="border-t border-gray-100">
                    <Td className="font-mono text-blue-600">{issue.issue_id}</Td>
                    <Td>{issue.issue_type}</Td>
                    <Td className={issue.story_points >= 5 ? 'text-amber-600 font-semibold' : ''}>
                      {issue.story_points}
                    </Td>
                    <Td className={issue.cycle_time_days > 5 ? 'text-red-600 font-semibold' : ''}>
                      {issue.cycle_time_days} days
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

      </div>
    </div>
  );
};

export default DrillDownCard;
