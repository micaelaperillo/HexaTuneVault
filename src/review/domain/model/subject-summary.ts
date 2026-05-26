import { SubjectType } from './subject-reference.js';

export class SubjectSummary {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly type: SubjectType,
    public readonly imageUrl?: string,
  ) {}
}
