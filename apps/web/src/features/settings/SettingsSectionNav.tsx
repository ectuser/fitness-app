import { m } from '#/paraglide/messages'

const getSettingsSections = () => [
  { id: 'appearance', label: m.plain_ivory_hare() },
  { id: 'data', label: m.eager_mauve_eagle() },
  { id: 'app-update', label: m.zesty_cyan_bison() },
]

export function SettingsSectionNav() {
  return (
    <nav className="hidden lg:block">
      <div className="sticky top-6 space-y-1">
        {getSettingsSections().map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
