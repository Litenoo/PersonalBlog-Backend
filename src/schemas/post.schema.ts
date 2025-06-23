import { z } from "zod";

export interface responseWrapper<T> {
    status: number;
    message: string;
    data?: T;
} //Response wrapper for post schema etc.
//services such as database.service.ts are going to return only data, and 
//data is going to be wrapped with that interface in the http service

const tagSchema = z.object({
    id: z.number(),
    title: z.string()
});

export const insertPostSchema = z.object({
    title: z.string()
        .min(2)
        .max(128),

    content: z.string()
        .min(16),

    published: z.boolean()
        .default(false),

    tags: z.array(z.string()).optional(),
}).strict();

export const editPostSchema = insertPostSchema.extend({
    id: z.number()
        .int()
        .positive(),
}).strict();