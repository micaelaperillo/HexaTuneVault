// Spotify's search syntax treats `field:value` (e.g. `genre:rock`, `year:2000`)
// and double-quoted phrases as operators. Without neutralising user input a
// caller could inject those operators into a query the service builds, so strip
// the colon and quote characters from any user-supplied term and collapse the
// resulting whitespace.
export function escapeSpotifyTerm(term: string): string {
  return term.replace(/[:"]/g, ' ').replace(/\s+/g, ' ').trim();
}
