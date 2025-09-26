import { Post, Category, SortOrder, User } from '../types';

let users: (User & { password_hash: string })[] = [
    { id: 'user1', email: 'test@example.com', password_hash: 'password123' },
    { id: 'user2', email: 'jane.doe@example.com', password_hash: 'password123' },
];

let posts: Post[] = [
    {
        id: '1',
        problem: 'Potholes on Main Street are damaging cars.',
        solution: 'Organize a community-led "Pothole Blitz Day" to fill the worst ones with city-supplied materials.',
        category: Category.Roads,
        votes: 15,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        authorId: 'user1',
        authorEmail: 'test@example.com',
        votesBy: { 'user1': 1, 'user2': 1 }, // Example data
        address: '123 Main St, Victoria, BC',
        location: { lat: 48.4284, lng: -123.3656 },
    },
    {
        id: '2',
        problem: 'Lack of affordable housing for young families.',
        solution: 'Lobby the city council to approve zoning for more duplexes and triplexes in single-family neighborhoods.',
        category: Category.Housing,
        votes: 28,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        authorId: 'user2',
        authorEmail: 'jane.doe@example.com',
        votesBy: { 'user2': 1 },
    },
    {
        id: '3',
        problem: 'The downtown bus route is unreliable and infrequent.',
        solution: 'Implement dedicated bus lanes during peak hours to improve speed and stick to the schedule.',
        category: Category.Transit,
        votes: 8,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        authorId: 'user1',
        authorEmail: 'test@example.com',
        votesBy: {},
        address: 'Douglas St corridor',
        location: { lat: 48.4258, lng: -123.3642 },
    },
    {
        id: '4',
        problem: 'Riverside Park playground equipment is outdated and unsafe.',
        solution: 'Fundraise for modern, inclusive playground equipment through local business sponsorships.',
        category: Category.Parks,
        votes: 22,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        authorId: 'user2',
        authorEmail: 'jane.doe@example.com',
        votesBy: { 'user1': 1 },
        address: '2999 Riverside Dr',
    },
];

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 300));
}

// --- Auth Functions ---
export async function login(email: string, password_hash: string): Promise<User> {
    const user = users.find(u => u.email === email && u.password_hash === password_hash);
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const { password_hash: _, ...userWithoutPassword } = user;
    return simulateDelay(userWithoutPassword);
}

export async function signup(email: string, password_hash: string): Promise<User> {
    if (users.some(u => u.email === email)) {
        throw new Error('An account with this email already exists.');
    }
    const newUser = {
        id: `user${users.length + 1}`,
        email,
        password_hash,
    };
    users.push(newUser);
    const { password_hash: _, ...userWithoutPassword } = newUser;
    return simulateDelay(userWithoutPassword);
}

// --- Post Functions ---

export async function getPosts(sort: SortOrder, category?: Category | 'all'): Promise<Post[]> {
    let filteredPosts = [...posts];

    if (category && category !== 'all') {
        filteredPosts = filteredPosts.filter(p => p.category === category);
    }

    if (sort === 'newest') {
        filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'votes') {
        filteredPosts.sort((a, b) => b.votes - a.votes);
    }
    
    return simulateDelay(filteredPosts);
}

export async function createPost(problem: string, solution: string, category: Category, address: string, authorId: string, authorEmail: string, location?: { lat: number; lng: number }): Promise<Post> {
    const newPost: Post = {
        id: (Math.random() + 1).toString(36).substring(7),
        problem,
        solution,
        category,
        address,
        votes: 0,
        created_at: new Date().toISOString(),
        authorId,
        authorEmail,
        votesBy: {},
        location,
    };
    posts.unshift(newPost);
    return simulateDelay(newPost);
}

export async function updateVotes(id: string, userId: string, delta: 1 | -1): Promise<Post | null> {
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex > -1) {
        const post = posts[postIndex];
        const currentVote = post.votesBy[userId];

        if (currentVote === delta) {
            // User is clicking the same button again, so remove their vote
            post.votes -= delta;
            delete post.votesBy[userId];
        } else {
            // New vote or changing vote
            if (currentVote) {
                // Changing vote (e.g. from up to down, which is a 2-point swing)
                post.votes -= currentVote;
            }
            post.votes += delta;
            post.votesBy[userId] = delta;
        }
        
        return simulateDelay({ ...post });
    }
    return simulateDelay(null);
}

export async function deletePost(id: string, userId: string): Promise<void> {
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
        throw new Error("Post not found.");
    }
    if (posts[postIndex].authorId !== userId) {
        throw new Error("User not authorized to delete this post.");
    }
    posts.splice(postIndex, 1);
    return simulateDelay(undefined);
}

export async function updatePost(id: string, userId: string, updates: { problem: string, solution: string, category: Category, address: string, location?: { lat: number, lng: number } | null }): Promise<Post> {
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) {
        throw new Error("Post not found.");
    }
    if (posts[postIndex].authorId !== userId) {
        throw new Error("User not authorized to edit this post.");
    }
    
    const updatedPost = { ...posts[postIndex], ...updates };
    if (updates.location === null) {
        delete updatedPost.location;
    }
    if (updates.address === '') {
        delete updatedPost.address;
    }


    posts[postIndex] = updatedPost;
    return simulateDelay({ ...posts[postIndex] });
}