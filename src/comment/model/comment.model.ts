export interface CommentModel {
    id: number;
    content: string;
    createdAt: Date;
    createdBy: string;
    associatedTo: number;
    likedBy: string[];
}