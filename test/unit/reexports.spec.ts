import * as artistService from '../../src/use-case/artist.service';
import * as podcastService from '../../src/use-case/podcast.service';
import * as commentService from '../../src/use-case/comment.service';
import * as userService from '../../src/use-case/user.service';

// These services re-export their DI tokens (`export { TOKEN } from '...'`) as a
// convenience for the wiring modules. Accessing each token exercises the
// re-export bindings.
describe('module re-exports', () => {
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
