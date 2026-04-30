export const submissionTypes = [
  "Show Tip",
  "Open Mic Rant",
  "Guest Request",
  "Hate Mail",
  "Business / Booking",
  "Video Clip",
  "Technical Problem",
  "Other Bullshit"
] as const;

export type SubmissionType = (typeof submissionTypes)[number];
export type ReadOnAirChoice = "yes" | "no";

export type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  submissionType: string;
  message: string;
  attachmentUrl: string;
  canReadOnAir: string;
};

export type ContactValidationErrors = Partial<Record<keyof ContactFormValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emptyContactFormValues: ContactFormValues = {
  name: "",
  email: "",
  subject: "",
  submissionType: "",
  message: "",
  attachmentUrl: "",
  canReadOnAir: ""
};

export function validateContactForm(values: ContactFormValues): ContactValidationErrors {
  const errors: ContactValidationErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();
  const attachmentUrl = values.attachmentUrl.trim();

  if (!name) {
    errors.name = "Name or alias is required.";
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    errors.email = "Use a real email address so the signal can get answered.";
  }

  if (!subject) {
    errors.subject = "Subject is required.";
  }

  if (!submissionTypes.includes(values.submissionType as SubmissionType)) {
    errors.submissionType = "Pick the bucket this mess belongs in.";
  }

  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length < 20) {
    errors.message = "Give Drift at least 20 characters of usable static.";
  }

  if (attachmentUrl) {
    try {
      const url = new URL(attachmentUrl);

      if (!["http:", "https:"].includes(url.protocol)) {
        errors.attachmentUrl = "Use an http or https URL.";
      }
    } catch {
      errors.attachmentUrl = "Paste a valid URL or leave this empty.";
    }
  }

  if (!["yes", "no"].includes(values.canReadOnAir)) {
    errors.canReadOnAir = "Choose whether this can be read on air.";
  }

  return errors;
}

export function hasContactValidationErrors(errors: ContactValidationErrors) {
  return Object.keys(errors).length > 0;
}
