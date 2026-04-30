export type PublicDirtyNewsComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type DbCommentForPublicMapping = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  is_hidden?: boolean;
};

export function mapVisiblePublicComments(
  comments: DbCommentForPublicMapping[]
): PublicDirtyNewsComment[] {
  return comments.filter((comment) => !comment.is_hidden).map((comment) => ({
    authorName: comment.author_name,
    body: comment.body,
    createdAt: comment.created_at,
    id: comment.id
  }));
}
