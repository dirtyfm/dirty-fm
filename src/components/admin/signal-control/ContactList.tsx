import {
  convertContactToDirtyNewsSubmission,
  deleteContactSubmission,
  updateContactSubmission
} from "@/app/signal-control/actions";
import { postSubmissionCategories } from "@/lib/contentValidation";
import type { AdminDashboardContact } from "@/lib/db/adminDashboard";
import { contactSubmissionStatuses } from "@/lib/submissionWorkflows";
import { EmptyWire } from "./EmptyWire";
import { adminFieldBase, excerpt, formatDate } from "./shared";

export function ContactList({ contacts }: { contacts: AdminDashboardContact[] }) {
  if (contacts.length === 0) {
    return <EmptyWire label="incoming signals" />;
  }

  return (
    <div className="grid gap-3">
      {contacts.map((contact) => (
        <article className="archive-card" key={contact.id}>
          <div className="flex flex-col gap-2 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
            <div>
              <p className="card-label">{contact.submission_type}</p>
              <h3 className="mt-2 font-display text-3xl font-black uppercase leading-none text-dirty-ash">
                {contact.subject}
              </h3>
            </div>
            <p className="font-utility text-xs font-bold uppercase text-dirty-yellow">
              {formatDate(contact.created_at)}
            </p>
          </div>
          <p className="mt-3 text-sm text-dirty-gray">
            {contact.name} / {contact.email} / Read on air:{" "}
            {contact.can_read_on_air ? "yes" : "no"}
          </p>
          <p className="mt-3 text-dirty-ash">{excerpt(contact.message)}</p>
          <form action={convertContactToDirtyNewsSubmission} className="mt-4 grid gap-3 border-t border-[rgba(214,184,74,0.3)] pt-4">
            <input name="id" type="hidden" value={contact.id} />
            {!contact.can_read_on_air ? (
              <p className="border-l-4 border-dirty-yellow bg-dirty-yellow/10 p-3 font-utility text-xs font-black uppercase text-dirty-yellow">
                No read-on-air consent. Review before you air this mess.
              </p>
            ) : null}
            <div className="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_auto] min-[760px]:items-end">
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Dirty News Bucket
                </span>
                <select className={adminFieldBase} defaultValue="Open Mic" name="category">
                  {postSubmissionCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button-primary" type="submit">
                Draft Dirty News File
              </button>
            </div>
          </form>
          <form action={updateContactSubmission} className="mt-4 grid gap-3 border-t border-[rgba(183,178,168,0.24)] pt-4">
            <input name="id" type="hidden" value={contact.id} />
            <div className="grid gap-3 min-[760px]:grid-cols-[12rem_minmax(0,1fr)_auto] min-[760px]:items-end">
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Status
                </span>
                <select className={adminFieldBase} defaultValue={contact.status} name="status">
                  {contactSubmissionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="font-utility text-[0.68rem] font-black uppercase text-dirty-yellow">
                  Admin Notes
                </span>
                <textarea
                  className={adminFieldBase}
                  defaultValue={contact.admin_notes ?? ""}
                  name="admin_notes"
                  rows={2}
                />
              </label>
            <button className="button button-secondary" type="submit">
              Save Signal
            </button>
            </div>
          </form>
          <form action={deleteContactSubmission} className="mt-3">
            <input name="id" type="hidden" value={contact.id} />
            <button className="danger-link" type="submit">
              Delete if Needed
            </button>
          </form>
        </article>
      ))}
    </div>
  );
}
