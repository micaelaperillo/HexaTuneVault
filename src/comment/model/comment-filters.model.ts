import { AssociatedType } from './associated-type.enum';

export interface CommentFilters {
  createdBy?: number;
  content?: string;
  associatedType?: AssociatedType;
}
