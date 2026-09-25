import { useMemo } from "react";

function AnalyticsChart({ metrics, categoryData, userEnrollments, allCourses }) {
  // JavaScript .reduce() and .map() data aggregation as mandated in Sprint 15 Phase 3
  const userProgressStats = useMemo(() => {
    if (!userEnrollments || userEnrollments.length === 0) return { completed: 0, inProgress: 0, notStarted: 0 };

    return userEnrollments.reduce(
      (acc, en) => {
        if (en.progress === 100) {
          acc.completed += 1;
        } else if (en.progress > 0) {
          acc.inProgress += 1;
        } else {
          acc.notStarted += 1;
        }
        return acc;
      },
      { completed: 0, inProgress: 0, notStarted: 0 }
    );
  }, [userEnrollments]);

  // Total calculated revenue aggregated using .reduce()
  const totalRevenueCalculated = useMemo(() => {
    if (!allCourses) return 0;
    return allCourses.reduce((sum, course) => {
      return sum + (course.price || 0);
    }, 0);
  }, [allCourses]);

  const maxCategoryCount = useMemo(() => {
    if (!categoryData || categoryData.length === 0) return 1;
    return Math.max(...categoryData.map((d) => d.count), 1);
  }, [categoryData]);

  return (
    <div className="analytics-section">
      <div className="section-header">
        <h2>📊 Analytics & Insights Engine</h2>
        <p>Real-time telemetry aggregated via JS map/reduce functions</p>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card card-purple">
          <div className="metric-icon">📚</div>
          <div className="metric-info">
            <span className="metric-value">{metrics?.totalCourses || allCourses?.length || 0}</span>
            <span className="metric-label">Total Courses</span>
          </div>
        </div>

        <div className="metric-card card-blue">
          <div className="metric-icon">🎓</div>
          <div className="metric-info">
            <span className="metric-value">{metrics?.totalEnrollments || userEnrollments?.length || 0}</span>
            <span className="metric-label">Active Enrollments</span>
          </div>
        </div>

        <div className="metric-card card-green">
          <div className="metric-icon">💵</div>
          <div className="metric-info">
            <span className="metric-value">
              ${(metrics?.totalRevenue !== undefined ? metrics.totalRevenue : totalRevenueCalculated).toFixed(2)}
            </span>
            <span className="metric-label">Platform Value</span>
          </div>
        </div>

        <div className="metric-card card-amber">
          <div className="metric-icon">🏆</div>
          <div className="metric-info">
            <span className="metric-value">{userProgressStats.completed}</span>
            <span className="metric-label">Completed Courses</span>
          </div>
        </div>
      </div>

      {/* Dynamic Data Visualization Charts */}
      <div className="charts-grid">
        {/* Category Breakdown Bar Chart */}
        <div className="chart-card">
          <h3>📂 Course Catalog Distribution</h3>
          <p className="chart-subtitle">Aggregated course count by primary category</p>
          <div className="bar-chart-container">
            {categoryData && categoryData.length > 0 ? (
              categoryData.map((item) => {
                const pct = Math.round((item.count / maxCategoryCount) * 100);
                return (
                  <div key={item.category} className="bar-row">
                    <div className="bar-label">{item.category}</div>
                    <div className="bar-wrapper">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct}%` }}
                      >
                        <span className="bar-val">{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="empty-chart-msg">No category data available to plot.</p>
            )}
          </div>
        </div>

        {/* Student Progress Breakdown */}
        <div className="chart-card">
          <h3>🎯 Learning Progress Breakdown</h3>
          <p className="chart-subtitle">Status of current user enrollments</p>

          <div className="progress-doughnut-summary">
            <div className="progress-stat-row">
              <span className="stat-dot dot-green"></span>
              <span className="stat-label">Completed</span>
              <span className="stat-val">{userProgressStats.completed}</span>
            </div>
            <div className="progress-stat-row">
              <span className="stat-dot dot-blue"></span>
              <span className="stat-label">In Progress</span>
              <span className="stat-val">{userProgressStats.inProgress}</span>
            </div>
            <div className="progress-stat-row">
              <span className="stat-dot dot-gray"></span>
              <span className="stat-label">Not Started</span>
              <span className="stat-val">{userProgressStats.notStarted}</span>
            </div>
          </div>

          <div className="progress-visual-bar">
            {userEnrollments && userEnrollments.length > 0 ? (
              <div className="multi-progress-bar">
                <div
                  className="seg seg-green"
                  style={{
                    width: `${(userProgressStats.completed / userEnrollments.length) * 100}%`,
                  }}
                  title="Completed"
                ></div>
                <div
                  className="seg seg-blue"
                  style={{
                    width: `${(userProgressStats.inProgress / userEnrollments.length) * 100}%`,
                  }}
                  title="In Progress"
                ></div>
                <div
                  className="seg seg-gray"
                  style={{
                    width: `${(userProgressStats.notStarted / userEnrollments.length) * 100}%`,
                  }}
                  title="Not Started"
                ></div>
              </div>
            ) : (
              <p className="empty-chart-msg">Enroll in courses to view progress visualizations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsChart;
