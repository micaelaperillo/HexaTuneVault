export class CommentNotFoundException extends Error {
  constructor(id: number) {
    super(`Comment with id ${id} not found`);
  }
}
