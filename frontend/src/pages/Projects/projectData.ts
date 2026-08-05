export interface Project {
  id: string;
  project_name: string;
  project_image: string;
  description: string;
  status: "Active" | "On Hold" | "Completed";
  priority: "Low" | "Medium" | "High";
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
}

export const projectData: Project[] = [
  {
    id: crypto.randomUUID(),
    project_name: "Project Alpha",
    project_image: "https://picsum.photos/80?1",
    description: "Project management dashboard redesign.",
    status: "Active",
    priority: "High",
    start_date: "2026-08-01",
    end_date: "2026-10-15",
    created_by: "Alex",
    created_at: "2026-08-01",
  },
  {
    id: crypto.randomUUID(),
    project_name: "CRM System",
    project_image: "https://picsum.photos/80?2",
    description: "Customer relationship management system.",
    status: "On Hold",
    priority: "Medium",
    start_date: "2026-07-20",
    end_date: "2026-09-30",
    created_by: "Sam",
    created_at: "2026-07-20",
  },
  {
    id: crypto.randomUUID(),
    project_name: "E-Commerce Website",
    project_image: "https://picsum.photos/80?3",
    description: "Complete online shopping platform.",
    status: "Completed",
    priority: "High",
    start_date: "2026-05-01",
    end_date: "2026-07-01",
    created_by: "John",
    created_at: "2026-05-01",
  },
  {
    id: crypto.randomUUID(),
    project_name: "HR Portal",
    project_image: "https://picsum.photos/80?4",
    description: "Employee management portal.",
    status: "Active",
    priority: "Low",
    start_date: "2026-08-10",
    end_date: "2026-11-10",
    created_by: "Emma",
    created_at: "2026-08-10",
  },
];
