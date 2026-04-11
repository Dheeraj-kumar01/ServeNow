module.exports = {
    root: true,
    env: { 
      browser: true, 
      es2020: true,
      node: true
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
    parserOptions: { 
      ecmaVersion: 'latest', 
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    settings: { 
      react: { 
        version: '18.2' 
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx']
        }
      }
    },
    plugins: ['react-refresh'],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 'off', // Disable prop-types as we're using TypeScript or can add later
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'react/no-unescaped-entities': 'off',
      'react/jsx-no-target-blank': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  }