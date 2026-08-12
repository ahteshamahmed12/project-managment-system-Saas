import * as React from "react";
import {
  Bell,
  CalendarDays,
  Check,
  Globe,
  Lock,
  Mail,
  Monitor,
  Palette,
  Save,
  Shield,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import { Switch } from "@/components/ui/switch";

interface SettingsData {
  language: string;
  timezone: string;
  dateFormat: string;
  compactMode: boolean;
  emailNotifications: boolean;
  taskNotifications: boolean;
  projectNotifications: boolean;
  mentionNotifications: boolean;
  teamActivityNotifications: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  language: "English",
  timezone: "Asia/Karachi",
  dateFormat: "DD/MM/YYYY",
  compactMode: false,
  emailNotifications: true,
  taskNotifications: true,
  projectNotifications: true,
  mentionNotifications: true,
  teamActivityNotifications: true,
};

const SETTINGS_KEY = "project_settings";

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
      {children}
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-5">
      <div className="flex min-w-0 items-start gap-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="font-medium text-foreground">{title}</p>

          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0 data-[state=checked]:bg-orange-500"
      />
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] =
    React.useState<SettingsData>(DEFAULT_SETTINGS);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);

    if (!storedSettings) return;

    try {
      const parsed = JSON.parse(storedSettings) as Partial<SettingsData>;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    await new Promise((resolve) => setTimeout(resolve, 700));

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    setIsSaving(false);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-24">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Settings
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Manage your workspace preferences, notifications, appearance, and
          account security.
        </p>
      </div>

      {/* =====================================================
          GENERAL
      ===================================================== */}

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <SectionIcon>
              <Globe className="h-5 w-5" />
            </SectionIcon>

            <div>
              <CardTitle>General</CardTitle>

              <CardDescription className="mt-1">
                Configure your basic workspace preferences.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>

              <select
                id="language"
                value={settings.language}
                onChange={(event) =>
                  updateSetting("language", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                <option>English</option>
                <option>Urdu</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>

              <select
                id="timezone"
                value={settings.timezone}
                onChange={(event) =>
                  updateSetting("timezone", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="Asia/Karachi">Pakistan — Asia/Karachi</option>

                <option value="UTC">UTC</option>

                <option value="Asia/Dubai">UAE — Asia/Dubai</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date format</Label>

              <select
                id="date-format"
                value={settings.dateFormat}
                onChange={(event) =>
                  updateSetting("dateFormat", event.target.value)
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          APPEARANCE
      ===================================================== */}

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <SectionIcon>
              <Palette className="h-5 w-5" />
            </SectionIcon>

            <div>
              <CardTitle>Appearance</CardTitle>

              <CardDescription className="mt-1">
                Customize the look and feel of your workspace.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border px-6">
          <div className="flex items-center justify-between gap-5 py-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Monitor className="h-4 w-4" />
              </div>

              <div>
                <p className="font-medium text-foreground">Theme</p>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Switch between light and dark mode.
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>

          <SettingRow
            icon={<Palette className="h-4 w-4" />}
            title="Compact mode"
            description="Reduce spacing in tables and interface elements."
            checked={settings.compactMode}
            onCheckedChange={(value) => updateSetting("compactMode", value)}
          />
        </CardContent>
      </Card>

      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <SectionIcon>
              <Bell className="h-5 w-5" />
            </SectionIcon>

            <div>
              <CardTitle>Notifications</CardTitle>

              <CardDescription className="mt-1">
                Control which activities generate notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-border px-6">
          <SettingRow
            icon={<Mail className="h-4 w-4" />}
            title="Email notifications"
            description="Receive important updates through email."
            checked={settings.emailNotifications}
            onCheckedChange={(value) =>
              updateSetting("emailNotifications", value)
            }
          />

          <SettingRow
            icon={<Check className="h-4 w-4" />}
            title="Task updates"
            description="Get notified when tasks are assigned or updated."
            checked={settings.taskNotifications}
            onCheckedChange={(value) =>
              updateSetting("taskNotifications", value)
            }
          />

          <SettingRow
            icon={<CalendarDays className="h-4 w-4" />}
            title="Project updates"
            description="Receive updates about projects you are involved in."
            checked={settings.projectNotifications}
            onCheckedChange={(value) =>
              updateSetting("projectNotifications", value)
            }
          />

          <SettingRow
            icon={<User className="h-4 w-4" />}
            title="Mentions"
            description="Get notified whenever someone mentions you."
            checked={settings.mentionNotifications}
            onCheckedChange={(value) =>
              updateSetting("mentionNotifications", value)
            }
          />

          <SettingRow
            icon={<Shield className="h-4 w-4" />}
            title="Team activity"
            description="Receive notifications about important team activity."
            checked={settings.teamActivityNotifications}
            onCheckedChange={(value) =>
              updateSetting("teamActivityNotifications", value)
            }
          />
        </CardContent>
      </Card>

      {/* =====================================================
          SECURITY
      ===================================================== */}

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <SectionIcon>
              <Shield className="h-5 w-5" />
            </SectionIcon>

            <div>
              <CardTitle>Security</CardTitle>

              <CardDescription className="mt-1">
                Manage your account password and security.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>

              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>

              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>

              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium text-foreground">
                Password security
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Password changes will be connected to the backend authentication
                API once it is available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          ACCOUNT
      ===================================================== */}

      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-4">
            <SectionIcon>
              <User className="h-5 w-5" />
            </SectionIcon>

            <div>
              <CardTitle>Account</CardTitle>

              <CardDescription className="mt-1">
                Manage your account session.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">
                  Active session
                </p>

                <p className="text-xs text-muted-foreground">
                  You are currently signed in to this account.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
              Active
            </span>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">Sign out</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign out from your current account on this device.
              </p>
            </div>

            <LogoutButton />
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          SAVE BAR
      ===================================================== */}

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        {saved && (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            Settings saved successfully
          </div>
        )}

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 rounded-xl bg-orange-500 text-white shadow-sm hover:bg-orange-600"
        >
          <Save className="h-4 w-4" />

          {isSaving ? "Saving changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
