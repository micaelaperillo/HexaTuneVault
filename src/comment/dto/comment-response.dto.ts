import { AssociatedType } from '../model/associated-type.enum';

export class CommentResponseDto {
  id!: number;
  content!: string;
  createdAt!: Date;
  createdBy!: number;
  associatedTo!: number;
  associatedType!: AssociatedType;
  likedBy!: number[];
}
