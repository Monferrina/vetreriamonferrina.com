import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  {
    ignores: ['dist/', '.astro/', 'node_modules/', '.vercel/', 'sanity/', '*.cjs'],
  },
  eslintJs.configs.recommended,
  ...tseslint.configs.recommended,
  // eslint-plugin-astro 3: `recommended` è tornata al formato eslintrc, la variante flat
  // va nominata. E il plugin non collega più da solo @typescript-eslint/parser al
  // frontmatter — in v2 lo faceva, in v3 lo deve fornire chi lo usa. Senza il blocco
  // qui sotto ogni pagina .astro con TypeScript nel frontmatter dà "Parsing error".
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    files: ['**/*.ts', '**/*.astro'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
      },
    },
  },
  {
    files: ['src/env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
];
