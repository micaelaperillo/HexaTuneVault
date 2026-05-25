export interface CommentModel {
    id: number;
    content: string;
    createdAt: Date;
    createdBy: number;
    associatedTo: number;
    likedBy: number[];
}