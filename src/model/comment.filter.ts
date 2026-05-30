import { AssociatedType } from './comment.associated.type';

export interface CommentFilters {
  createdBy?: string;
  content?: string;
  associatedType?: AssociatedType;
}
