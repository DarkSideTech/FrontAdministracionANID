module.exports = {
  onPreBuild({ netlifyConfig, utils }) {
    const backendOrigin = normalizeBackendOrigin(process.env.SANDBOX_BACKEND_ORIGIN);
    if (!backendOrigin) {
      utils.build.failBuild('SANDBOX_BACKEND_ORIGIN debe contener la URL HTTPS publica del backend de Render.');
      return;
    }

    netlifyConfig.redirects = [
      {
        from: '/api/*',
        to: `${backendOrigin}/api/:splat`,
        status: 200,
        force: true,
      },
      ...(netlifyConfig.redirects ?? []),
    ];
  },
};

function normalizeBackendOrigin(value) {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}
