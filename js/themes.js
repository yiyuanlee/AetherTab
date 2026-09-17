/**
 * Four page-wide color themes. Typography and spacing stay consistent while
 * backgrounds, surfaces, borders, inputs, shadows, and accents move together.
 */
export const COLOR_THEMES = {
  default: {
    primary: '#0071e3',
    hover: '#0077ed',
    rgb: '0, 113, 227',
    light: {
      page: '#f5f5f7', surface: '#ffffff', soft: '#f7f7f9', hover: '#f0f0f2',
      sidebar: 'rgba(251, 251, 253, .97)', input: '#f0f0f2',
      border: 'rgba(0, 0, 0, .08)', borderStrong: 'rgba(0, 0, 0, .12)',
      text: '#1d1d1f', secondary: '#6e6e73', muted: '#86868b',
      shadow: '0 1px 2px rgba(0, 0, 0, .02), 0 8px 26px rgba(0, 0, 0, .035)',
      shadowHover: '0 1px 2px rgba(0, 0, 0, .03), 0 10px 32px rgba(0, 0, 0, .055)',
    },
    dark: {
      page: '#000000', surface: '#1c1c1e', soft: '#242426', hover: '#2c2c2e',
      sidebar: 'rgba(18, 18, 20, .97)', input: '#2c2c2e',
      border: 'rgba(255, 255, 255, .10)', borderStrong: 'rgba(255, 255, 255, .16)',
      text: '#f5f5f7', secondary: '#a1a1a6', muted: '#86868b',
      shadow: 'none', shadowHover: 'none',
    },
  },
  sage: {
    primary: '#40845a',
    hover: '#327148',
    rgb: '64, 132, 90',
    light: {
      page: '#eff4f0', surface: '#fbfdfb', soft: '#e8efe9', hover: '#dfe8e1',
      sidebar: 'rgba(245, 249, 246, .97)', input: '#e4ece6',
      border: 'rgba(42, 77, 53, .12)', borderStrong: 'rgba(42, 77, 53, .18)',
      text: '#18231b', secondary: '#5f6d63', muted: '#7d8980',
      shadow: '0 1px 2px rgba(32, 65, 42, .025), 0 8px 26px rgba(32, 65, 42, .055)',
      shadowHover: '0 1px 2px rgba(32, 65, 42, .04), 0 10px 32px rgba(32, 65, 42, .08)',
    },
    dark: {
      page: '#0b120d', surface: '#152019', soft: '#1b2920', hover: '#223329',
      sidebar: 'rgba(13, 21, 16, .98)', input: '#223027',
      border: 'rgba(183, 215, 193, .12)', borderStrong: 'rgba(183, 215, 193, .19)',
      text: '#f2f7f3', secondary: '#a5b4a9', muted: '#7f9084',
      shadow: 'none', shadowHover: 'none',
    },
  },
  lilac: {
    primary: '#8067b7',
    hover: '#6e55a4',
    rgb: '128, 103, 183',
    light: {
      page: '#f2f0f7', surface: '#fcfbfe', soft: '#eae6f2', hover: '#e3deed',
      sidebar: 'rgba(247, 245, 251, .97)', input: '#e8e3f0',
      border: 'rgba(75, 59, 103, .12)', borderStrong: 'rgba(75, 59, 103, .18)',
      text: '#211d29', secondary: '#696474', muted: '#85808f',
      shadow: '0 1px 2px rgba(68, 51, 98, .025), 0 8px 26px rgba(68, 51, 98, .055)',
      shadowHover: '0 1px 2px rgba(68, 51, 98, .04), 0 10px 32px rgba(68, 51, 98, .08)',
    },
    dark: {
      page: '#100e16', surface: '#1d1a26', soft: '#252130', hover: '#2e293b',
      sidebar: 'rgba(18, 15, 25, .98)', input: '#2b2637',
      border: 'rgba(213, 200, 237, .12)', borderStrong: 'rgba(213, 200, 237, .19)',
      text: '#f6f3fa', secondary: '#b1a8bc', muted: '#8d8498',
      shadow: 'none', shadowHover: 'none',
    },
  },
  sand: {
    primary: '#a9674b',
    hover: '#92563d',
    rgb: '169, 103, 75',
    light: {
      page: '#f5f0eb', surface: '#fffdf9', soft: '#efe6df', hover: '#e8ddd4',
      sidebar: 'rgba(250, 247, 243, .97)', input: '#ede3db',
      border: 'rgba(98, 65, 48, .12)', borderStrong: 'rgba(98, 65, 48, .18)',
      text: '#28201c', secondary: '#71655e', muted: '#8d817a',
      shadow: '0 1px 2px rgba(89, 54, 37, .025), 0 8px 26px rgba(89, 54, 37, .055)',
      shadowHover: '0 1px 2px rgba(89, 54, 37, .04), 0 10px 32px rgba(89, 54, 37, .08)',
    },
    dark: {
      page: '#15100d', surface: '#231c18', soft: '#2b231e', hover: '#352a24',
      sidebar: 'rgba(23, 17, 14, .98)', input: '#312720',
      border: 'rgba(235, 207, 190, .12)', borderStrong: 'rgba(235, 207, 190, .19)',
      text: '#fbf5f1', secondary: '#b9aaa1', muted: '#95867d',
      shadow: 'none', shadowHover: 'none',
    },
  },
};

const THEME_TOKEN_KEYS = [
  'accent-primary', 'accent-primary-hover', 'accent-secondary', 'accent-tertiary',
  'accent-gradient', 'accent-gradient-v', 'accent-gradient-h', 'accent-muted',
  'accent-focus-ring', 'page-bg', 'surface', 'surface-soft', 'surface-hover',
  'separator', 'separator-strong', 'text-primary', 'text-secondary', 'text-muted',
  'bg-gradient', 'panel-bg', 'panel-border', 'sidebar-bg', 'sidebar-border',
  'card-bg', 'card-bg-hover', 'card-border', 'card-border-hover', 'card-shadow',
  'card-shadow-hover', 'input-bg', 'input-border', 'input-focus',
  'text-accent-gradient',
];

export function applyColorSchemeTokens(scheme, mode = 'light') {
  const palette = COLOR_THEMES[scheme] || COLOR_THEMES.default;
  const appearance = palette[mode === 'dark' ? 'dark' : 'light'];
  const isDark = mode === 'dark';
  const tokens = {
    'accent-primary': palette.primary,
    'accent-primary-hover': palette.hover,
    'accent-secondary': palette.primary,
    'accent-tertiary': palette.primary,
    'accent-gradient': palette.primary,
    'accent-gradient-v': palette.primary,
    'accent-gradient-h': palette.primary,
    'accent-muted': `rgba(${palette.rgb}, ${isDark ? '.18' : '.11'})`,
    'accent-focus-ring': `rgba(${palette.rgb}, ${isDark ? '.27' : '.19'})`,
    'page-bg': appearance.page,
    surface: appearance.surface,
    'surface-soft': appearance.soft,
    'surface-hover': appearance.hover,
    separator: appearance.border,
    'separator-strong': appearance.borderStrong,
    'text-primary': appearance.text,
    'text-secondary': appearance.secondary,
    'text-muted': appearance.muted,
    'bg-gradient': appearance.page,
    'panel-bg': appearance.surface,
    'panel-border': appearance.border,
    'sidebar-bg': appearance.sidebar,
    'sidebar-border': appearance.border,
    'card-bg': appearance.surface,
    'card-bg-hover': appearance.hover,
    'card-border': appearance.border,
    'card-border-hover': `rgba(${palette.rgb}, ${isDark ? '.34' : '.24'})`,
    'card-shadow': appearance.shadow,
    'card-shadow-hover': appearance.shadowHover,
    'input-bg': appearance.input,
    'input-border': 'transparent',
    'input-focus': `rgba(${palette.rgb}, ${isDark ? '.26' : '.18'})`,
    'text-accent-gradient': appearance.text,
  };

  const root = document.documentElement;
  THEME_TOKEN_KEYS.forEach((key) => {
    root.style.setProperty(`--${key}`, tokens[key], 'important');
  });
}
