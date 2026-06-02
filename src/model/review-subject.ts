export const SubjectType = {
  ALBUM: 'album',
  ARTIST: 'artist',
  PODCAST: 'podcast',
  TRACK: 'track',
} as const;

export type SubjectType = (typeof SubjectType)[keyof typeof SubjectType];

// A review targets exactly one Spotify entity, keyed by its type.
export type ReviewSubject =
  | { album: string }
  | { artist: string }
  | { podcast: string }
  | { track: string };

// Bridges the keyed union and the (type, id) pair persisted in the DB.
export function splitSubject(subject: ReviewSubject): {
  type: SubjectType;
  id: string;
} {
  if ('album' in subject) return { type: 'album', id: subject.album };
  if ('artist' in subject) return { type: 'artist', id: subject.artist };
  if ('podcast' in subject) return { type: 'podcast', id: subject.podcast };
  return { type: 'track', id: subject.track };
}

export function buildSubject(type: SubjectType, id: string): ReviewSubject {
  switch (type) {
    case 'album':
      return { album: id };
    case 'artist':
      return { artist: id };
    case 'podcast':
      return { podcast: id };
    case 'track':
      return { track: id };
  }
}
