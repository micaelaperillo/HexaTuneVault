import * as albumProvider from '../src/adapter/album.provider';
import * as artistProvider from '../src/adapter/artist.provider';
import * as podcastProvider from '../src/adapter/podcast.provider';
import * as artistService from '../src/use-case/artist.service';
import * as podcastService from '../src/use-case/podcast.service';
import * as commentService from '../src/use-case/comment.service';
import * as userService from '../src/use-case/user.service';

// These modules re-export their DI tokens (`export { TOKEN } from '...'`) as a
// convenience for the wiring modules. Accessing each token exercises the
// re-export bindings.
describe('module re-exports', () => {
  it('re-exports the catalog provider tokens', () => {
    expect(albumProvider.ALBUM_PROVIDER).toBeDefined();
    expect(artistProvider.ARTIST_PROVIDER).toBeDefined();
    expect(podcastProvider.PODCAST_PROVIDER).toBeDefined();
  });

  it('re-exports the catalog/comment service tokens', () => {
    expect(artistService.GET_ARTIST).toBeDefined();
    expect(artistService.SEARCH_ARTIST).toBeDefined();
    expect(podcastService.GET_PODCAST).toBeDefined();
    expect(podcastService.SEARCH_PODCAST).toBeDefined();
    expect(commentService.COMMENT_REPOSITORY).toBeDefined();
  });

  it('re-exports the user service tokens', () => {
    expect(userService.AUTHENTICATE_USER).toBeDefined();
    expect(userService.CREATE_USER).toBeDefined();
    expect(userService.EDIT_USER).toBeDefined();
    expect(userService.DELETE_USER).toBeDefined();
    expect(userService.SEARCH_USER).toBeDefined();
    expect(userService.GET_USER).toBeDefined();
    expect(userService.FOLLOW_USER).toBeDefined();
    expect(userService.LIST_FOLLOWS).toBeDefined();
  });
});
