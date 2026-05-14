import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Allow unused vars/args when prefixed with _ (prototype convention)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Prototype-friendly: allow any types while iterating quickly
      '@typescript-eslint/no-explicit-any': 'off',
      // These rules require architectural changes beyond scope of this refactor
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      // Too strict for common patterns (Date.now() in handlers, Math.random() in useMemo)
      'react-hooks/purity': 'off',
    },
  },
  {
    // shadcn UI primitives export components alongside variant helpers — this is intentional
    files: ['src/app/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Context files export both Provider components and useXxx hooks — standard React pattern
    files: ['src/app/contexts/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
