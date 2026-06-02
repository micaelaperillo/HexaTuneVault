// Raised when a review persistence operation fails for an infrastructure
// reason. The original (storage-specific) detail is kept on the message for
// server logs only; the global mapper replaces it with a generic message so
// nothing about the underlying store reaches the client.
export class ReviewRepositoryException extends Error {
  constructor(message: string) {
    super(message);
  }
}
