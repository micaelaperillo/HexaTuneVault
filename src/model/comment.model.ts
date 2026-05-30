import { AssociatedType } from './associated-type';

export interface CommentModel {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: string;
  associatedTo: string;
  associatedType: AssociatedType;
  likedBy: string[];
}
