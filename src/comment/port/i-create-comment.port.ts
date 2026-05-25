import { CommentModel } from "../model/comment.model";

export const CREATE_COMMENT = Symbol('ICreateComment');

export interface ICreateComment {
    create(comment: Omit<CommentModel, 'id'>): Promise<CommentModel>;
}