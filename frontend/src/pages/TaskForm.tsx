import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Task } from "./taskData";

interface TaskFormProps {
  initialData?: Task | null;
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

const createDefaultTask = (): Task => ({
  id: crypto.randomUUID(),
  task_name: "",
  description: "",
  project: "",
  assignee: "",
  priority: "Medium",
  status: "Todo",
  start_date: "",
  due_date: "",
  created_by: "Admin",
  created_at: new Date().toISOString(),
});

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [form, setForm] = React.useState<Task>(
    initialData ?? createDefaultTask(),
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Task Name */}

      <div>
        <Label>Task Name</Label>

        <Input
          name="task_name"
          value={form.task_name}
          onChange={handleInputChange}
          placeholder="Enter task name"
        />
      </div>

      {/* Description */}

      <div>
        <Label>Description</Label>

        <Textarea
          name="description"
          value={form.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Enter description"
        />
      </div>

      {/* Project */}

      <div>
        <Label>Project</Label>

        <Input
          name="project"
          value={form.project}
          onChange={handleInputChange}
          placeholder="Project name"
        />
      </div>

      {/* Assignee */}

      <div>
        <Label>Assignee</Label>

        <Input
          name="assignee"
          value={form.assignee}
          onChange={handleInputChange}
          placeholder="Assign to"
        />
      </div>
      {/* Priority & Status */}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Priority</Label>

          <Select
            value={form.priority}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                priority: value as Task["priority"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>

          <Select
            value={form.status}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                status: value as Task["status"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Start Date</Label>

          <Input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Label>Due Date</Label>

          <Input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Buttons */}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          {initialData ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
