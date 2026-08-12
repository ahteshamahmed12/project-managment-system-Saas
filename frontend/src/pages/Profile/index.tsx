import * as React from "react";
import {
  Camera,
  Mail,
  Phone,
  Shield,
  Building2,
  CalendarDays,
  Save,
  User as UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UsersContext";

export default function Profile() {
  const { user, login } = useAuth();
  const { updateUser } = useUsers();

  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [avatar, setAvatar] = React.useState(user?.avatar ?? "");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
    setAvatar(user?.avatar ?? "");
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const initials =
    name
      .trim()
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) return;

    const updatedUser = {
      ...user,
      name,
      email,
      phone,
      avatar,
    };

    updateUser(user.id, {
      name,
      email,
      phone,
      avatar,
    });

    const token = localStorage.getItem("auth_token");

    if (token) {
      login(token, updatedUser);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No user is currently logged in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and profile settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Profile Summary */}

        <Card className="h-fit border-border bg-card">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                <AvatarImage src={avatar} alt={name || "Profile"} />

                <AvatarFallback className="bg-orange-100 text-2xl font-bold text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-colors hover:bg-orange-600"
                aria-label="Change profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {name || "User"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">{email}</p>

            <div className="mt-4 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
              {user.role}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>

            <CardDescription>
              Update the information associated with your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Name + Email */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="profile-name">Full name</Label>

                  <div className="relative mt-1.5">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="pl-10"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="profile-email">Email address</Label>

                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Phone + Role */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="profile-phone">Phone number</Label>

                  <div className="relative mt-1.5">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="profile-phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="pl-10"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>

                <div>
                  <Label>Role</Label>

                  <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    {user.role}
                  </div>
                </div>
              </div>

              {/* Department + Joining Date */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Department</Label>

                  <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {user.department}
                  </div>
                </div>

                <div>
                  <Label>Joining date</Label>

                  <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {user.joining_date}
                  </div>
                </div>
              </div>

              {/* Save */}

              <div className="flex justify-end border-t border-border pt-5">
                <Button
                  type="submit"
                  className="gap-2 bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
