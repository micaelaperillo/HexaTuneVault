import 'reflect-metadata';
import {
  buildSubject,
  splitSubject,
  SubjectType,
} from '../../../src/model/review-subject';

describe('buildSubject', () => {
  it('builds an album subject', () => {
    expect(buildSubject(SubjectType.ALBUM, 'abc')).toEqual({ album: 'abc' });
  });

  it('builds an artist subject', () => {
    expect(buildSubject(SubjectType.ARTIST, 'def')).toEqual({ artist: 'def' });
  });

  it('builds a podcast subject', () => {
    expect(buildSubject(SubjectType.PODCAST, 'ghi')).toEqual({
      podcast: 'ghi',
    });
  });

  it('builds a track subject', () => {
    expect(buildSubject(SubjectType.TRACK, 'jkl')).toEqual({ track: 'jkl' });
  });
});

describe('splitSubject', () => {
  it('splits an album subject', () => {
    expect(splitSubject({ album: 'abc' })).toEqual({
      type: SubjectType.ALBUM,
      id: 'abc',
    });
  });

  it('splits an artist subject', () => {
    expect(splitSubject({ artist: 'def' })).toEqual({
      type: SubjectType.ARTIST,
      id: 'def',
    });
  });

  it('splits a podcast subject', () => {
    expect(splitSubject({ podcast: 'ghi' })).toEqual({
      type: SubjectType.PODCAST,
      id: 'ghi',
    });
  });

  it('splits a track subject', () => {
    expect(splitSubject({ track: 'jkl' })).toEqual({
      type: SubjectType.TRACK,
      id: 'jkl',
    });
  });

  it('round-trips album via buildSubject + splitSubject', () => {
    const subject = buildSubject(SubjectType.ALBUM, 'xyz');
    expect(splitSubject(subject)).toEqual({
      type: SubjectType.ALBUM,
      id: 'xyz',
    });
  });

  it('round-trips track via buildSubject + splitSubject', () => {
    const subject = buildSubject(SubjectType.TRACK, 'mno');
    expect(splitSubject(subject)).toEqual({
      type: SubjectType.TRACK,
      id: 'mno',
    });
  });
});
