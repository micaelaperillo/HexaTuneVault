// Failure crossing a catalog provider (driven) port. Defined with the port so
// both the implementing adapter and the inbound HTTP mapper depend inward.
export class AlbumProviderError extends Error {
  constructor(readonly error: Error) {
    super(error.message, { cause: error.cause });
  }
}

export class ArtistProviderError extends Error {
  constructor(readonly error: Error) {
    super(error.message, { cause: error.cause });
  }
}

export class PodcastProviderError extends Error {
  constructor(readonly error: Error) {
    super(error.message, { cause: error.cause });
  }
}
