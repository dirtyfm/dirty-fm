"use client";

import { FormEvent, useState, useTransition } from "react";
import { submitDirtyNewsSignal } from "@/app/dirty-news/actions";
import { DirtyButton, SectionStamp } from "@/components/dirty";
import { cx } from "@/components/dirty/shared";
import {
  postSubmissionCategories,
  validatePostSubmission,
  type PostSubmissionInput
} from "@/lib/contentValidation";

const emptyValues: PostSubmissionInput = {
  body: "",
  category: "",
  email: "",
  name: "",
  sourceUrl: "",
  title: ""
};

const fieldBase =
  "w-full border border-[rgba(183,178,168,0.34)] bg-dirty-black/70 px-3 py-3 text-base text-dirty-ash shadow-[inset_0_0_0_1px_rgba(0,0,0,0.32)] outline-none transition-colors placeholder:text-dirty-gray/55 focus:border-dirty-yellow";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="font-utility text-xs font-bold uppercase text-dirty-red">{message}</p>;
}

export function DirtyNewsSubmissionForm() {
  const [values, setValues] = useState<PostSubmissionInput>(emptyValues);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof PostSubmissionInput, value: string) {
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
    const validated = validatePostSubmission(values);

    if (!validated.ok) {
      setErrors(validated.errors);
      setStatus("error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitDirtyNewsSignal({ ...values, honeypot });

        if (!result.ok) {
          setErrors(result.errors ?? {});
          setStatus("error");
          return;
        }

        setValues(emptyValues);
        setHoneypot("");
        setStatus("success");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <section className="grid gap-5" id="submit-dirty-news">
      <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between">
        <SectionStamp label="Dirty News Intake" kicker="Public Submission" tone="red" />
        <p className="max-w-xl font-utility text-xs font-bold uppercase text-dirty-gray">
          Public users can submit a pending file. Publishing stays behind Signal
          Control.
        </p>
      </div>

      <form
        className="grid gap-5 border border-[rgba(183,178,168,0.24)] border-l-8 border-l-dirty-red bg-dirty-coal/90 p-4 shadow-signal min-[760px]:p-6"
        noValidate
        onSubmit={handleSubmit}
      >
        {status === "success" ? (
          <div className="border border-dirty-green bg-dirty-green/20 p-4" role="status">
            <p className="font-display text-3xl font-black uppercase leading-none text-dirty-ash">
              Dirty file pending.
            </p>
            <p className="mt-2 text-dirty-gray">
              Signal Control has the submission. It is not public until an
              operator edits and publishes it.
            </p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="border border-dirty-red bg-dirty-red/15 p-4" role="alert">
            <p className="font-display text-3xl font-black uppercase leading-none text-dirty-ash">
              Submission jammed.
            </p>
            <p className="mt-2 text-dirty-gray">
              Fix the marked fields and send the file again.
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
              maxLength={120}
              name="name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Wire Rat"
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
              maxLength={254}
              name="email"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={values.email}
            />
            <FieldError message={errors.email} />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            File Title
          </span>
          <input
            className={fieldBase}
            maxLength={180}
            name="title"
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Headline for the damage"
            type="text"
            value={values.title}
          />
          <FieldError message={errors.title} />
        </label>

        <fieldset className="grid gap-3">
          <legend className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Bucket
          </legend>
          <div className="grid gap-3 min-[640px]:grid-cols-2 min-[980px]:grid-cols-3">
            {postSubmissionCategories.map((category) => (
              <label
                className={cx(
                  "flex min-h-14 cursor-pointer items-center border px-3 py-2 font-utility text-xs font-black uppercase shadow-[0.18rem_0.18rem_0_rgba(0,0,0,0.3)] transition-colors",
                  values.category === category
                    ? "border-dirty-red bg-dirty-red/20 text-dirty-ash"
                    : "border-[rgba(183,178,168,0.24)] bg-dirty-purple/45 text-dirty-gray hover:border-dirty-yellow"
                )}
                key={category}
              >
                <input
                  checked={values.category === category}
                  className="sr-only"
                  name="category"
                  onChange={() => updateField("category", category)}
                  type="radio"
                  value={category}
                />
                {category}
              </label>
            ))}
          </div>
          <FieldError message={errors.category} />
        </fieldset>

        <label className="grid gap-2">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Body
          </span>
          <textarea
            className={cx(fieldBase, "min-h-56 resize-y leading-relaxed")}
            maxLength={20000}
            name="body"
            onChange={(event) => updateField("body", event.target.value)}
            placeholder="Write the dispatch. Plain text only. No raw HTML, no threats, no publish button."
            value={values.body}
          />
          <FieldError message={errors.body} />
          <p className="font-utility text-xs font-bold uppercase text-dirty-gray">
            {values.body.length}/20000
          </p>
        </label>

        <label className="hidden" aria-hidden="true">
          Website
          <input
            autoComplete="off"
            name="website"
            onChange={(event) => setHoneypot(event.target.value)}
            tabIndex={-1}
            type="text"
            value={honeypot}
          />
        </label>

        <label className="grid gap-2">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Source URL
          </span>
          <input
            className={fieldBase}
            name="sourceUrl"
            onChange={(event) => updateField("sourceUrl", event.target.value)}
            placeholder="https://..."
            type="url"
            value={values.sourceUrl}
          />
          <FieldError message={errors.sourceUrl} />
        </label>

        <div className="flex flex-col gap-3 border-t border-[rgba(183,178,168,0.24)] pt-5 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <p className="max-w-2xl text-sm leading-snug text-dirty-gray">
            New submissions are written as pending post submissions. Public
            users cannot set approval status or write into published posts.
          </p>
          <DirtyButton className="min-[640px]:min-w-48" disabled={isPending} type="submit">
            {isPending ? "Sending File" : "Submit Dirty News"}
          </DirtyButton>
        </div>
      </form>
    </section>
  );
}
