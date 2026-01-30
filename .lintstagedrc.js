/**
 * Lint-staged configuration for SmileCX Frontend Starter
 *
 * Runs linting and formatting on staged files before commit
 */

export default {
  // TypeScript and JavaScript files
  '**/*.{ts,tsx,js,jsx,mjs,cjs}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],

  // JSON and Markdown files
  '**/*.{json,md}': (filenames) => [`prettier --write ${filenames.join(' ')}`],
};
