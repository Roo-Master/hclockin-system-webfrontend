'use client';
import { useState, useEffect, createContext, useContext } from 'react';

// ─── Appearance Context ───────────────────────────────────────────────────────
// Holds all dashboard appearance preferences. Wrap your app's root layout with
// <AppearanceProvider> so every page reacts to changes immediately.

export type ColorScheme  = 'light' | 'dark' | 'system';
export type AccentColor  = 'blue' | 'indigo' | 'violet' | 'teal' | 'emerald' | 'rose';
export type Density      = 'comfortable' | 'compact' | 'spacious';
export type SidebarStyle = 'dark' | 'light' | 'colored';
export type FontFamily   = 'inter' | 'system' | 'mono';
export type BorderRadius = 'sharp' | 'rounded' | 'pill';

export interface AppearanceConfig {
  colorScheme:  ColorScheme;
  accentColor:  AccentColor;
  density:      Density;
  sidebarStyle: SidebarStyle;
  fontFamily:   FontFamily;
  borderRadius: BorderRadius;
  sidebarCollapsed: boolean;
  showAnimations: boolean;
  compactTables: boolean;
  showAvatars: boolean;
}

const DEFAULTS: AppearanceConfig = {
  colorScheme:  'light',
  accentColor:  'blue',
  density:      'comfortable',
  sidebarStyle: 'dark',
  fontFamily:   'inter',
  borderRadius: 'rounded',
  sidebarCollapsed: false,
  showAnimations: true,
  compactTables: false,
  showAvatars: true,
};

const STORAGE_KEY = 'chronos_appearance';

const AppearanceContext = createContext<{
  config: AppearanceConfig;
  update: (patch: Partial<AppearanceConfig>) => void;
}>({ config: DEFAULTS, update: () => {} });

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppearanceConfig>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConfig({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  function update(patch: Partial<AppearanceConfig>) {
    setConfig(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Apply CSS custom properties to :root so the rest of the app reacts
  useEffect(() => {
    const root = document.documentElement;

    // Accent color map → design-doc §3.1 semantic palette extended with accent choices
    const accentMap: Record<AccentColor, { base: string; bg: string; text: string }> = {
      blue:    { base: '#2563EB', bg: '#DBEAFE', text: '#1D4ED8' },
      indigo:  { base: '#4F46E5', bg: '#EEF2FF', text: '#4338CA' },
      violet:  { base: '#7C3AED', bg: '#EDE9FE', text: '#6D28D9' },
      teal:    { base: '#0D9488', bg: '#CCFBF1', text: '#0F766E' },
      emerald: { base: '#059669', bg: '#D1FAE5', text: '#047857' },
      rose:    { base: '#E11D48', bg: '#FFE4E6', text: '#BE123C' },
    };

    const densityMap: Record<Density, string> = {
      comfortable: '24px',
      compact:     '16px',
      spacious:    '32px',
    };

    const radiusMap: Record<BorderRadius, string> = {
      sharp:   '4px',
      rounded: '12px',
      pill:    '999px',
    };

    const fontMap: Record<FontFamily, string> = {
      inter:  "'Inter', system-ui, sans-serif",
      system: "system-ui, -apple-system, sans-serif",
      mono:   "'JetBrains Mono', 'Fira Code', monospace",
    };

    const sidebarBgMap: Record<SidebarStyle, string> = {
      dark:    '#0F1B3D',
      light:   '#FFFFFF',
      colored: accentMap[config.accentColor].base,
    };

    root.style.setProperty('--accent',          accentMap[config.accentColor].base);
    root.style.setProperty('--accent-bg',        accentMap[config.accentColor].bg);
    root.style.setProperty('--accent-text',      accentMap[config.accentColor].text);
    root.style.setProperty('--space-page',       densityMap[config.density]);
    root.style.setProperty('--radius-card',      radiusMap[config.borderRadius]);
    root.style.setProperty('--font-base',        fontMap[config.fontFamily]);
    root.style.setProperty('--sidebar-bg',       sidebarBgMap[config.sidebarStyle]);

    // Color scheme
    if (config.colorScheme === 'dark') {
      root.classList.add('dark');
    } else if (config.colorScheme === 'light') {
      root.classList.remove('dark');
    } else {
      // system — let media query handle it
      root.classList.remove('dark');
    }
  }, [config]);

  return (
    <AppearanceContext.Provider value={{ config, update }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsTab = 'general' | 'security' | 'notifications' | 'maintenance' | 'billing' | 'integrations' | 'appearance';

// ─── Reusable primitives ──────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-pill transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-info
        ${enabled ? 'bg-info' : 'bg-border'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-surface rounded-full shadow transition-transform duration-200
        ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-heading text-primary">{title}</h2>
        {description && <p className="text-label text-secondary mt-0.5">{description}</p>}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-6">
      <div className="min-w-0">
        <div className="text-body font-medium text-primary">{label}</div>
        {description && <div className="text-label text-secondary mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function TextInput({ defaultValue, placeholder, type = 'text', wide }: {
  defaultValue?: string; placeholder?: string; type?: string; wide?: boolean;
}) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={`bg-page border border-border rounded-badge px-3 py-2 text-body text-primary
        placeholder:text-tertiary focus:outline-none focus:border-info
        ${wide ? 'w-96' : 'w-64'}`}
    />
  );
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-body font-medium px-4 py-2 rounded-badge transition-all ${
        saved
          ? 'bg-success-bg text-success border border-success/30'
          : 'bg-info text-white hover:opacity-90'
      }`}
    >
      {saved ? (
        <span className="flex items-center gap-1.5">
          <i className="ti ti-check text-sm" aria-hidden="true" /> Saved
        </span>
      ) : 'Save Changes'}
    </button>
  );
}

// ─── Appearance Settings ──────────────────────────────────────────────────────

const ACCENT_OPTIONS: { value: AccentColor; hex: string; label: string }[] = [
  { value: 'blue',    hex: '#2563EB', label: 'Blue'    },
  { value: 'indigo',  hex: '#4F46E5', label: 'Indigo'  },
  { value: 'violet',  hex: '#7C3AED', label: 'Violet'  },
  { value: 'teal',    hex: '#0D9488', label: 'Teal'    },
  { value: 'emerald', hex: '#059669', label: 'Emerald' },
  { value: 'rose',    hex: '#E11D48', label: 'Rose'    },
];

// Mini live preview of the dashboard shell
function DashboardPreview({ config }: { config: AppearanceConfig }) {
  const accentHexMap: Record<AccentColor, string> = {
    blue: '#2563EB', indigo: '#4F46E5', violet: '#7C3AED',
    teal: '#0D9488', emerald: '#059669', rose: '#E11D48',
  };
  const accentBgMap: Record<AccentColor, string> = {
    blue: '#DBEAFE', indigo: '#EEF2FF', violet: '#EDE9FE',
    teal: '#CCFBF1', emerald: '#D1FAE5', rose: '#FFE4E6',
  };
  const sidebarBgMap: Record<SidebarStyle, string> = {
    dark:    '#0F1B3D',
    light:   '#FFFFFF',
    colored: accentHexMap[config.accentColor],
  };
  const sidebarTextMap: Record<SidebarStyle, string> = {
    dark: '#CBD5E1', light: '#374151', colored: '#FFFFFF',
  };
  const pageBg    = config.colorScheme === 'dark' ? '#111827' : '#F5F6FA';
  const cardBg    = config.colorScheme === 'dark' ? '#1F2937' : '#FFFFFF';
  const cardBorder = config.colorScheme === 'dark' ? '#374151' : '#E5E7EB';
  const textCol   = config.colorScheme === 'dark' ? '#F9FAFB' : '#111827';
  const textSec   = config.colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';
  const pad       = config.density === 'compact' ? 4 : config.density === 'spacious' ? 10 : 7;
  const radius    = config.borderRadius === 'sharp' ? 2 : config.borderRadius === 'pill' ? 16 : 8;
  const accent    = accentHexMap[config.accentColor];
  const accentBg  = accentBgMap[config.accentColor];
  const sbBg      = sidebarBgMap[config.sidebarStyle];
  const sbText    = sidebarTextMap[config.sidebarStyle];

  return (
    <div
      style={{
        width: '100%', height: 220,
        background: pageBg,
        borderRadius: 10,
        border: `1px solid ${cardBorder}`,
        overflow: 'hidden',
        display: 'flex',
        fontFamily: config.fontFamily === 'mono' ? 'monospace' : 'system-ui',
      }}
      aria-label="Live dashboard preview"
      role="img"
    >
      {/* Sidebar */}
      <div style={{ width: config.sidebarCollapsed ? 36 : 80, background: sbBg, padding: '10px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Brand */}
        <div style={{ padding: '0 8px 8px', borderBottom: `1px solid rgba(255,255,255,.08)`, marginBottom: 4 }}>
          <div style={{ width: 20, height: 20, background: accent, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: '#fff', borderRadius: 2 }} />
          </div>
        </div>
        {/* Nav items */}
        {[true, false, false, false, false].map((active, i) => (
          <div key={i} style={{
            margin: '0 6px',
            padding: '5px 6px',
            borderRadius: 5,
            background: active ? accent : 'transparent',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: active ? '#fff' : sbText, opacity: active ? 1 : 0.5 }} />
            {!config.sidebarCollapsed && <div style={{ height: 5, width: 30, borderRadius: 2, background: active ? '#fff' : sbText, opacity: active ? 1 : 0.4 }} />}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: pad, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
        {/* Page title */}
        <div style={{ height: 8, width: 120, background: textCol, borderRadius: 3, opacity: .9 }} />
        <div style={{ height: 5, width: 80, background: textSec, borderRadius: 3, opacity: .5 }} />

        {/* KPI cards */}
        <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
          {[accent, '#16A34A', '#EA580C', '#DC2626'].map((c, i) => (
            <div key={i} style={{
              flex: 1, background: cardBg, border: `1px solid ${cardBorder}`,
              borderRadius: radius, padding: 6,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: Math.max(radius - 4, 2), background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: 1, background: c }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, width: '70%', background: textSec, borderRadius: 2, opacity: .5, marginBottom: 3 }} />
                <div style={{ height: 7, width: '50%', background: textCol, borderRadius: 2, opacity: .9 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Chart row */}
        <div style={{ display: 'flex', gap: 5, flex: 1 }}>
          <div style={{ flex: 2, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: radius, padding: 6, overflow: 'hidden' }}>
            <div style={{ height: 4, width: 60, background: textCol, borderRadius: 2, marginBottom: 6, opacity: .8 }} />
            <svg width="100%" height="50" viewBox="0 0 120 50" preserveAspectRatio="none">
              <polyline fill="none" stroke={accent} strokeWidth="1.5" points="0,40 20,30 40,35 60,20 80,25 100,15 120,18" />
              <polyline fill="none" stroke="#EA580C" strokeWidth="1" strokeDasharray="3 2" points="0,45 20,40 40,44 60,36 80,38 100,32 120,35" />
            </svg>
          </div>
          <div style={{ flex: 1, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: radius, padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ height: 4, width: 50, background: textCol, borderRadius: 2, opacity: .8 }} />
            {[[accent, '60%'], ['#16A34A', '25%'], ['#DC2626', '15%']].map(([c, w], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0 }} />
                <div style={{ flex: 1, height: 3, background: cardBorder, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: w, height: '100%', background: c, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const { config, update } = useAppearance();
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">

      {/* Live preview */}
      <div className="bg-surface border border-border rounded-card p-6">
        <div className="mb-4">
          <h2 className="text-heading text-primary">Live preview</h2>
          <p className="text-label text-secondary mt-0.5">Changes apply instantly across the dashboard</p>
        </div>
        <DashboardPreview config={config} />
      </div>

      {/* Color scheme */}
      <Section title="Color scheme" description="Controls the overall light/dark appearance of the interface">
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-4">
            {([
              { value: 'light',  label: 'Light',  icon: 'ti-sun'         },
              { value: 'dark',   label: 'Dark',   icon: 'ti-moon'        },
              { value: 'system', label: 'System', icon: 'ti-device-laptop' },
            ] as { value: ColorScheme; label: string; icon: string }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ colorScheme: opt.value })}
                className={`flex flex-col items-center gap-3 p-4 rounded-card border-2 transition-all
                  ${config.colorScheme === opt.value
                    ? 'border-info bg-info-bg'
                    : 'border-border bg-surface hover:border-info/40'}`}
              >
                <i className={`ti ${opt.icon} text-2xl ${config.colorScheme === opt.value ? 'text-info' : 'text-secondary'}`} aria-hidden="true" />
                <span className={`text-label font-medium ${config.colorScheme === opt.value ? 'text-info' : 'text-secondary'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Accent color */}
      <Section title="Accent color" description="Primary action color used for buttons, active states, and highlights">
        <div className="px-6 py-5">
          <div className="flex gap-4 flex-wrap">
            {ACCENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ accentColor: opt.value })}
                aria-label={`Set accent to ${opt.label}`}
                className={`flex flex-col items-center gap-2 group`}
              >
                <div
                  className={`w-10 h-10 rounded-pill border-2 transition-all
                    ${config.accentColor === opt.value ? 'border-primary scale-110 shadow-sm' : 'border-transparent hover:border-border'}`}
                  style={{ background: opt.hex }}
                />
                <span className={`text-label ${config.accentColor === opt.value ? 'text-primary font-medium' : 'text-tertiary'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Sidebar style */}
      <Section title="Sidebar style" description="Choose how the navigation sidebar looks">
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-4">
            {([
              { value: 'dark',    label: 'Dark',    desc: 'Deep navy sidebar'   },
              { value: 'light',   label: 'Light',   desc: 'White sidebar'       },
              { value: 'colored', label: 'Colored', desc: 'Accent-color sidebar' },
            ] as { value: SidebarStyle; label: string; desc: string }[]).map((opt) => {
              const sbBgs: Record<SidebarStyle, string> = { dark: '#0F1B3D', light: '#F9FAFB', colored: '#2563EB' };
              return (
                <button
                  key={opt.value}
                  onClick={() => update({ sidebarStyle: opt.value })}
                  className={`flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all
                    ${config.sidebarStyle === opt.value
                      ? 'border-info bg-info-bg'
                      : 'border-border bg-surface hover:border-info/40'}`}
                >
                  {/* Mini sidebar swatch */}
                  <div style={{ background: sbBgs[opt.value], width: 24, height: 36, borderRadius: 5, flexShrink: 0, border: '1px solid #E5E7EB' }} />
                  <div>
                    <div className={`text-body font-medium ${config.sidebarStyle === opt.value ? 'text-info' : 'text-primary'}`}>
                      {opt.label}
                    </div>
                    <div className="text-label text-tertiary">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Layout density */}
      <Section title="Layout density" description="Controls card padding and spacing throughout the interface">
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-4">
            {([
              { value: 'compact',     label: 'Compact',     desc: 'More content per screen' },
              { value: 'comfortable', label: 'Comfortable', desc: 'Default balanced spacing' },
              { value: 'spacious',    label: 'Spacious',    desc: 'Relaxed, airy layout'    },
            ] as { value: Density; label: string; desc: string }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ density: opt.value })}
                className={`p-4 rounded-card border-2 text-left transition-all
                  ${config.density === opt.value
                    ? 'border-info bg-info-bg'
                    : 'border-border bg-surface hover:border-info/40'}`}
              >
                {/* Density visualisation */}
                <div className="flex flex-col gap-1 mb-3" aria-hidden="true">
                  {[100, 75, 90].map((w, i) => (
                    <div key={i} className="bg-border rounded-pill" style={{
                      height: opt.value === 'compact' ? 3 : opt.value === 'spacious' ? 5 : 4,
                      width: `${w}%`,
                      marginBottom: opt.value === 'compact' ? 1 : opt.value === 'spacious' ? 5 : 3,
                    }} />
                  ))}
                </div>
                <div className={`text-body font-medium ${config.density === opt.value ? 'text-info' : 'text-primary'}`}>
                  {opt.label}
                </div>
                <div className="text-label text-tertiary">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title="Font family" description="Controls text rendering across the entire dashboard">
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-4">
            {([
              { value: 'inter',  label: 'Inter',  sample: 'Aa — Clean grotesque'     },
              { value: 'system', label: 'System', sample: 'Aa — OS default font'      },
              { value: 'mono',   label: 'Mono',   sample: 'Aa — Monospaced code font' },
            ] as { value: FontFamily; label: string; sample: string }[]).map((opt) => {
              const fontPreview: Record<FontFamily, string> = {
                inter: "'Inter', system-ui, sans-serif",
                system: "system-ui, sans-serif",
                mono: "'JetBrains Mono', monospace",
              };
              return (
                <button
                  key={opt.value}
                  onClick={() => update({ fontFamily: opt.value })}
                  className={`p-4 rounded-card border-2 text-left transition-all
                    ${config.fontFamily === opt.value
                      ? 'border-info bg-info-bg'
                      : 'border-border bg-surface hover:border-info/40'}`}
                >
                  <div
                    className={`text-2xl mb-2 ${config.fontFamily === opt.value ? 'text-info' : 'text-primary'}`}
                    style={{ fontFamily: fontPreview[opt.value] }}
                    aria-hidden="true"
                  >
                    Aa
                  </div>
                  <div className={`text-body font-medium ${config.fontFamily === opt.value ? 'text-info' : 'text-primary'}`}>
                    {opt.label}
                  </div>
                  <div className="text-label text-tertiary">{opt.sample}</div>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Border radius */}
      <Section title="Corner radius" description="Controls the roundness of cards, badges, and buttons">
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-4">
            {([
              { value: 'sharp',   label: 'Sharp',   r: '2px'  },
              { value: 'rounded', label: 'Rounded', r: '12px' },
              { value: 'pill',    label: 'Pill',    r: '24px' },
            ] as { value: BorderRadius; label: string; r: string }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ borderRadius: opt.value })}
                className={`p-4 rounded-card border-2 text-left transition-all
                  ${config.borderRadius === opt.value
                    ? 'border-info bg-info-bg'
                    : 'border-border bg-surface hover:border-info/40'}`}
              >
                <div
                  className={`w-12 h-8 border-2 mb-3 ${config.borderRadius === opt.value ? 'border-info' : 'border-border'}`}
                  style={{ borderRadius: opt.r }}
                  aria-hidden="true"
                />
                <div className={`text-body font-medium ${config.borderRadius === opt.value ? 'text-info' : 'text-primary'}`}>
                  {opt.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Sidebar & display toggles */}
      <Section title="Display options" description="Fine-grained controls for the dashboard layout">
        <Row label="Collapsed sidebar" description="Start with the sidebar in icon-only mode">
          <Toggle enabled={config.sidebarCollapsed} onChange={(v) => update({ sidebarCollapsed: v })} />
        </Row>
        <Row label="Animations" description="Transitions, hover effects, and loading animations">
          <Toggle enabled={config.showAnimations} onChange={(v) => update({ showAnimations: v })} />
        </Row>
        <Row label="Compact tables" description="Reduce row height in all data tables">
          <Toggle enabled={config.compactTables} onChange={(v) => update({ compactTables: v })} />
        </Row>
        <Row label="Show avatars" description="Display user/hospital initials avatars in tables and lists">
          <Toggle enabled={config.showAvatars} onChange={(v) => update({ showAvatars: v })} />
        </Row>
      </Section>

      {/* Reset + Save */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => update(DEFAULTS)}
          className="text-body text-secondary hover:text-primary border border-border px-4 py-2 rounded-badge transition-colors flex items-center gap-2"
        >
          <i className="ti ti-refresh text-sm" aria-hidden="true" />
          Reset to defaults
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </div>
  );
}

// ─── Existing tab content (unchanged logic, updated styling) ──────────────────

function GeneralSettings() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="space-y-5">
      <Section title="Platform identity" description="How the platform presents itself to tenants">
        <Row label="Platform name" description="Shown in emails and tenant portals"><TextInput defaultValue="Chronos" /></Row>
        <Row label="Support email" description="Tenants contact this address for help"><TextInput defaultValue="support@chronos.app" type="email" /></Row>
        <Row label="Platform URL" description="Base URL for tenant portals"><TextInput defaultValue="https://chronos.app" /></Row>
        <Row label="Default timezone" description="Used for platform-wide reports">
          <select className="bg-page border border-border rounded-badge px-3 py-2 text-body text-primary focus:outline-none focus:border-info w-64">
            <option>Africa/Nairobi (EAT +3)</option>
            <option>UTC</option>
            <option>Africa/Lagos (WAT +1)</option>
          </select>
        </Row>
        <Row label="Default currency" description="Displayed in billing and invoices">
          <select className="bg-page border border-border rounded-badge px-3 py-2 text-body text-primary focus:outline-none focus:border-info w-64">
            <option>USD ($)</option><option>KES (KSh)</option><option>EUR (€)</option>
          </select>
        </Row>
      </Section>
      <Section title="Trial settings" description="Defaults applied when onboarding new hospitals">
        <Row label="Default trial duration" description="Days before payment is required">
          <select className="bg-page border border-border rounded-badge px-3 py-2 text-body text-primary focus:outline-none focus:border-info w-64">
            <option>14 days</option><option>21 days</option><option>30 days</option>
          </select>
        </Row>
        <Row label="Auto-suspend on expiry" description="Automatically suspend unpaid accounts after trial ends">
          <Toggle enabled={true} onChange={() => {}} />
        </Row>
      </Section>
      <div className="flex justify-end"><SaveButton onClick={save} saved={saved} /></div>
    </div>
  );
}

function SecuritySettings() {
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState([
    { id:'1', device:'Chrome · macOS',   ip:'41.90.64.12', location:'Nairobi, KE', current:true,  lastActive:'Now'         },
    { id:'2', device:'Safari · iPhone',  ip:'41.90.64.55', location:'Nairobi, KE', current:false, lastActive:'2 hours ago' },
  ]);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="space-y-5">
      <Section title="Authentication" description="Super admin login security settings">
        <Row label="Two-factor authentication" description="Required for all super admin logins">
          <div className="flex items-center gap-3">
            <span className="text-label text-success bg-success-bg border border-success/30 px-2 py-0.5 rounded-pill">Enabled</span>
            <button className="text-label text-secondary border border-border px-3 py-1.5 rounded-badge hover:text-primary transition-colors">Manage 2FA</button>
          </div>
        </Row>
        <Row label="Session timeout" description="Auto-logout after inactivity">
          <select className="bg-page border border-border rounded-badge px-3 py-2 text-body text-primary focus:outline-none focus:border-info w-64">
            <option>30 minutes</option><option>1 hour</option><option>4 hours</option>
          </select>
        </Row>
        <Row label="Require reason for impersonation" description="Super admins must provide a reason before accessing a tenant">
          <Toggle enabled={true} onChange={() => {}} />
        </Row>
        <Row label="IP allowlist" description="Restrict access to specific IPs (comma-separated)">
          <TextInput placeholder="e.g. 41.90.64.0/24, 192.168.1.1" />
        </Row>
      </Section>
      <Section title="Active sessions" description="All devices currently logged in">
        <div className="divide-y divide-border">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.current ? 'bg-success' : 'bg-border'}`} aria-hidden="true" />
                <div>
                  <div className="text-body text-primary flex items-center gap-2">
                    {s.device}
                    {s.current && <span className="text-label text-success bg-success-bg px-1.5 py-0.5 rounded-pill">Current</span>}
                  </div>
                  <div className="text-label text-tertiary mt-0.5">{s.ip} · {s.location} · {s.lastActive}</div>
                </div>
              </div>
              {!s.current && (
                <button onClick={() => setSessions(p => p.filter(x => x.id !== s.id))}
                  className="text-label text-danger border border-danger/30 px-3 py-1.5 rounded-badge hover:bg-danger-bg transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>
      <div className="flex justify-end"><SaveButton onClick={save} saved={saved} /></div>
    </div>
  );
}

function NotificationSettings() {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({ new_tenant_email:true, new_tenant_slack:true, trial_expiry_email:true, trial_expiry_slack:false, payment_failed_email:true, payment_failed_slack:true, suspension_email:true, suspension_slack:false, system_error_email:true, system_error_slack:true, weekly_digest:true, monthly_report:true });
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const events = [
    { label:'New tenant onboarded',    emailKey:'new_tenant_email' as const,     slackKey:'new_tenant_slack' as const      },
    { label:'Trial about to expire',   emailKey:'trial_expiry_email' as const,   slackKey:'trial_expiry_slack' as const    },
    { label:'Payment failed',          emailKey:'payment_failed_email' as const, slackKey:'payment_failed_slack' as const  },
    { label:'Tenant suspended',        emailKey:'suspension_email' as const,     slackKey:'suspension_slack' as const      },
    { label:'System error / downtime', emailKey:'system_error_email' as const,   slackKey:'system_error_slack' as const    },
  ];
  return (
    <div className="space-y-5">
      <Section title="Notification channels" description="Where to send super admin alerts">
        <Row label="Email notifications" description="Sent to the super admin account email"><Toggle enabled={true} onChange={() => {}} /></Row>
        <Row label="Slack webhook" description="Post alerts to a Slack channel">
          <div className="flex items-center gap-2">
            <TextInput placeholder="https://hooks.slack.com/services/..." />
            <button className="text-label text-secondary border border-border px-3 py-2 rounded-badge hover:text-primary transition-colors">Test</button>
          </div>
        </Row>
      </Section>
      <Section title="Event subscriptions" description="Choose which events trigger notifications">
        <div className="px-6 py-3 border-b border-border grid grid-cols-3 text-label font-medium text-secondary uppercase tracking-wider">
          <span>Event</span><span className="text-center">Email</span><span className="text-center">Slack</span>
        </div>
        {events.map(e => (
          <div key={e.label} className="px-6 py-4 grid grid-cols-3 items-center hover:bg-page transition-colors">
            <span className="text-body text-primary">{e.label}</span>
            <div className="flex justify-center"><Toggle enabled={prefs[e.emailKey]} onChange={() => toggle(e.emailKey)} /></div>
            <div className="flex justify-center"><Toggle enabled={prefs[e.slackKey]} onChange={() => toggle(e.slackKey)} /></div>
          </div>
        ))}
      </Section>
      <Section title="Digest reports" description="Scheduled summary emails">
        <Row label="Weekly digest" description="Every Monday at 8:00 AM EAT"><Toggle enabled={prefs.weekly_digest} onChange={() => toggle('weekly_digest')} /></Row>
        <Row label="Monthly revenue report" description="1st of every month"><Toggle enabled={prefs.monthly_report} onChange={() => toggle('monthly_report')} /></Row>
      </Section>
      <div className="flex justify-end"><SaveButton onClick={save} saved={saved} /></div>
    </div>
  );
}

function MaintenanceSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [banner, setBanner] = useState(false);
  return (
    <div className="space-y-5">
      {maintenanceMode && (
        <div className="bg-danger-bg border border-danger/30 rounded-card p-4 flex items-center gap-3">
          <i className="ti ti-alert-circle text-danger text-xl" aria-hidden="true" />
          <div>
            <div className="text-body font-medium text-danger">Maintenance mode is ON</div>
            <div className="text-label text-danger/80 mt-0.5">All tenant portals are currently inaccessible.</div>
          </div>
        </div>
      )}
      <Section title="Maintenance mode" description="Take the platform offline for all tenants">
        <Row label="Enable maintenance mode" description="Blocks all tenant logins and shows a maintenance page">
          <div className="flex items-center gap-3">
            <Toggle enabled={maintenanceMode} onChange={setMaintenanceMode} />
            {maintenanceMode && <span className="text-label text-danger font-medium">ACTIVE</span>}
          </div>
        </Row>
        <Row label="Maintenance message"><TextInput defaultValue="We're upgrading Chronos. Back shortly." /></Row>
        <Row label="Estimated duration"><TextInput defaultValue="~30 minutes" /></Row>
      </Section>
      <Section title="Announcement banner" description="Show a dismissible banner across all tenant dashboards">
        <Row label="Enable banner" description="Visible to all logged-in hospital admins"><Toggle enabled={banner} onChange={setBanner} /></Row>
      </Section>
      <Section title="Data & system" description="Irreversible platform operations">
        <Row label="Clear all cache" description="Flush Redis cache across all services">
          <button className="text-label text-secondary bg-page border border-border px-4 py-2 rounded-badge hover:text-primary transition-colors">Flush cache</button>
        </Row>
        <Row label="Download platform audit log" description="Full CSV export of all super admin actions">
          <button className="text-label text-secondary bg-page border border-border px-4 py-2 rounded-badge hover:text-primary transition-colors flex items-center gap-1.5">
            <i className="ti ti-download text-sm" aria-hidden="true" />Export CSV
          </button>
        </Row>
        <div className="px-6 py-4 bg-danger-bg/40">
          <div className="text-label font-medium text-danger uppercase tracking-wider mb-3">Danger zone</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-body text-primary">Wipe all tenant data</div>
              <div className="text-label text-secondary mt-0.5">Permanently deletes all tenant records. Cannot be undone.</div>
            </div>
            <button className="text-label text-danger bg-danger-bg border border-danger/30 px-4 py-2 rounded-badge hover:bg-danger/10 transition-colors">Delete all data</button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function IntegrationSettings() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const integrations = [
    { name:'Stripe',   description:'Payment processing and subscription billing', icon:'ti-credit-card',   connected:false, intent:'info'    },
    { name:'SendGrid', description:'Transactional email delivery',                icon:'ti-mail',          connected:true,  intent:'info'    },
    { name:'Twilio',   description:'SMS notifications for clock-in alerts',       icon:'ti-device-mobile', connected:true,  intent:'success' },
    { name:'Slack',    description:'Team alerts and notifications',                icon:'ti-message',       connected:false, intent:'warning' },
    { name:'AWS S3',   description:'File storage for exports and attachments',     icon:'ti-cloud',         connected:true,  intent:'warning' },
    { name:'Sentry',   description:'Error tracking and performance monitoring',    icon:'ti-bug',           connected:false, intent:'neutral' },
  ];
  const iconBg: Record<string, string> = { info:'bg-info-bg', success:'bg-success-bg', warning:'bg-warning-bg', neutral:'bg-page' };
  const iconColor: Record<string, string> = { info:'text-info', success:'text-success', warning:'text-warning', neutral:'text-secondary' };
  return (
    <div className="space-y-5">
      <Section title="Connected integrations" description="Third-party services powering the Chronos platform">
        <div className="grid grid-cols-2 divide-x divide-y divide-border">
          {integrations.map(ig => (
            <div key={ig.name} className="flex items-center justify-between px-6 py-5 hover:bg-page transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-badge flex items-center justify-center ${iconBg[ig.intent]}`}>
                  <i className={`ti ${ig.icon} text-xl ${iconColor[ig.intent]}`} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-body font-medium text-primary flex items-center gap-2">
                    {ig.name}
                    {ig.connected
                      ? <span className="text-label text-success bg-success-bg border border-success/30 px-1.5 py-0.5 rounded-pill">Connected</span>
                      : <span className="text-label text-secondary bg-page border border-border px-1.5 py-0.5 rounded-pill">Not connected</span>}
                  </div>
                  <div className="text-label text-tertiary mt-0.5">{ig.description}</div>
                </div>
              </div>
              <button className={`text-label px-3 py-1.5 rounded-badge border transition-colors ${ig.connected ? 'text-secondary border-border hover:text-primary' : 'text-info border-info/30 bg-info-bg hover:bg-info/10'}`}>
                {ig.connected ? 'Configure' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </Section>
      <Section title="API keys" description="For internal services and third-party access">
        <Row label="Platform API key" description="Used by internal microservices">
          <div className="flex items-center gap-2">
            <code className="bg-page border border-border rounded-badge px-3 py-2 text-label text-secondary font-mono w-64 truncate">sk_live_••••••••••••••••</code>
            <button className="text-label text-secondary border border-border px-3 py-2 rounded-badge hover:text-primary transition-colors">Reveal</button>
            <button className="text-label text-secondary border border-border px-3 py-2 rounded-badge hover:text-primary transition-colors">Rotate</button>
          </div>
        </Row>
      </Section>
      <div className="flex justify-end"><SaveButton onClick={save} saved={saved} /></div>
    </div>
  );
}

function BillingConfig() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="space-y-5">
      <Section title="Invoice settings" description="Applied to all generated invoices">
        <Row label="Company name" description="Shown on invoice header"><TextInput defaultValue="Chronos Technologies Ltd" /></Row>
        <Row label="Company address"><TextInput defaultValue="Westlands, Nairobi, Kenya" /></Row>
        <Row label="Tax / VAT number"><TextInput defaultValue="P051234567X" /></Row>
        <Row label="Invoice prefix"><TextInput defaultValue="INV-" /></Row>
        <Row label="Payment terms" description="Shown on invoices">
          <select className="bg-page border border-border rounded-badge px-3 py-2 text-body text-primary focus:outline-none focus:border-info w-64">
            <option>Due on receipt</option><option>Net 7</option><option>Net 14</option><option>Net 30</option>
          </select>
        </Row>
      </Section>
      <Section title="Billing automation" description="Rules applied to subscriptions automatically">
        <Row label="Auto-generate invoices" description="Create invoices at the start of each billing period"><Toggle enabled={true} onChange={() => {}} /></Row>
        <Row label="Send invoice emails" description="Email invoices to tenant admins automatically"><Toggle enabled={true} onChange={() => {}} /></Row>
        <Row label="Suspend on non-payment" description="Auto-suspend after all retries fail"><Toggle enabled={true} onChange={() => {}} /></Row>
      </Section>
      <div className="flex justify-end"><SaveButton onClick={save} saved={saved} /></div>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general',       label: 'General',       icon: 'ti-settings-2'    },
  { id: 'appearance',    label: 'Appearance',     icon: 'ti-palette'       },
  { id: 'security',      label: 'Security',       icon: 'ti-shield-check'  },
  { id: 'notifications', label: 'Notifications',  icon: 'ti-bell'          },
  { id: 'maintenance',   label: 'Maintenance',    icon: 'ti-tool'          },
  { id: 'billing',       label: 'Billing config', icon: 'ti-receipt'       },
  { id: 'integrations',  label: 'Integrations',   icon: 'ti-plug'          },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');

  return (
    // bg-page = #F5F6FA — §3.2
    <div className="min-h-screen bg-page px-8 py-8 space-y-6">

      {/* Header — §7.3 */}
      <div>
        <h1 className="text-display text-primary">Platform Settings</h1>
        <p className="text-body text-secondary mt-1">Configure and control every aspect of the Chronos platform</p>
      </div>

      <div className="flex gap-6">

        {/* Settings sidebar nav — card variant */}
        <nav className="w-52 flex-shrink-0" aria-label="Settings navigation">
          <div className="bg-surface border border-border rounded-card p-2 space-y-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-badge text-body transition-colors text-left
                  ${tab === t.id
                    ? 'bg-info-bg text-info font-medium'
                    : 'text-secondary hover:bg-page hover:text-primary'}`}
              >
                <i className={`ti ${t.icon} text-base ${tab === t.id ? 'text-info' : 'text-tertiary'}`} aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {tab === 'general'       && <GeneralSettings />}
          {tab === 'appearance'    && <AppearanceSettings />}
          {tab === 'security'      && <SecuritySettings />}
          {tab === 'notifications' && <NotificationSettings />}
          {tab === 'maintenance'   && <MaintenanceSettings />}
          {tab === 'billing'       && <BillingConfig />}
          {tab === 'integrations'  && <IntegrationSettings />}
        </div>
      </div>
    </div>
  );
}