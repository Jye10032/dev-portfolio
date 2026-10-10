// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import siteConfig from './src/data/site-config';

// https://astro.build/config
export default defineConfig({
  site: siteConfig.website,
  trailingSlash: 'always',
  adapter: netlify(),
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [mdx(), sitemap()]
});
