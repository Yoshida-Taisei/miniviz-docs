import path from 'path';
import {fileURLToPath} from 'node:url';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: Config = {
  title: 'Miniviz Docs',
  tagline: 'Documentation for Miniviz',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.miniviz.net',
  baseUrl: '/',

  organizationName: 'miniviz',
  projectName: 'miniviz-docs',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownImages: 'warn',
    },
  },

  plugins: [
    function aiTxtAsStringPlugin() {
      return {
        name: 'ai-txt-asset-source',
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.txt$/i,
                  include: [path.resolve(__dirname, 'src/ai')],
                  type: 'asset/source',
                },
              ],
            },
          };
        },
      };
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    localeConfigs: {
      en: {
        htmlLang: 'en',
        label: 'English',
      },
      ja: {
        htmlLang: 'ja',
        label: '日本語',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Miniviz Docs',
      logo: {
        alt: 'Miniviz',
        src: 'img/favicon.ico',
      },
      items: [
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
            {
              label: 'Quick start',
              to: '/quickstart',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Miniviz',
              href: 'https://miniviz.net',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Miniviz. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
