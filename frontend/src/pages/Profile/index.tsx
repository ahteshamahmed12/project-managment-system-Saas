import * as React from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  Mail,
  Phone,
  Save,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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
import { authApi } from "@/lib/auth-api";

export default function Profile() {
  const { user, login } = useAuth();
  const { users, updateUser } = useUsers();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  /*
   * /profile
   *     -> Logged-in user's profile
   *
   * /users/:userId/profile
   *     -> Selected user's profile
   */
  const isViewingOtherUser = Boolean(userId);

  const profileUser = userId ? users.find((item) => item.id === userId) : user;

  const [name, setName] = React.useState(profileUser?.name ?? "");
  const [email, setEmail] = React.useState(profileUser?.email ?? "");
  const [phone, setPhone] = React.useState(profileUser?.phone ?? "");
  const [avatar, setAvatar] = React.useState(profileUser?.avatar ?? "");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  /*
   * Keep local form state synchronized when the selected user changes.
   */
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(profileUser?.name ?? "");
    setEmail(profileUser?.email ?? "");
    setPhone(profileUser?.phone ?? "");
    setAvatar(profileUser?.avatar ?? "");
  }, [profileUser]);

  /*
   * Profile picture upload
   *
   * Only available for the logged-in user's own profile.
   */
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

  /*
   * Generate initials for avatar fallback.
   */
  const initials =
    name
      .trim()
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  /*
   * Save own profile.
   *
   * This is intentionally disabled for /users/:userId/profile
   * because that page is read-only.
   */
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !profileUser || isViewingOtherUser) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      /*
       * Persist to the backend so the changes are permanent (survive
       * refresh/re-login), then keep the local contexts in sync.
       */
      const updatedUser = await authApi.updateProfile({
        name,
        email,
        phone,
        avatar,
      });

      updateUser(user.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      });

      const token = localStorage.getItem("auth_token");

      if (token) {
        login(token, updatedUser);
      }
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * No logged-in user on own profile.
   */
  if (!user && !isViewingOtherUser) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No user is currently logged in.
        </p>
      </div>
    );
  }

  /*
   * Selected user does not exist.
   */
  if (isViewingOtherUser && !profileUser) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          User profile could not be found.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/users")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isViewingOtherUser ? "User Profile" : "My Profile"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {isViewingOtherUser
              ? "View this user's profile information."
              : "Manage your personal information and profile settings."}
          </p>
        </div>

        {isViewingOtherUser && (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/users")}
            className="w-fit gap-2 border-border"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
        )}
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

              {/* Change avatar only on own profile */}
              {!isViewingOtherUser && (
                <>
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
                </>
              )}
            </div>

            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {profileUser.name || "User"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {profileUser.email}
            </p>

            <div className="mt-4 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
              {profileUser.role}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>
              {isViewingOtherUser
                ? "Profile Information"
                : "Personal Information"}
            </CardTitle>

            <CardDescription>
              {isViewingOtherUser
                ? "View the information associated with this user's account."
                : "Update the information associated with your account."}
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
                      readOnly={isViewingOtherUser}
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
                      readOnly={isViewingOtherUser}
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
                      readOnly={isViewingOtherUser}
                    />
                  </div>
                </div>

                <div>
                  <Label>Role</Label>

                  <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    {profileUser.role}
                  </div>
                </div>
              </div>

              {/* Department + Joining Date */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Department</Label>

                  <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {profileUser.department}
                  </div>
                </div>

                <div>
                  <Label>Joining date</Label>

                  <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {profileUser.joining_date}
                  </div>
                </div>
              </div>

              {/* Status */}

              <div>
                <Label>Status</Label>

                <div className="mt-1.5 flex h-10 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground">
                  {profileUser.status}
                </div>
              </div>

              {/* Save */}

              {!isViewingOtherUser && (
                <div className="flex flex-col items-end gap-3 border-t border-border pt-5">
                  {saveError && (
                    <p className="text-sm text-destructive">{saveError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={saving}
                    className="gap-2 bg-orange-500 text-white hover:bg-orange-600"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
