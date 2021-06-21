module.exports = {
  exportPathMap: async function(
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    const defaultMap = Object.assign(
      {
        "/": { page: "/" },
        "/error": { page: "/_error" }
      },
    );

    return defaultMap;
  },
}
