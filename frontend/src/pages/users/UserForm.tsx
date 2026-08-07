import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { User, UserRole, UserDepartment, UserStatus } from "@/pages/users/userData";

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: User) => void;
  onCancel: () => void;
}

const roleOptions: UserRole[] = [
  "Admin",
  "Manager",
  "Team Lead",
  "Developer",
  "QA",
  "Designer",
];

const departmentOptions: UserDepartment[] = [
  "Development",
  "Design",
  "QA",
  "Marketing",
  "HR",
  "Sales",
];

const statusOptions: UserStatus[] = ["Active", "Inactive"];

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [form, setForm] = useState<User>(
    initialData ?? {
      id: crypto.randomUUID(),
      name: "",
      email: "",
      phone: "",
      avatar: "",
      role: "Developer",
      department: "Development",
      status: "Active",
      joining_date: "",
      created_at: new Date().toISOString(),
    },
  );

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData);
    }
  }, [initialData]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const preview = URL.createObjectURL(acceptedFiles[0]);

    setForm((prev) => ({
      ...prev,
      avatar: preview,
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [],
    },
    onDrop,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-6"
    >
      {/* Avatar Upload */}

      <div>
        <Label className="mb-2 block">Profile Picture</Label>

        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 transition
          ${
            isDragActive
              ? "border-orange-500 bg-orange-50"
              : "border-gray-300 hover:border-orange-400"
          }`}
        >
          <input {...getInputProps()} />

          {form.avatar ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={form.avatar}
                alt="avatar"
                className="h-28 w-28 rounded-full border object-cover shadow"
              />

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Remove Image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <Upload className="h-12 w-12 text-orange-500" />

              <div>
                <p className="font-medium">Drag & Drop Avatar</p>

                <p className="text-sm text-gray-500">or click here to upload</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Name */}

      <div>
        <Label>Name</Label>

        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter full name"
        />
      </div>

      {/* Email */}

      <div>
        <Label>Email</Label>

        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@email.com"
        />
      </div>

      {/* Phone */}

      <div>
        <Label>Phone</Label>

        <Input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+92 300 1234567"
        />
      </div>
      {/* Role & Department */}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label>Role</Label>

          <Select
            value={form.role}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                role: value as UserRole,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Department</Label>

          <Select
            value={form.department}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                department: value as UserDepartment,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {departmentOptions.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status & Joining Date */}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label>Status</Label>

          <Select
            value={form.status}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                status: value as UserStatus,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Joining Date</Label>

          <Input
            type="date"
            name="joining_date"
            value={form.joining_date}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Footer */}

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          {initialData ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
