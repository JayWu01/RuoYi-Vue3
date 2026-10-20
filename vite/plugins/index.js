import vue  from '@vitejs/plugin-vue'
import { createPoliceDashboardMock } from '../mocks/police-dashboard'
import createAutoImport from './auto-import'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import createSvgIcon from './svg-icon'

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue()]
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createSetupExtend())
  vitePlugins.push(createSvgIcon(isBuild))
  if (viteEnv.VITE_USE_MOCK === 'true') {
    vitePlugins.push(createPoliceDashboardMock(viteEnv.VITE_APP_BASE_API))
  }
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}
