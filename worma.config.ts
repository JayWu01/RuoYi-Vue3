import process from 'node:process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'

import { defineConfig } from 'wormajs'
import { apifox, axios } from 'wormajs/plugin'

function loadEnvFile() {
  const envFiles = ['.env.worma.local', '.env.worma', '.env']
  for (const file of envFiles) {
    const filePath = resolve(process.cwd(), file)
    if (!existsSync(filePath)) continue
    for (const [key, value] of Object.entries(parseEnv(readFileSync(filePath, 'utf-8')))) {
      if (process.env[key] === undefined) process.env[key] = value
    }
    break
  }
}

loadEnvFile()

const projectId = process.env.APIFOX_PROJECT_ID
const apifoxToken = process.env.APIFOX_ACCESS_TOKEN

if (!projectId || !apifoxToken) {
  throw new Error(
    '缺少 APIFOX_PROJECT_ID 或 APIFOX_ACCESS_TOKEN。'
    + '在项目根目录创建 .env.worma.local 并填入凭证。'
  )
}

export default defineConfig({
  generator: [
    {
      output: 'src/views/screen/api/generated',
      serverName: 'PoliceScreen',
      type: 'module',
      docComment: true,
      plugins: [
        apifox({
          projectId,
          apifoxToken,
          oasVersion: '3.1',
          exportFormat: 'JSON'
        }),
        axios()
      ],
      handleApi(api) {
        if (!api.url.includes('/policeScreen/')) {
          return
        }

        api.operationId = api.url.split('/').at(-1)
        return api
      }
    }
  ]
})