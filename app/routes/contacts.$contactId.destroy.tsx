import { redirect, type ActionArgs } from "@remix-run/server";
import { deleteContact } from "~/contacts.server";

export async function action({ params }: ActionArgs) {
  await deleteContact(params.contactId!);
  return redirect("/");
}
