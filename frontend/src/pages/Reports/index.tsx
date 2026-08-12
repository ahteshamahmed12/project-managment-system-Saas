import { activityData } from "@/components/activity/activityData";
import ActivitySection from "@/components/activity/ActivitySection";
import Analytics from "@/components/chart/AnalyticsExample";

export default function index() {
  return (
    <div className="p-6">
      <ActivitySection activities={activityData} />
      <Analytics />
    </div>
  );
}
