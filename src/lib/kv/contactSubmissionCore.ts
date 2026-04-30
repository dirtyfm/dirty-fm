type ValidContactSubmission = {
  attachmentUrl?: string;
  canReadOnAir: boolean;
  email: string;
  message: string;
  name: string;
  subject: string;
  submissionType: string;
};

export function createKvContactSubmissionRecord(
  data: ValidContactSubmission,
  id: string,
  timestamp: string
) {
  return {
    admin_notes: null,
    attachment_url: data.attachmentUrl ?? null,
    can_read_on_air: data.canReadOnAir,
    created_at: timestamp,
    email: data.email,
    id,
    message: data.message,
    name: data.name,
    reviewed_at: null,
    reviewed_by: null,
    status: "pending" as const,
    subject: data.subject,
    submission_type: data.submissionType,
    updated_at: timestamp
  };
}
