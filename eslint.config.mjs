import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig, // 放在最后，禁用与 Prettier 冲突的规则

  // 自定义规则
  {
    rules: {
      // 未使用变量报错，但允许下划线开头的参数
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'test-results/**',
    '.tmp-*/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
