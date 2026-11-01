export const getSiteUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://skillsfr.vercel.app';
};

export const SITE_CONFIG = {
  name: 'Skillsfr',
  tagline: 'The Open AI-Agent & Developer Resource Registry',
  description: 'A centralized, community-driven discovery platform where developers and AI agents find, evaluate, collect, combine, and deploy MCPs, skills, datasets, and benchmarks.',
  githubRepo: 'https://github.com/itsjustayush/skillsfr',
  newsletterProvider: 'EmailOctopus',
  defaultVersion: '1.4.0',
  defaultCliCommand: 'npx skillsfr',
  author: 'Ayush',
  
  getUrl: (path = '') => `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`,
  getResourceUrl: (slug: string) => `${getSiteUrl()}/resource/${slug}`,
  getKitUrl: (slug: string) => `${getSiteUrl()}/kits/${slug}`,
  getNewsletterUrl: (issue = '') => `${getSiteUrl()}/newsletter${issue ? `/${issue}` : ''}`,
  getApiEndpoint: (endpoint = '') => `${getSiteUrl()}/api/${endpoint.replace(/^\/+/, '')}`
};

export default SITE_CONFIG;
