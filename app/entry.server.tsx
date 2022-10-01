import { type EntryContext } from "@remix-run/server";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const html = await renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  const headers = new Headers(responseHeaders);
  headers.set("Content-Type", "text/html");

  return new Response(`<!DOCTYPE html>\n${html}`, {
    headers,
    status: responseStatusCode,
  });
}
