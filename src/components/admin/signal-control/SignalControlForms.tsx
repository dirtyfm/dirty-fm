"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { submitSignalControlAction } from "@/app/signal-control/actions";

const FormContext = createContext<{
  action: (data: FormData) => void;
  pending: boolean;
  submit: (data: FormData) => void;
} | null>(null);

export function SignalControlForms({ children }: { children: ReactNode }) {
  const [feedback, action, pending] = useActionState(submitSignalControlAction, null);
  const busy = useRef(false);
  useEffect(() => {
    if (!pending) busy.current = false;
  }, [pending, feedback]);

  function submit(data: FormData) {
    if (busy.current || pending) return;
    busy.current = true;
    startTransition(() => action(data));
  }

  return (
    <FormContext.Provider value={{ action, pending, submit }}>
      <div className="sticky top-2 z-20" aria-atomic="true">
        {pending ? (
          <p className="border border-dirty-yellow bg-dirty-black px-4 py-3 text-dirty-yellow" role="status">
            Working on that signal…
          </p>
        ) : feedback ? (
          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 border bg-dirty-black px-4 py-3 ${feedback.error ? "border-dirty-red text-dirty-ash" : "border-dirty-yellow text-dirty-yellow"}`} role={feedback.error ? "alert" : "status"}>
            <span>{feedback.message}</span>
            {feedback.href && feedback.linkLabel ? <a className="underline underline-offset-4" href={feedback.href}>{feedback.linkLabel}</a> : null}
          </div>
        ) : null}
      </div>
      {children}
    </FormContext.Provider>
  );
}

export function SignalControlForm({ children, className, operation, confirmation }: {
  children: ReactNode;
  className?: string;
  operation: string;
  confirmation?: string;
}) {
  const context = useContext(FormContext);
  if (!context) throw new Error("Signal Control form is outside the console.");
  const { action, pending, submit } = context;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || (confirmation && !window.confirm(confirmation))) return;
    const { submitter } = event.nativeEvent as SubmitEvent;
    const data = new FormData(event.currentTarget, submitter);
    if (confirmation) data.set("confirmed", "yes");
    submit(data);
  }

  return (
    <form action={action} aria-busy={pending} className={className} onSubmit={handleSubmit}>
      <fieldset className="contents disabled:opacity-60" disabled={pending}>
        <input name="operation" type="hidden" value={operation} />
        {children}
      </fieldset>
    </form>
  );
}
