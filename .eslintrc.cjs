module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'jsx-a11y', 'import', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
  },
  overrides: [
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
    },
    {
      files: ['src/**/*.js', 'src/**/*.jsx'],
      env: {
        browser: true,
        node: false,
      },
    },
  ],
  rules: {
    // 🔧 Desactivamos la regla que exige React en scope para JSX
    'react/react-in-jsx-scope': 'off',
  },
};
