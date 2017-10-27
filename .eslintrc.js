module.exports = {
    extends: ['airbnb-base'],
    env: {
      node: true
    },
    rules: {
      'prefer-const': 0,
      'import/no-extraneous-dependencies': ['error', {'devDependencies': true}],
    },
    plugins: [
        'import'
    ]
};
