import { useEffect, useRef } from "react";
import { json, type ActionArgs, type LoaderArgs } from "@remix-run/server";
import { Form, useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import {
  getContact,
  updateContact,
  type Contact as ContactType,
} from "~/contacts.server";

export async function loader({ params }: LoaderArgs) {
  let contact = await getContact(params.contactId!);

  if (!contact) throw json(`contact ${params.contactId} not found`, 404);

  return json(contact);
}

export async function action({ request, params }: ActionArgs) {
  let formData = await request.formData();
  return updateContact(params.contactId!, {
    favorite: formData.get("favorite") === "true" ? true : false,
  });
}

export default function ContactRoute() {
  const contact = useLoaderData<typeof loader>();
  return <Contact contact={contact} />;
}

export function Contact({ contact }: { contact: ContactType }) {
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if ((location.state as any)?.takeFocus) {
      headingRef.current?.focus();
    }
  }, [location]);

  return (
    <div id="contact">
      <div>
        <img key={contact.avatar} alt="" src={contact.avatar || undefined} />
      </div>

      <div>
        <h1 ref={headingRef} tabIndex={-1}>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter && (
          <p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://twitter.com/${contact.twitter}`}
            >
              {contact.twitter}
            </a>
          </p>
        )}

        {contact.notes && <p>{contact.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form
            method="post"
            action="destroy"
            onSubmit={(event) => {
              if (!confirm("Please confirm you want to delete this record.")) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ contact }: { contact: ContactType }) {
  const fetcher = useFetcher();
  let favorite = contact.favorite;
  if (fetcher.submission?.formData) {
    favorite =
      fetcher.submission.formData.get("favorite") === "true" ? true : false;
  }

  return (
    <fetcher.Form method="post">
      <button
        name="favorite"
        value={favorite ? "false" : "true"}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
}
