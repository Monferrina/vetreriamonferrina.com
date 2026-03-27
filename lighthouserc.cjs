/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist/client',
      url: [
        'http://localhost/index.html',
        'http://localhost/servizi/index.html',
        'http://localhost/chi-siamo/index.html',
        'http://localhost/contatti/index.html',
        'http://localhost/preventivo/index.html',
        'http://localhost/galleria/index.html',
        'http://localhost/faq/index.html',
        'http://localhost/blog/index.html',
        'http://localhost/trasporto-e-montaggio/index.html',
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
