const settingsSections = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'data', label: 'Data' },
  { id: 'app-update', label: 'App Update' },
]

export function SettingsSectionNav() {
  return (
    <nav className="hidden lg:block">
      <div className="sticky top-6 space-y-1">
        {settingsSections.map((section) => (
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
