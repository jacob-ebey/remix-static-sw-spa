import { useEffect, useMemo } from "react";
import {
  redirect,
  json,
  type LinksFunction,
  type LoaderArgs,
  type MetaFunction,
} from "@remix-run/server";
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useHref,
  useLoaderData,
  useLocation,
  useNavigate,
  useTransition as useNavigation,
  useSubmit,
} from "@remix-run/react";

import { useServiceWorker } from "#use-service-worker";
import { NavLink } from "~/rr-polyfill";

import { createContact, getContacts } from "~/contacts.server";

import { Contact } from "./routes/contacts.$contactId";

import stylesHref from "./styles.css";

export let meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Contacts",
  viewport: "width=device-width,initial-scale=1",
  "theme-color": "#f7f7f7",
});

export let links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesHref },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

export async function action() {
  let contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({
    contacts,
    q,
    firstContact: q ? contacts[0] : null,
  });
}

function Root() {
  const { contacts, q, firstContact } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();
  const optimisticLocation = navigation.location || location;
  const optimisticSearchParams = new URLSearchParams(optimisticLocation.search);

  const menuLink = useHref(
    useMemo(() => {
      const menuSearchParams = new URLSearchParams(optimisticLocation.search);
      if (menuSearchParams.get("open") == "menu") {
        menuSearchParams.delete("open");
      } else {
        menuSearchParams.set("open", "menu");
      }

      return {
        hash: optimisticLocation.hash,
        pathname: optimisticLocation.pathname,
        search: menuSearchParams.toString(),
      };
    }, [optimisticLocation])
  );

  const searching = navigation.location
    ? new URLSearchParams(navigation.location.search).has("q")
    : false;

  useEffect(() => {
    let searchInput = document.getElementById("q") as HTMLInputElement;
    if (q && !searchInput.value) {
      searchInput.value = q;
    } else if (!q) {
      searchInput.value = "";
    }
  }, [q]);

  return (
    <div id="root">
      <div id="sidebar">
        <Link to={menuLink}>
          {optimisticSearchParams.get("open") == "menu" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
              height={32}
              width={32}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
              height={32}
              width={32}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </Link>
        <div
          id="sidebar-content"
          className={optimisticSearchParams.get("open") == "menu" ? "open" : ""}
        >
          <h1>
            <span className="sr-only">Remix</span> Contacts
          </h1>
          <div>
            <Form
              id="search-form"
              role="search"
              onSubmit={(event) => {
                if (firstContact) {
                  navigate(`/contacts/${firstContact.id}`, {
                    replace: true,
                    state: { takeFocus: true },
                  });
                  event.preventDefault();
                }
              }}
            >
              <input
                id="q"
                className={searching ? "loading" : ""}
                onChange={(event) => {
                  let isFirstSearch = q == null;
                  submit(event.currentTarget.form, {
                    replace: !isFirstSearch,
                  });
                }}
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q || undefined}
              />
              <div id="search-spinner" hidden={!searching} />
              <div className="sr-only" aria-live="polite">
                {q ? `${contacts.length} results for ${q}` : ""}
              </div>
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                    to={`contacts/${contact.id}`}
                    replace={q != null}
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div id="detail" className={navigation.state !== "idle" ? "loading" : ""}>
        {firstContact ? <Contact contact={firstContact} /> : <Outlet />}
      </div>
    </div>
  );
}

export default function Document() {
  let { serviceWorkerStatus } = useServiceWorker();

  if (process.env.NODE_ENV === "development") {
    // This conditional hook is OK as it will be optimized out at build time
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (serviceWorkerStatus === "updated") {
        location.reload();
      }
    }, [serviceWorkerStatus]);
  }

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Root />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
