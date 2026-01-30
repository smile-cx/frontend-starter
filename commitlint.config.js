/**
 * Commitlint configuration for SmileCX Frontend Starter
 *
 * Enforces Conventional Commits with flexible scope
 *
 * Format: <type>(<scope>): <subject>
 * Example: feat(outbound): add campaign filtering
 *
 * Scope is optional: chore: update README
 */

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Code style (formatting, missing semi-colons, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or dependencies
        'ci', // CI configuration
        'chore', // Other changes that don't modify src or test files
        'revert', // Revert a previous commit
      ],
    ],

    // Scope is optional (can be empty)
    'scope-empty': [0],

    // Scope case: kebab-case recommended
    'scope-case': [1, 'always', 'kebab-case'],

    // Subject rules
    // Disable case rule to allow proper nouns, acronyms (API, OAuth, TypeScript), and project names
    // Developers should still prefer starting with lowercase for consistency
    'subject-case': [0], // Disabled - allow any case
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // Body rules (optional, but if present must follow rules)
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [1, 'always', 100],

    // Footer rules (optional, but if present must follow rules)
    'footer-leading-blank': [1, 'always'],
  },
};
