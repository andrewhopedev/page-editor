export default {
  extends: ['stylelint-config-standard-scss'],
  overrides: [
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
