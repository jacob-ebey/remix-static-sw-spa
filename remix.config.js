/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // configure our service worker as our server build entry
  server: "app/sw.ts",
  // build for CF Workers as it's the closest to a browser worker
  serverBuildTarget: "cloudflare-workers",
  // build it to the public directory since it's an SPA
  serverBuildPath: "public/sw.js",
};
