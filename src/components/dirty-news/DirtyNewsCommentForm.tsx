"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitDirtyNewsComment } from "@/app/dirty-news/actions";
import { DirtyButton } from "@/components/dirty";
import { cx } from "@/components/dirty/shared";
import { validateCommentFields, type CommentFields } from "@/lib/contentValidation";

type DirtyNewsCommentFormProps = {
  postId: string;
  postSlug: string;
};

const emptyValues: CommentFields = {
  authorEmail: "",
  authorName: "",
  body: ""
};

const fieldBase =
  "w-full border border-[rgba(183,178,168,0.34)] bg-dirty-black/70 px-3 py-3 text-base text-dirty-ash shadow-[inset_0_0_0_1px_rgba(0,0,0,0.32)] outline-none transition-colors placeholder:text-dirty-gray/55 focus:border-dirty-yellow aria-invalid:border-dirty-red";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="font-utility text-xs font-bold uppercase text-dirty-red" id={id}>{message}</p>;
}

export function DirtyNewsCommentForm({ postId, postSlug }: DirtyNewsCommentFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CommentFields>(emptyValues);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const formError = errors.form ?? errors.postId ?? errors.database;
  const hasFieldError = Boolean(errors.authorName || errors.authorEmail || errors.body);

  function updateField(field: keyof CommentFields, value: string) {
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
    const validated = validateCommentFields(values);

    if (!validated.ok) {
      setErrors(validated.errors);
      setStatus("error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitDirtyNewsComment({
          ...validated.data,
          honeypot,
          postId,
          postSlug
        });

        if (!result.ok) {
          setErrors(result.errors ?? {});
          setStatus("error");
          return;
        }

        setValues(emptyValues);
        setHoneypot("");
        setErrors({});
        setStatus("success");
        router.refresh();
      } catch {
        setErrors({ database: "The comment wire is temporarily unavailable. Try again." });
        setStatus("error");
      }
    });
  }

  return (
    <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
      {status === "success" ? (
        <div className="border border-dirty-green bg-dirty-green/20 p-4" role="status">
          <p className="font-display text-2xl font-black uppercase leading-none text-dirty-ash">
            Comment live.
          </p>
          <p className="mt-2 text-sm text-dirty-gray">
            No approval queue. Your static is on the file unless Signal Control hides it.
          </p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="border border-dirty-red bg-dirty-red/15 p-4" role="alert">
          <p className="font-display text-2xl font-black uppercase leading-none text-dirty-ash">
            Comment jammed.
          </p>
          <p className="mt-2 text-sm text-dirty-gray">
            {formError ?? (hasFieldError ? "Fix the marked fields and send the noise again." : "Try sending the comment again.")}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 min-[760px]:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Name / Alias
          </span>
          <input
            aria-describedby={errors.authorName ? "comment-name-error" : undefined}
            aria-invalid={Boolean(errors.authorName)}
            className={fieldBase}
            maxLength={120}
            name="authorName"
            onChange={(event) => updateField("authorName", event.target.value)}
            placeholder="Basement Caller"
            type="text"
            value={values.authorName}
          />
          <FieldError id="comment-name-error" message={errors.authorName} />
        </label>

        <label className="grid gap-2">
          <span className="font-utility text-xs font-black uppercase text-dirty-yellow">
            Email <span className="text-dirty-gray">(Optional)</span>
          </span>
          <input
            aria-describedby={errors.authorEmail ? "comment-email-error" : undefined}
            aria-invalid={Boolean(errors.authorEmail)}
            className={fieldBase}
            maxLength={254}
            name="authorEmail"
            onChange={(event) => updateField("authorEmail", event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={values.authorEmail ?? ""}
          />
          <FieldError id="comment-email-error" message={errors.authorEmail} />
        </label>
      </div>

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
          Comment
        </span>
        <textarea
          aria-describedby={errors.body ? "comment-body-error" : undefined}
          aria-invalid={Boolean(errors.body)}
          className={cx(fieldBase, "min-h-36 resize-y leading-relaxed")}
          maxLength={4000}
          name="body"
          onChange={(event) => updateField("body", event.target.value)}
          placeholder="Plain text only. Say the thing. Do not paste raw HTML like it owes you money."
          value={values.body}
        />
        <div className="flex flex-col gap-1 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
          <FieldError id="comment-body-error" message={errors.body} />
          <p className="font-utility text-xs font-bold uppercase text-dirty-gray">
            {values.body.length}/4000
          </p>
        </div>
      </label>

      <div className="flex flex-col gap-3 border-t border-[rgba(183,178,168,0.24)] pt-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
        <p className="max-w-2xl text-sm leading-snug text-dirty-gray">
          Comments publish immediately as plain text. Signal Control can hide, restore, or delete the wreckage.
        </p>
        <DirtyButton className="min-[640px]:min-w-44" disabled={isPending} type="submit">
          {isPending ? "Sending Static" : "Post Comment"}
        </DirtyButton>
      </div>
    </form>
  );
}
