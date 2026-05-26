import { Injectable } from '@nestjs/common';
import { SubjectReference } from '@review/domain/model/subject-reference.js';
import { SubjectSummary } from '@review/domain/model/subject-summary.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';

@Injectable()
export class SubjectResolverAdapter implements ISubjectResolver {
  resolve(ref: SubjectReference): Promise<SubjectSummary> {
    return Promise.resolve(new SubjectSummary(ref.id, 'Unknown', ref.type));
  }
}
