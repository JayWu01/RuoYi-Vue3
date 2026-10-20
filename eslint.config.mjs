import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'app',
    vue: true,
    lessOpinionated: true,
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false
    },
    ignores: ['dist/**', 'output/**', 'node_modules/**', '**/*.md', 'src/views/screen/api/generated/**'],
    rules: {
      'style/comma-dangle': ['error', 'never']
    }
  },
  {
    files: ['**/*.{js,vue}'],
    rules: {
      'curly': ['error', 'multi-line'],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'no-console': 'warn',
      'no-cond-assign': 'warn',
      'no-implied-eval': 'warn',
      'no-labels': 'warn',
      'no-redeclare': 'warn',
      'no-undef': 'warn',
      'no-unmodified-loop-condition': 'warn',
      'no-var': 'warn',
      'no-unused-vars': 'warn',
      'no-use-before-define': 'warn',
      'prefer-promise-reject-errors': 'warn',
      'prefer-regex-literals': 'warn',
      'prefer-spread': 'warn',
      'array-callback-return': 'warn',
      'eqeqeq': 'warn',
      'regexp/no-unused-capturing-group': 'warn',
      'style/max-statements-per-line': 'warn',
      'style/no-tabs': 'warn',
      'unicorn/no-instanceof-builtins': 'warn',
      'unicorn/prefer-dom-node-text-content': 'warn',
      'unused-imports/no-unused-vars': 'warn',
      'vue/custom-event-name-casing': 'warn',
      'vue/eqeqeq': 'warn',
      'vue/no-mutating-props': 'warn',
      'vue/no-deprecated-filter': 'warn',
      'vue/no-side-effects-in-computed-properties': 'warn',
      'vue/no-unused-refs': 'warn',
      'vue/no-unused-vars': 'warn',
      'vue/require-valid-default-prop': 'warn',
      'vue/valid-define-emits': 'warn',
      'node/prefer-global/process': 'warn'
    }
  }
)
