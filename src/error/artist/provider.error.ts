export class ArtistProviderError extends Error {
  constructor(readonly error: Error) {
    super(error.message, { cause: error.cause });
  }
}
