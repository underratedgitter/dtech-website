// PurgeCSS config: Tailwind-aware extractor keeps responsive/state
// variants (lg:, md:, hover:, ...) that the default extractor drops.
module.exports = {
  content: ['*.html', 'assets/agent-a.js', 'assets/refined.js', 'assets/analytics.js', 'assets/lucide.js'],
  css: ['assets/bundle.min.css'],
  output: '/tmp/purged/',
  safelist: ['hidden', 'a-in', 'a-pre', 'marquee-on'],
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
};
