/** CSS custom properties overridden per color scheme + light/dark mode. */
export const THEME_TOKEN_KEYS = [
  'bg-gradient',
  'bg-gradient-orb1',
  'bg-gradient-orb2',
  'bg-gradient-orb3',
  'panel-bg',
  'panel-border',
  'sidebar-bg',
  'sidebar-border',
  'card-bg',
  'card-bg-hover',
  'card-border',
  'card-border-hover',
  'card-shadow',
  'card-shadow-hover',
  'accent-primary',
  'accent-primary-hover',
  'accent-secondary',
  'accent-tertiary',
  'accent-gradient',
  'accent-gradient-v',
  'accent-gradient-h',
  'text-accent-gradient',
  'accent-glow',
  'accent-glow-secondary',
  'accent-muted',
  'accent-focus-ring',
  'btn-shadow',
  'btn-shadow-hover',
  'input-bg',
  'input-border',
  'input-focus',
];

/** Build tokens from 2–3 flag colors with equal visual weight. */
function flagTheme({ dark, c1, c2, c3, rgb1, rgb2, rgb3, interactive, interactiveHover }) {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  const rgb3Resolved = rgb3 ?? rgb2;
  const [r3, g3, b3] = rgb3Resolved;
  const c3Resolved = c3 ?? c2;
  const accentPrimary = interactive ?? c1;
  const accentPrimaryHover = interactiveHover ?? c2;

  if (dark) {
    return {
      'bg-gradient': `linear-gradient(145deg, rgba(${r1},${g1},${b1},0.22) 0%, #060608 35%, rgba(${r2},${g2},${b2},0.14) 70%, #040406 100%)`,
      'bg-gradient-orb1': `radial-gradient(650px circle at 5% 10%, rgba(${r1},${g1},${b1},0.32), transparent)`,
      'bg-gradient-orb2': `radial-gradient(750px circle at 95% 85%, rgba(${r2},${g2},${b2},0.26), transparent)`,
      'bg-gradient-orb3': `radial-gradient(500px circle at 50% 45%, rgba(${r3},${g3},${b3},0.14), transparent)`,
      'panel-bg': `linear-gradient(160deg, rgba(${r1},${g1},${b1},0.14) 0%, rgba(12,12,18,0.78) 45%, rgba(${r2},${g2},${b2},0.1) 100%)`,
      'panel-border': `rgba(${r1},${g1},${b1},0.28)`,
      'sidebar-bg': `linear-gradient(180deg, rgba(${r1},${g1},${b1},0.16) 0%, rgba(8,8,14,0.9) 40%, rgba(${r2},${g2},${b2},0.12) 100%)`,
      'sidebar-border': `rgba(${r2},${g2},${b2},0.24)`,
      'card-bg': `linear-gradient(135deg, rgba(${r1},${g1},${b1},0.1) 0%, rgba(${r2},${g2},${b2},0.06) 100%)`,
      'card-bg-hover': `linear-gradient(135deg, rgba(${r1},${g1},${b1},0.18) 0%, rgba(${r2},${g2},${b2},0.12) 100%)`,
      'card-border': `rgba(${r1},${g1},${b1},0.2)`,
      'card-border-hover': `rgba(${r2},${g2},${b2},0.45)`,
      'card-shadow': '0 8px 32px rgba(0, 0, 0, 0.42)',
      'card-shadow-hover': `0 16px 48px rgba(${r1},${g1},${b1}, 0.18), 0 8px 24px rgba(${r2},${g2},${b2}, 0.14)`,
      'accent-primary': accentPrimary,
      'accent-primary-hover': accentPrimaryHover,
      'accent-secondary': c2,
      'accent-tertiary': c3Resolved,
      'accent-gradient': `linear-gradient(135deg, ${c1} 0%, ${c3Resolved} 50%, ${c2} 100%)`,
      'accent-gradient-v': `linear-gradient(180deg, ${c1} 0%, ${c3Resolved} 50%, ${c2} 100%)`,
      'accent-gradient-h': `linear-gradient(90deg, ${c1} 0%, ${c3Resolved} 50%, ${c2} 100%)`,
      'text-accent-gradient': `linear-gradient(135deg, #f8fafc 0%, ${c1} 45%, ${c2} 100%)`,
      'accent-glow': `rgba(${r1},${g1},${b1}, 0.5)`,
      'accent-glow-secondary': `rgba(${r2},${g2},${b2}, 0.4)`,
      'accent-muted': `rgba(${r1},${g1},${b1}, 0.16)`,
      'accent-focus-ring': `rgba(${r2},${g2},${b2}, 0.38)`,
      'btn-shadow': `0 4px 18px rgba(${r1},${g1},${b1}, 0.35), 0 2px 8px rgba(${r2},${g2},${b2}, 0.25)`,
      'btn-shadow-hover': `0 8px 28px rgba(${r1},${g1},${b1}, 0.45), 0 4px 14px rgba(${r2},${g2},${b2}, 0.35)`,
      'input-bg': `linear-gradient(135deg, rgba(${r1},${g1},${b1}, 0.08) 0%, rgba(${r2},${g2},${b2}, 0.05) 100%)`,
      'input-border': `rgba(${r1},${g1},${b1}, 0.22)`,
      'input-focus': `rgba(${r2},${g2},${b2}, 0.42)`,
    };
  }

  return {
    'bg-gradient': `linear-gradient(145deg, rgba(${r1},${g1},${b1},0.12) 0%, #f8fafc 40%, rgba(${r2},${g2},${b2},0.1) 100%)`,
    'bg-gradient-orb1': `radial-gradient(650px circle at 5% 10%, rgba(${r1},${g1},${b1},0.2), transparent)`,
    'bg-gradient-orb2': `radial-gradient(750px circle at 95% 85%, rgba(${r2},${g2},${b2},0.16), transparent)`,
    'bg-gradient-orb3': `radial-gradient(500px circle at 50% 30%, rgba(${r3},${g3},${b3},0.1), transparent)`,
    'panel-bg': `linear-gradient(160deg, rgba(${r1},${g1},${b1},0.1) 0%, rgba(255,255,255,0.82) 50%, rgba(${r2},${g2},${b2},0.08) 100%)`,
    'panel-border': `rgba(${r1},${g1},${b1}, 0.22)`,
    'sidebar-bg': `linear-gradient(180deg, rgba(${r1},${g1},${b1},0.1) 0%, rgba(255,255,255,0.92) 45%, rgba(${r2},${g2},${b2},0.08) 100%)`,
    'sidebar-border': `rgba(${r2},${g2},${b2}, 0.18)`,
    'card-bg': `linear-gradient(135deg, rgba(${r1},${g1},${b1},0.07) 0%, rgba(255,255,255,0.72) 50%, rgba(${r2},${g2},${b2},0.06) 100%)`,
    'card-bg-hover': `linear-gradient(135deg, rgba(${r1},${g1},${b1},0.14) 0%, rgba(255,255,255,0.88) 50%, rgba(${r2},${g2},${b2},0.1) 100%)`,
    'card-border': `rgba(${r1},${g1},${b1}, 0.14)`,
    'card-border-hover': `rgba(${r2},${g2},${b2}, 0.38)`,
    'card-shadow': `0 8px 32px rgba(${r1},${g1},${b1}, 0.08)`,
    'card-shadow-hover': `0 16px 48px rgba(${r1},${g1},${b1}, 0.12), 0 8px 24px rgba(${r2},${g2},${b2}, 0.1)`,
    'accent-primary': accentPrimary,
    'accent-primary-hover': accentPrimaryHover,
    'accent-secondary': c2,
    'accent-tertiary': c3Resolved,
    'accent-gradient': `linear-gradient(135deg, ${c1} 0%, ${c3Resolved} 50%, ${c2} 100%)`,
    'accent-gradient-v': `linear-gradient(180deg, ${c1} 0%, ${c3Resolved} 50%, ${c2} 100%)`,
    'accent-gradient-h': `linear-gradient(90deg, ${c1} 0%, ${c3Resolved} 50%, ${c2} 100%)`,
    'text-accent-gradient': `linear-gradient(135deg, #0f172a 0%, ${c1} 45%, ${c2} 100%)`,
    'accent-glow': `rgba(${r1},${g1},${b1}, 0.32)`,
    'accent-glow-secondary': `rgba(${r2},${g2},${b2}, 0.24)`,
    'accent-muted': `rgba(${r1},${g1},${b1}, 0.12)`,
    'accent-focus-ring': `rgba(${r2},${g2},${b2}, 0.28)`,
    'btn-shadow': `0 4px 16px rgba(${r1},${g1},${b1}, 0.28), 0 2px 8px rgba(${r2},${g2},${b2}, 0.18)`,
    'btn-shadow-hover': `0 8px 24px rgba(${r1},${g1},${b1}, 0.38), 0 4px 12px rgba(${r2},${g2},${b2}, 0.26)`,
    'input-bg': `linear-gradient(135deg, rgba(${r1},${g1},${b1}, 0.05) 0%, rgba(${r2},${g2},${b2}, 0.03) 100%)`,
    'input-border': `rgba(${r1},${g1},${b1}, 0.16)`,
    'input-focus': `rgba(${r2},${g2},${b2}, 0.3)`,
  };
}

const SCHEMES = {
  default: {
    dark: flagTheme({
      dark: true,
      c1: '#8b5cf6',
      c2: '#ec4899',
      c3: '#a78bfa',
      rgb1: [139, 92, 246],
      rgb2: [236, 72, 153],
      rgb3: [167, 139, 250],
    }),
    light: flagTheme({
      dark: false,
      c1: '#6366f1',
      c2: '#ec4899',
      c3: '#818cf8',
      rgb1: [99, 102, 241],
      rgb2: [236, 72, 153],
      rgb3: [129, 140, 248],
    }),
  },
  argentina: {
    dark: flagTheme({
      dark: true,
      c1: '#75aadb',
      c2: '#ffffff',
      c3: '#4a90c4',
      rgb1: [117, 170, 219],
      rgb2: [255, 255, 255],
      rgb3: [74, 144, 196],
    }),
    light: flagTheme({
      dark: false,
      c1: '#4a90c4',
      c2: '#ffffff',
      c3: '#75aadb',
      rgb1: [74, 144, 196],
      rgb2: [255, 255, 255],
      rgb3: [117, 170, 219],
    }),
  },
  portugal: {
    dark: flagTheme({
      dark: true,
      c1: '#006600',
      c2: '#ff0000',
      c3: '#ffcc00',
      rgb1: [0, 102, 0],
      rgb2: [255, 0, 0],
      rgb3: [255, 204, 0],
    }),
    light: flagTheme({
      dark: false,
      c1: '#006600',
      c2: '#ff0000',
      c3: '#ffcc00',
      rgb1: [0, 102, 0],
      rgb2: [255, 0, 0],
      rgb3: [255, 204, 0],
    }),
  },
  france: {
    dark: flagTheme({
      dark: true,
      c1: '#0055a4',
      c2: '#ed2939',
      c3: '#ffffff',
      rgb1: [0, 85, 164],
      rgb2: [237, 41, 57],
      rgb3: [255, 255, 255],
    }),
    light: flagTheme({
      dark: false,
      c1: '#002654',
      c2: '#ed2939',
      c3: '#ffffff',
      rgb1: [0, 38, 84],
      rgb2: [237, 41, 57],
      rgb3: [255, 255, 255],
    }),
  },
  brazil: {
    dark: flagTheme({
      dark: true,
      c1: '#009c3b',
      c2: '#ffdf00',
      c3: '#002776',
      rgb1: [0, 156, 59],
      rgb2: [255, 223, 0],
      rgb3: [0, 39, 118],
    }),
    light: flagTheme({
      dark: false,
      c1: '#009c3b',
      c2: '#ffdf00',
      c3: '#002776',
      rgb1: [0, 156, 59],
      rgb2: [255, 223, 0],
      rgb3: [0, 39, 118],
    }),
  },
  germany: {
    dark: flagTheme({
      dark: true,
      c1: '#000000',
      c2: '#dd0000',
      c3: '#ffce00',
      rgb1: [0, 0, 0],
      rgb2: [221, 0, 0],
      rgb3: [255, 206, 0],
      interactive: '#dd0000',
      interactiveHover: '#ff1a1a',
    }),
    light: flagTheme({
      dark: false,
      c1: '#1a1a1a',
      c2: '#dd0000',
      c3: '#ffce00',
      rgb1: [26, 26, 26],
      rgb2: [221, 0, 0],
      rgb3: [255, 206, 0],
      interactive: '#dd0000',
      interactiveHover: '#b80000',
    }),
  },
  england: {
    dark: flagTheme({
      dark: true,
      c1: '#ce1124',
      c2: '#ffffff',
      c3: '#8b0a18',
      rgb1: [206, 17, 36],
      rgb2: [255, 255, 255],
      rgb3: [139, 10, 24],
      interactive: '#ce1124',
      interactiveHover: '#e8182e',
    }),
    light: flagTheme({
      dark: false,
      c1: '#ce1124',
      c2: '#ffffff',
      c3: '#a50e1d',
      rgb1: [206, 17, 36],
      rgb2: [255, 255, 255],
      rgb3: [165, 14, 29],
      interactive: '#ce1124',
      interactiveHover: '#a50e1d',
    }),
  },
  spain: {
    dark: flagTheme({
      dark: true,
      c1: '#c60b1e',
      c2: '#ffc400',
      c3: '#8b0815',
      rgb1: [198, 11, 30],
      rgb2: [255, 196, 0],
      rgb3: [139, 8, 21],
    }),
    light: flagTheme({
      dark: false,
      c1: '#c60b1e',
      c2: '#ffc400',
      c3: '#a00918',
      rgb1: [198, 11, 30],
      rgb2: [255, 196, 0],
      rgb3: [160, 9, 24],
    }),
  },
};

export function applyColorSchemeTokens(scheme, mode) {
  const tokens = SCHEMES[scheme]?.[mode] ?? SCHEMES.default[mode];
  const root = document.documentElement;

  THEME_TOKEN_KEYS.forEach((key) => {
    if (tokens[key] !== undefined) {
      root.style.setProperty(`--${key}`, tokens[key]);
    } else {
      root.style.removeProperty(`--${key}`);
    }
  });
}
