import { Card } from "../components/Card";
import { ContactList } from "../components/ContactList";
import type { Contact } from "../types";

export function People({
  contacts,
  setContacts,
}: {
  contacts: Contact[];
  setContacts: (updater: (prev: Contact[]) => Contact[]) => void;
}) {
  return (
    <Card title="People">
      <ContactList contacts={contacts} setContacts={setContacts} />
    </Card>
  );
}
