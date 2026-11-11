export class SignalControlFormError extends Error {}

export type SignalControlFeedback = {
  message: string;
  error?: boolean;
  href?: string;
  linkLabel?: string;
};
