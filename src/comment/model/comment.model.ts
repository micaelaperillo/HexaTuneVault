import { AssociatedType } from './associated-type.enum';

export interface CommentModel {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: number;
  associatedTo: number;
  associatedType: AssociatedType;
  likedBy: number[];
}
