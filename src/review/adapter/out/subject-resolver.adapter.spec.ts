import { SubjectResolverAdapter } from './subject-resolver.adapter.js';
import {
  SubjectReference,
  SubjectType,
} from '@review/domain/model/subject-reference.js';
import { SubjectSummary } from '@review/domain/model/subject-summary.js';

describe('SubjectResolverAdapter', () => {
  const adapter = new SubjectResolverAdapter();

  it('should return a placeholder SubjectSummary', async () => {
    const ref = new SubjectReference(SubjectType.ALBUM, 42);

    const result = await adapter.resolve(ref);

    expect(result).toBeInstanceOf(SubjectSummary);
    expect(result.id).toBe(42);
    expect(result.name).toBe('Unknown');
    expect(result.type).toBe(SubjectType.ALBUM);
  });

  it('should preserve subject type for non-album types', async () => {
    const ref = new SubjectReference(SubjectType.TRACK, 7);

    const result = await adapter.resolve(ref);

    expect(result.id).toBe(7);
    expect(result.type).toBe(SubjectType.TRACK);
  });
});
