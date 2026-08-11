import AnalyticsChart from "@/components/chart/AnalyticsChart";
import {
  projectProgressData,
  projectWorkloadData,
  monthlyTasksData,
  taskStatusData,
} from "@/components/chart/analyticsData";

export default function Analytics() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AnalyticsChart
        data={projectProgressData}
        xKey="project"
        dataKey="progress"
        title="Overall Progress"
        description="Project completion percentage"
        chartType="bar"
        valueSuffix="%"
      />

      <AnalyticsChart
        data={projectWorkloadData}
        xKey="member"
        dataKey="tasks"
        title="Projects Workload"
        description="Tasks assigned to team members"
        chartType="bar"
      />

      <AnalyticsChart
        data={monthlyTasksData}
        xKey="month"
        dataKey="completed"
        title="Monthly Tasks"
        description="Completed tasks by month"
        chartType="line"
      />

      <AnalyticsChart
        data={taskStatusData}
        xKey="status"
        dataKey="count"
        title="Task Status"
        description="Current task distribution"
        chartType="pie"
        showLegend
      />
    </div>
  );
}
