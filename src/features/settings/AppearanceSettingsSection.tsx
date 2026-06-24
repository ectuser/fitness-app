import type { ThemeMode } from '@/types'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AppearanceSettingsSectionProps {
  themeMode: ThemeMode
  onThemeModeChange: (themeMode: ThemeMode) => void
}

export function AppearanceSettingsSection({
  themeMode,
  onThemeModeChange,
}: AppearanceSettingsSectionProps) {
  return (
    <section id="appearance">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
        <div className="grid gap-2">
          <Label htmlFor="theme-mode">Theme</Label>
          <Select
            value={themeMode}
            onValueChange={(value) => onThemeModeChange(value as ThemeMode)}
          >
            <SelectTrigger id="theme-mode" aria-label="Theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </section>
  )
}
