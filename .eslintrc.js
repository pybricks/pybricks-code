module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
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
        '@typescript-eslint/no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
        'no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
        'sort-imports': ['error', { ignoreDeclarationSort: true }],
        'import/order': ['error', { alphabetize: { order: 'asc' } }],
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
    },
    settings: {
        react: { version: 'detect' },
    },
    ignorePatterns: ['test/env.js'],
};
