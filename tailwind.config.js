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
          'canvas': 'var(--scr-canvas)',
          'header': 'var(--scr-header)',
          'card': 'var(--scr-card)',
          'surface': 'var(--scr-surface-1)',
          'surface-2': 'var(--scr-surface-2)',
          'surface-3': 'var(--scr-surface-3)',
          'field': 'var(--scr-field)',
          'field-hover': 'var(--scr-field-hover)',
          'line': 'var(--scr-line)',
          'line-strong': 'var(--scr-line-strong)',
          'fg': 'var(--scr-text-1)',
          'muted': 'var(--scr-text-2)',
          'faint': 'var(--scr-text-3)',
          'on-accent': 'var(--scr-on-accent)',
          'accent': {
            DEFAULT: 'var(--scr-accent)',
            2: 'var(--scr-accent-2)',
            soft: 'var(--scr-accent-soft)',
            line: 'var(--scr-accent-line)'
          },
          'success': 'var(--scr-success)',
          'warning': 'var(--scr-warning)',
          'danger': 'var(--scr-danger)'
        }
      },
      fontFamily: {
        ui: ['var(--scr-font-text)'],
        numeric: ['var(--scr-font-numeric)']
      },
      fontSize: {
        'scr-h1': 'var(--scr-font-h1)',
        'scr-clock': 'var(--scr-font-clock)',
        'scr-title': 'var(--scr-font-card-title)',
        'scr-body': 'var(--scr-font-body)',
        'scr-label': 'var(--scr-font-label)',
        'scr-meta': 'var(--scr-font-meta)',
        'scr-kpi': 'var(--scr-font-kpi)',
        'scr-tile': 'var(--scr-font-tile)',
        'scr-rank-name': 'var(--scr-font-rank-name)',
        'scr-rank-value': 'var(--scr-font-rank-value)',
        'scr-status': 'var(--scr-font-status)',
        'scr-chip': 'var(--scr-font-chip)',
        'scr-field': 'var(--scr-font-field)'
      },
      transitionTimingFunction: {
        'scr-out': 'var(--scr-ease-out)'
      },
      transitionDuration: {
        'scr-fast': 'var(--scr-dur-fast)',
        'scr-base': 'var(--scr-dur-base)',
        'scr-slow': 'var(--scr-dur-slow)'
      },
      zIndex: {
        'panel-overlay': '20'
      },
      gridTemplateColumns: {
        'layout-desktop': 'minmax(19rem, 26%) minmax(0, 1fr) minmax(21rem, 26%)',
        'layout-wide': 'minmax(370px, 380px) minmax(0, 1fr) minmax(390px, 400px)'
      },
      gridTemplateRows: {
        'layout-left': '1.05fr 1.1fr 1.2fr',
        'layout-stack': '1fr 0.96fr',
        'layout-mobile-left': '18rem 15rem 22rem',
        'layout-mobile-stack': '24rem 24rem'
      },
      keyframes: {
        'scr-progress': {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(340%)' }
        }
      },
      animation: {
        'scr-progress': 'scr-progress 1.2s var(--scr-ease-out) infinite'
      },
      content: {
        empty: '\'\''
      }
    }
  }
}
