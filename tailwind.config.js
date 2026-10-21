export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  important: true,
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        'canvas': '#020817',
        'surface': '#041a31',
        'field': '#061b34',
        'line': '#1478ba',
        'line-muted': 'rgba(20, 106, 170, 0.62)',
        'content': '#d8e9f6',
        'muted': '#93a9bd',
        'accent': '#20b5f1',
        'chart-blue': '#6b96e8',
        'chart-green': '#86c75b',
        'chart-orange': '#f5a622',
        'chart-yellow': '#f2b841',
        'chart-red': '#ef665d',
        'success': '#9acd55',
        'category-red': '#ef6b62',
        'category-orange': '#f3a51c',
        'category-yellow': '#f5c35d',
        'category-blue': '#526fa9',
        'category-gray': '#37424c'
      },
      fontFamily: {
        ui: ['Microsoft YaHei', 'PingFang SC', 'sans-serif']
      },
      zIndex: {
        'panel-content': '10',
        'panel-overlay': '20'
      },
      spacing: {
        12: '3.25rem',
        30: '7.5rem'
      },
      minHeight: {
        header: '4.75rem'
      },
      gridTemplateColumns: {
        'layout-desktop': 'minmax(18rem, 26%) minmax(28rem, 1fr) minmax(20rem, 28%)'
      },
      gridTemplateRows: {
        'layout-mobile': '56.5rem 48.75rem 48.75rem',
        'layout-left': '1.08fr 1fr 1.32fr',
        'layout-stack': '1fr 0.96fr',
        'layout-mobile-left': '18rem 15rem 22rem',
        'layout-mobile-stack': '24rem 24rem'
      },
      backgroundImage: {
        'grid':
          'linear-gradient(rgba(22, 82, 132, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(22, 82, 132, 0.16) 1px, transparent 1px), radial-gradient(ellipse at 50% -10%, #08264a 0%, #03132a 42%, #020817 82%)',
        'surface': 'linear-gradient(135deg, rgba(5, 31, 59, 0.98), rgba(3, 18, 38, 0.98))',
        'surface-border':
          'radial-gradient(ellipse at top left, #20b5f1 0%, rgba(32, 181, 241, 0.92) 5%, rgba(20, 106, 170, 0.5) 15%, transparent 28%), radial-gradient(ellipse at top right, #20b5f1 0%, rgba(32, 181, 241, 0.92) 5%, rgba(20, 106, 170, 0.5) 15%, transparent 28%), radial-gradient(ellipse at bottom left, #20b5f1 0%, rgba(32, 181, 241, 0.92) 5%, rgba(20, 106, 170, 0.5) 15%, transparent 28%), radial-gradient(ellipse at bottom right, #20b5f1 0%, rgba(32, 181, 241, 0.92) 5%, rgba(20, 106, 170, 0.5) 15%, transparent 28%), linear-gradient(135deg, rgba(20, 106, 170, 0.42), rgba(7, 42, 76, 0.3) 50%, rgba(20, 106, 170, 0.42))',
        'surface-kpi': 'linear-gradient(135deg, rgba(10, 43, 76, 0.94), rgba(5, 27, 52, 0.88))',
        'action': 'linear-gradient(180deg, #0c3865, #06203d)'
      },
      backgroundSize: {
        'grid-size': '1.75rem 1.75rem, 1.75rem 1.75rem, 100% 100%'
      },
      boxShadow: {
        panel:
          'inset 0 0 1.5rem rgba(13, 105, 180, 0.12), 0 0 0.75rem rgba(0, 100, 190, 0.2)',
        header: '0 0 0.75rem #1d9de9'
      },
      keyframes: {
        'data-pulse': {
          '50%': { opacity: '0.35' }
        }
      },
      animation: {
        'data-pulse': 'data-pulse 1s infinite'
      },
      content: {
        empty: '\'\''
      }
    }
  }
}
