import { matchRoutes } from "react-router-dom";
import * as build from "@remix-run/dev/server-build";
import { createRequestHandler } from "@remix-run/server-runtime";
import { createRoutes } from "@remix-run/server-runtime/dist/routes";

export type {};
declare const self: ServiceWorkerGlobalScope;

const handler = createRequestHandler(build, process.env.NODE_ENV);
const routes = createRoutes(build.routes);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  let { request } = event;
  let url = new URL(request.url);

  // Check to see if we should be handling this request or if
  // it's a static asset that we can leave to the browser.
  let matches = matchRoutes(routes, url.pathname);
  if (matches && matches.length > 0) {
    event.respondWith(handler(request));
  }
});
