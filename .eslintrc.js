module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['react'],
    rules: {
        curly: 'error',
        'no-multi-spaces': 'error',
        'no-trailing-spaces': 'error',
        'no-multiple-empty-lines': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'sort-imports': ['error', { ignoreDeclarationSort: true }],
        'import/order': ['error', { alphabetize: { order: 'asc' } }],
    },
    settings: {
        react: { version: 'detect' },
    },
    ignorePatterns: [
        'config/**/*.js',
        'scripts/*.js',
        'test/env.js',
        '.eslintrc.js',
        '.prettierrc.js',
        'craco.config.js',
    ],
};
