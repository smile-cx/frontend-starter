import type { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'smilecx-starter',
  globalScript: './src/global/global.ts',
  globalStyle: './src/global/global.scss',
  plugins: [sass()],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      serviceWorker: null,
      baseUrl: '/',
      copy: [{ src: 'pages/*.html', dest: '.' }],
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
  devServer: {
    port: 3336,
    openBrowser: false,
  },
};
