// Failure crossing a persistence (driven) port. Original store-specific detail
// is kept on the message for server logs only; the global HTTP mapper replaces
// it with a generic message so nothing about the underlying store reaches the
// client.
export class CommentDBException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserDBException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ReviewRepositoryException extends Error {
  constructor(message: string) {
    super(message);
  }
}
