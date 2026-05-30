import { AssociatedType } from './associated-type.enum';

export interface CommentFilters {
  createdBy?: string;
  content?: string;
  associatedType?: AssociatedType;
}
