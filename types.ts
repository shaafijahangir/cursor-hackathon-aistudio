export enum Category {
    Housing = 'Housing',
    Roads = 'Roads',
    Transit = 'Transit',
    Parks = 'Parks',
    Safety = 'Safety',
    Other = 'Other',
}

export interface User {
    id: string;
    email: string;
}

export interface Post {
    id: string;
    problem: string;
    solution: string;
    category: Category;
    votes: number;
    created_at: string;
    authorId: string;
    authorEmail: string;
    votesBy: Record<string, 1 | -1>; // userId: voteDirection
    address?: string;
    location?: { lat: number; lng: number };
}

export type SortOrder = 'newest' | 'votes';