import path from 'node:path'
import legacy from '@vitejs/plugin-legacy'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins'

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  const { VITE_BACKEND_URL } = env

  return {
    // 部署生产环境和开发环境下的URL。
    // 默认情况下，vite 会假设你的应用是被部署在一个域名的根路径上
    // 例如 https://www.ruoyi.vip/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.ruoyi.vip/admin/，则设置 VITE_BACKEND_URL 为 /admin/。
    base: '/',
    plugins: [
      createVitePlugins(env, command === 'build'),
      // 兼容老版本 Chrome（>=49，Vue3 Proxy 硬底线）：
      // 语法降级到 es2015 + core-js polyfill（Object.hasOwn/Array.at 等）+ nomodule 兜底包
      legacy({
        targets: ['chrome >= 49', 'edge >= 79', 'firefox >= 51', 'safari >= 10']
      })
    ],
    resolve: {
      // https://cn.vitejs.dev/config/#resolve-alias
      alias: {
        // 设置路径
        '~': path.resolve(__dirname, './'),
        // 设置别名
        '@': path.resolve(__dirname, './src')
      },
      // https://cn.vitejs.dev/config/#resolve-extensions
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    optimizeDeps: {
      exclude: ['@element-plus/icons-vue']
    },
    // 打包配置
    build: {
      // 语法目标降到 es2015（配合 legacy 插件转译 ?./?? 等 ES2020 语法，老 Chrome 可执行）
      target: 'es2015',
      // https://vite.dev/config/build-options.html
      sourcemap: command === 'build' ? false : 'inline',
      outDir: 'dist',
      assetsDir: 'assets',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
        }
      }
    },
    // vite 相关配置
    server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        // https://cn.vitejs.dev/config/#server-proxy
        '/dev-api': {
          target: VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: p => p.replace(/^\/dev-api/, '')
        },
        // springdoc proxy
        '^/v3/api-docs/(.*)': {
          target: VITE_BACKEND_URL,
          changeOrigin: true
        }
      }
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          // 仅给 autoprefixer 指定低版本浏览器，补 -webkit- 前缀（backdrop-filter 等）。
          // 不写 .browserslistrc：plugin-legacy 的现代包目标也会读项目 browserslist，会把现代包一起降级。
          autoprefixer({
            overrideBrowserslist: ['chrome >= 49', 'edge >= 79', 'firefox >= 51', 'safari >= 10']
          }),
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  }
})
