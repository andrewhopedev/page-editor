export default {
  extends: ['stylelint-config-standard-scss'],
  overrides: [
    {
      files: ['**/*.module.scss'],
      rules: {
        'selector-class-pattern': '^[a-z][a-zA-Z0-9]*$',
      },
    },
    {
      files: ['src/entities/page-block/**/*.module.scss'],
      rules: {
        'declaration-property-value-disallowed-list': {
          '/.*/': ['/var\\(--(?!page-)/'],
        },
      },
    },
  ],
}
