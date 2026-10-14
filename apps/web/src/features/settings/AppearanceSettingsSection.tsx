import { m } from '#/paraglide/messages'
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
        <h2 className="mb-4 text-lg font-semibold">{m.keen_pearl_ibis()}</h2>
        <div className="grid gap-2">
          <Label htmlFor="theme-mode">{m.happy_slate_quail()}</Label>
          <Select
            value={themeMode}
            onValueChange={(value) => onThemeModeChange(value as ThemeMode)}
          >
            <SelectTrigger id="theme-mode" aria-label={m.happy_slate_quail()}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{m.sleepy_sage_hawk()}</SelectItem>
              <SelectItem value="dark">{m.proud_gold_yak()}</SelectItem>
              <SelectItem value="system">{m.rusty_beige_quail()}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </section>
  )
}
