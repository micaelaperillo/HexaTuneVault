import { AssociatedType } from './associated-type.enum';

export interface CommentModel {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: string;
  associatedTo: string;
  associatedType: typeof AssociatedType;
  likedBy: string[];
}
