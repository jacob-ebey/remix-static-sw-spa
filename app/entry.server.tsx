import { type EntryContext } from "@remix-run/server";
import { RemixServer } from "@remix-run/react";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let didError = false;

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      onError(error) {
        didError = true;
        console.error(error);
      },
    }
  );

  const headers = new Headers(responseHeaders);
  headers.set("Content-Type", "text/html");

  return new Response(body, {
    headers,
    status: didError ? 500 : responseStatusCode,
  });
}
