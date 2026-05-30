import { AssociatedType } from './associated-type';

export interface CommentFilters {
  createdBy?: string;
  content?: string;
  associatedType?: AssociatedType;
}
