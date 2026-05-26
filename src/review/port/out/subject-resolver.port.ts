import type { SubjectReference } from '@review/domain/model/subject-reference.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';

export interface ISubjectResolver {
  resolve(ref: SubjectReference): Promise<SubjectSummary>;
}
