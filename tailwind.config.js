/**
 * 大屏语义令牌（dashboard-bigscreen-design skill）
 *
 * 颜色全部指向 screen/styles/tokens.css 中 .dashboard[data-theme] / html[data-screen-theme]
 * 暴露的 CSS 变量，因此同一套 class 在亮/暗主题下自动切换。
 * 这些令牌只服务于 /screen，后台页面不依赖它们。
 */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  important: true,
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        scr: {
          canvas: 'var(--scr-canvas)',
          surface: 'var(--scr-surface-1)',
          'surface-2': 'var(--scr-surface-2)',
          'surface-3': 'var(--scr-surface-3)',
          field: 'var(--scr-field)',
          'field-hover': 'var(--scr-field-hover)',
          line: 'var(--scr-line)',
          'line-strong': 'var(--scr-line-strong)',
          fg: 'var(--scr-text-1)',
          muted: 'var(--scr-text-2)',
          faint: 'var(--scr-text-3)',
          'on-accent': 'var(--scr-on-accent)',
          accent: {
            DEFAULT: 'var(--scr-accent)',
            2: 'var(--scr-accent-2)',
            soft: 'var(--scr-accent-soft)',
            line: 'var(--scr-accent-line)'
          },
          success: 'var(--scr-success)',
          warning: 'var(--scr-warning)',
          danger: 'var(--scr-danger)',
          info: 'var(--scr-info)',
          purple: 'var(--scr-purple)',
          orange: 'var(--scr-orange)',
          yellow: 'var(--scr-yellow)'
        }
      },
      backgroundImage: {
        'scr-glass': 'var(--scr-glass)',
        'scr-glass-strong': 'var(--scr-glass-strong)',
        'scr-panel': 'var(--scr-panel)',
        'scr-accent-gradient': 'var(--scr-accent-gradient)'
      },
      fontFamily: {
        ui: ['var(--scr-font-text)'],
        numeric: ['var(--scr-font-numeric)']
      },
      borderRadius: {
        'scr-card': 'var(--scr-radius-card)',
        'scr-tile': 'var(--scr-radius-tile)',
        'scr-control': 'var(--scr-radius-control)'
      },
      boxShadow: {
        'scr-card': 'var(--scr-shadow-card)',
        'scr-pop': 'var(--scr-shadow-popover)'
      },
      backdropBlur: {
        scr: '16px'
      },
      transitionTimingFunction: {
        'scr-out': 'var(--scr-ease-out)',
        'scr-spring': 'var(--scr-ease-spring)'
      },
      zIndex: {
        'panel-overlay': '20'
      },
      gridTemplateColumns: {
        'layout-desktop': 'minmax(19rem, 26%) minmax(0, 1fr) minmax(21rem, 26%)',
        'layout-wide': 'minmax(370px, 380px) minmax(0, 1fr) minmax(390px, 400px)'
      },
      gridTemplateRows: {
        'layout-mobile': '56.5rem 48.75rem 48.75rem',
        'layout-left': '1.08fr 1fr 1.32fr',
        'layout-stack': '1fr 0.96fr',
        'layout-mobile-left': '18rem 15rem 22rem',
        'layout-mobile-stack': '24rem 24rem'
      },
      keyframes: {
        'scr-shimmer': {
          '100%': { transform: 'translateX(100%)' }
        },
        'scr-breathe': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        },
        'scr-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' }
        },
        'scr-progress': {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(340%)' }
        }
      },
      animation: {
        'scr-shimmer': 'scr-shimmer 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'scr-breathe': 'scr-breathe 1.5s ease-in-out infinite',
        'scr-blink': 'scr-blink 2.4s ease-in-out infinite',
        'scr-progress': 'scr-progress 1.2s var(--scr-ease-out) infinite'
      },
      content: {
        empty: '\'\''
      }
    }
  }
}
