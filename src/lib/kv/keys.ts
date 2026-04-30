export const keys = {
  commentsIndex: "content:comments:index",
  contactIndex: "content:contact-submissions:index",
  home: "content:settings:home",
  postSubmissionsIndex: "content:post-submissions:index",
  postsIndex: "content:posts:index",
  videosDeletedIndex: "content:videos:deleted:index",
  videosIndex: "content:videos:index"
};

export function keyFor(type: "comments" | "contact-submissions" | "post-submissions" | "posts" | "videos", id: string) {
  return `content:${type}:${id}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
