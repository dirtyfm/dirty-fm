"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { DirtyButton, SectionStamp } from "@/components/dirty";
import { cx } from "@/components/dirty/shared";
import { submitContactSignal } from "@/app/contact/actions";
import {
  emptyContactFormValues,
  hasContactValidationErrors,
  submissionTypes,
  validateContactForm,
  type ContactFormValues,
  type ContactValidationErrors
} from "@/lib/contactValidation";

const fieldBase =
  "w-full border border-[rgba(183,178,168,0.34)] bg-dirty-black/70 px-3 py-3 text-base text-dirty-ash shadow-[inset_0_0_0_1px_rgba(0,0,0,0.32)] outline-none transition-colors placeholder:text-dirty-gray/55 focus:border-dirty-yellow";

const typeNotes: Record<string, string> = {
  "Show Tip": "News lead, weird story, public nonsense, something worth dragging on mic.",
  "Open Mic Rant": "A raw listener blast. Make a point. Or fail loudly.",
  "Guest Request": "Pitch a person who can survive the DirtyFM signal.",
  "Hate Mail": "Complaints, insults, spiritual paperwork, and hostile postcards.",
  "Business / Booking": "Bookings, paid work, legit inquiries with less circus smoke.",
  "Video Clip": "Drop a clip URL for Dirty TV or the archive pile.",
  "Technical Problem": "Broken page, busted video, dead link, cursed machinery.",
  "Other Bullshit": "Everything that escaped the labeled drawers."
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="font-utility text-xs font-bold uppercase text-dirty-red">
      {message}
    </p>
  );
}

export function SendSignalForm() {
  const [values, setValues] = useState<ContactFormValues>(emptyContactFormValues);
  const [errors, setErrors] = useState<ContactValidationErrors & Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const selectedTypeNote = useMemo(
    () => (values.submissionType ? typeNotes[values.submissionType] : null),
    [values.submissionType]
  );

  function updateField(field: keyof ContactFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatus("idle");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);

    if (hasContactValidationErrors(nextErrors)) {
      setStatus("error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitContactSignal(values);

        if (!result.ok) {
          setErrors(result.errors ?? {});
          setStatus("error");
          return;
        }

        setStatus("success");
        setValues(emptyContactFormValues);
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <section className="grid gap-5" aria-labelledby="send-signal-form">
      <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
        <SectionStamp label="Intake Form" kicker="Open Mic" tone="red" />
        <p className="max-w-xl font-utility text-xs font-bold uppercase text-dirty-gray">
          Server-side intake writes a pending file. No raw HTML gets rendered
          back at you.
        </p>
      </div>

      <form
        className="grid gap-5 border border-[rgba(183,178,168,0.24)] border-l-8 border-l-dirty-red bg-dirty-coal/90 p-4 shadow-signal min-[760px]:p-6"
        noValidate
        onSubmit={handleSubmit}
      >
        {status === "success" ? (
          <div
            className="border border-dirty-green bg-dirty-green/20 p-4"
            role="status"
          >
            <p className="font-display text-3xl font-black uppercase leading-none text-dirty-ash">
              Signal logged.
            </p>
            <p className="mt-2 text-dirty-gray">
              Signal Control has the pending file. It is internal only; nothing
              was published to the public wire.
            </p>
          </div>
        ) : null}

        {status === "error" ? (
          <div
            className="border border-dirty-red bg-dirty-red/15 p-4"
            role="alert"
          >
            <p className="font-display text-3xl font-black uppercase leading-none text-dirty-ash">
              Static jammed the line.
            </p>
            <p className="mt-2 text-dirty-gray">
              Fix the marked fields and send it again. The machine is picky
              before it gets useful.
            </p>
            {errors.database ? (
              <p className="mt-2 font-utility text-xs font-bold uppercase text-dirty-yellow">
                {errors.database}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 border-b border-[rgba(183,178,168,0.18)] pb-5 min-[760px]:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
              Name / Alias
            </span>
            <input
              className={fieldBase}
              name="name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Static Caller"
              type="text"
              value={values.name}
            />
            <FieldError message={errors.name} />
          </label>

          <label className="grid gap-2">
            <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
              Email
            </span>
            <input
              className={fieldBase}
              name="email"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={values.email}
            />
            <FieldError message={errors.email} />
          </label>
        </div>

        <div className="grid gap-4 border-b border-[rgba(183,178,168,0.18)] pb-5 min-[760px]:grid-cols-[minmax(0,1fr)_18rem]">
          <label className="grid gap-2">
            <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
              Subject
            </span>
            <input
              className={fieldBase}
              name="subject"
              onChange={(event) => updateField("subject", event.target.value)}
              placeholder="What crawled out of the wire?"
              type="text"
              value={values.subject}
            />
            <FieldError message={errors.subject} />
          </label>

          <fieldset className="grid gap-2">
            <legend className="font-utility text-xs font-black uppercase text-dirty-yellow">
              Can we read this on air?
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["yes", "no"] as const).map((choice) => (
                <label
                  className={cx(
                    "flex min-h-12 cursor-pointer items-center justify-center border px-3 py-2 font-utility text-sm font-black uppercase transition-colors",
                    values.canReadOnAir === choice
                      ? "border-dirty-yellow bg-dirty-yellow text-dirty-black"
                      : "border-[rgba(183,178,168,0.34)] bg-dirty-black/60 text-dirty-gray hover:border-dirty-yellow"
                  )}
                  key={choice}
                >
                  <input
                    checked={values.canReadOnAir === choice}
                    className="sr-only"
                    name="canReadOnAir"
                    onChange={() => updateField("canReadOnAir", choice)}
                    type="radio"
                    value={choice}
                  />
                  {choice}
                </label>
              ))}
            </div>
            <FieldError message={errors.canReadOnAir} />
          </fieldset>
        </div>

        <fieldset className="grid gap-3">
          <legend className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Submission Type
          </legend>
          <div className="grid gap-3 min-[640px]:grid-cols-2 min-[980px]:grid-cols-4">
            {submissionTypes.map((type) => (
              <label
                className={cx(
                  "grid min-h-32 cursor-pointer content-start gap-2 border p-3 shadow-[0.2rem_0.2rem_0_rgba(0,0,0,0.3)] transition-colors",
                  values.submissionType === type
                    ? "border-dirty-red bg-dirty-red/20 text-dirty-ash"
                    : "border-[rgba(183,178,168,0.24)] bg-dirty-purple/45 text-dirty-gray hover:border-dirty-yellow hover:bg-dirty-yellow/10"
                )}
                key={type}
              >
                <input
                  checked={values.submissionType === type}
                  className="sr-only"
                  name="submissionType"
                  onChange={() => updateField("submissionType", type)}
                  type="radio"
                  value={type}
                />
                <span className="font-display text-2xl font-black uppercase leading-none text-dirty-ash">
                  {type}
                </span>
                <span className="text-sm leading-snug">{typeNotes[type]}</span>
              </label>
            ))}
          </div>
          <FieldError message={errors.submissionType} />
          {selectedTypeNote ? (
            <p className="font-utility text-xs font-bold uppercase text-dirty-yellow">
              Selected file note: {selectedTypeNote}
            </p>
          ) : null}
        </fieldset>

        <label className="grid gap-2 border-t border-[rgba(183,178,168,0.18)] pt-5">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Message
          </span>
          <textarea
            className={cx(fieldBase, "min-h-44 resize-y leading-relaxed")}
            name="message"
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Say the thing. Keep threats, illegal instructions, and raw HTML out of the broadcast slot."
            value={values.message}
          />
          <FieldError message={errors.message} />
        </label>

        <label className="grid gap-2">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Link / Attachment URL
          </span>
          <input
            className={fieldBase}
            name="attachmentUrl"
            onChange={(event) => updateField("attachmentUrl", event.target.value)}
            placeholder="https://..."
            type="url"
            value={values.attachmentUrl}
          />
          <FieldError message={errors.attachmentUrl} />
        </label>

        <div className="flex flex-col gap-3 border-t border-[rgba(183,178,168,0.24)] pt-5 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <p className="max-w-2xl text-sm leading-snug text-dirty-gray">
            Sending this form validates the intake locally. It does not publish
            a post, create an account, or fire an email from client-side code.
          </p>
          <DirtyButton className="min-[640px]:min-w-48" disabled={isPending} type="submit">
            {isPending ? "Sending Static" : "Send a Signal"}
          </DirtyButton>
        </div>
      </form>
    </section>
  );
}
