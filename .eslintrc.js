module.exports = {
  'env': {
    es2020: true,
    node: true,
    mocha: true
  },
  'extends': ['plugin:vue/essential', 'eslint:recommended'],
  'parserOptions': {
    // ecmaVersion: 2015,
    // sourceType: 'module',
    ecmaFeatures: {
      arrowFunctions: true,
      blockBindings: true,
      classes: true,
      defaultParams: true,
      destructuring: true,
      forOf: true,
      generators: false,
      modules: true,
      objectLiteralComputedProperties: true,
      objectLiteralDuplicateProperties: false,
      objectLiteralShorthandMethods: true,
      objectLiteralShorthandProperties: true,
      spread: true,
      superInFunctions: true,
      templateStrings: true,
      jsx: true
    }
  },
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'import/no-unresolved': 'off',
    'no-underscore-dangle': 'off',
    'guard-for-in': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'object-curly-newline': 'off'
  },
  'overrides': [
    {
      files: ['*-test.js', '*.spec.js'],
      rules: {
        'no-unused-expressions': 'off',
        'func-names': 'off',
        'prefer-arrow-callback': 'off',
        'react/jsx-filename-extension': 'off'
      }
    }
  ],
  'globals': {
    expect: true,
  }
}
