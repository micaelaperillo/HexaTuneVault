export interface CommentModel {
    id: number;
    content: string;
    createdAt: Date;
    createdBy: string;
    targetId: number;
    likedBy: string[];
}