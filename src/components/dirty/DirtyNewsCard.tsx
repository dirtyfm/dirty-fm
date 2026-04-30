import { ArchiveCard, type ArchiveMeta } from "./ArchiveCard";

export type DirtyNewsCardProps = {
  title: string;
  excerpt: string;
  href: string;
  category?: string;
  dateLabel?: string;
  status?: string;
};

export function DirtyNewsCard({
  title,
  excerpt,
  href,
  category = "Dirty News",
  dateLabel = "Undated",
  status = "Unapproved"
}: DirtyNewsCardProps) {
  const meta: ArchiveMeta[] = [
    { label: "Category", value: category },
    { label: "Logged", value: dateLabel },
    { label: "Status", value: status }
  ];

  return (
    <ArchiveCard
      actionLabel="Read the Rant"
      href={href}
      label="Dirty News Dispatch"
      meta={meta}
      notes={excerpt}
      title={title}
      tone="yellow"
    />
  );
}
