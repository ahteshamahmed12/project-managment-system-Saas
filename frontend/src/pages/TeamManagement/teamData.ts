export type TeamStatus = "Active" | "Inactive";

export interface Team {
  id: string;
  team_name: string;
  description: string;
  project: string;
  team_lead: string;
  members: string[];
  status: TeamStatus;
  created_at: string;
}

export const teamData: Team[] = [
  {
    id: "team-001",
    team_name: "Frontend Team",
    description:
      "Responsible for building and maintaining the frontend application.",
    project: "Project Management SaaS",
    team_lead: "Ali Khan",
    members: ["Ali Khan", "Zain Qaimi", "Ahmed Raza"],
    status: "Active",
    created_at: "2026-07-20T09:00:00Z",
  },
  {
    id: "team-002",
    team_name: "Backend Team",
    description: "Handles APIs, database integration and backend services.",
    project: "Project Management SaaS",
    team_lead: "Hamza Ahmed",
    members: ["Hamza Ahmed", "Usman Ali", "Bilal Khan"],
    status: "Active",
    created_at: "2026-07-21T10:30:00Z",
  },
  {
    id: "team-003",
    team_name: "UI/UX Team",
    description:
      "Designs user interfaces and improves the overall user experience.",
    project: "Mobile App",
    team_lead: "Sara Ahmed",
    members: ["Sara Ahmed", "Ayesha Khan", "Hina Malik"],
    status: "Active",
    created_at: "2026-07-22T08:45:00Z",
  },
  {
    id: "team-004",
    team_name: "QA Team",
    description:
      "Responsible for testing application functionality and quality.",
    project: "E-Commerce Platform",
    team_lead: "Usman Tariq",
    members: ["Usman Tariq", "Ahmed Hassan", "Fatima Noor"],
    status: "Active",
    created_at: "2026-07-23T11:00:00Z",
  },
  {
    id: "team-005",
    team_name: "Marketing Team",
    description: "Handles marketing campaigns, content and product promotion.",
    project: "CRM System",
    team_lead: "Ayesha Malik",
    members: ["Ayesha Malik", "Hassan Raza"],
    status: "Active",
    created_at: "2026-07-24T09:15:00Z",
  },
  {
    id: "team-006",
    team_name: "Mobile Development",
    description: "Develops and maintains mobile application features.",
    project: "Mobile App",
    team_lead: "Bilal Ahmed",
    members: ["Bilal Ahmed", "Omer Farooq", "Danish Ali"],
    status: "Active",
    created_at: "2026-07-25T12:00:00Z",
  },
  {
    id: "team-007",
    team_name: "Analytics Team",
    description: "Works on analytics, reporting and data visualization.",
    project: "Analytics Dashboard",
    team_lead: "Hassan Ali",
    members: ["Hassan Ali", "Zubair Khan"],
    status: "Inactive",
    created_at: "2026-07-26T10:00:00Z",
  },
  {
    id: "team-008",
    team_name: "Support Team",
    description: "Provides customer support and handles reported issues.",
    project: "CRM System",
    team_lead: "Fatima Zahra",
    members: ["Fatima Zahra", "Maryam Khan", "Saad Ahmed"],
    status: "Active",
    created_at: "2026-07-27T14:30:00Z",
  },
  {
    id: "team-009",
    team_name: "DevOps Team",
    description:
      "Manages deployment, infrastructure and development environments.",
    project: "Project Management SaaS",
    team_lead: "Saad Khan",
    members: ["Saad Khan", "Waleed Ahmed"],
    status: "Active",
    created_at: "2026-07-28T09:30:00Z",
  },
  {
    id: "team-010",
    team_name: "Research Team",
    description: "Researches new technologies and product improvements.",
    project: "Analytics Dashboard",
    team_lead: "Muneeb Ahmed",
    members: ["Muneeb Ahmed", "Kashif Ali"],
    status: "Inactive",
    created_at: "2026-07-29T13:00:00Z",
  },
];
