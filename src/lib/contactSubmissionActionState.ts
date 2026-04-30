export type PublicContactSubmissionFailureState = {
  errors: {
    database: string;
  };
  ok: false;
};

export function logContactSubmissionFailure(backend: string, error: unknown) {
  console.error(`Contact signal submission failed through ${backend}.`, error);
}

export function createContactSubmissionFailureState(): PublicContactSubmissionFailureState {
  return {
    errors: {
      database: "Signal Control could not log that signal. Try again in a minute."
    },
    ok: false
  };
}
