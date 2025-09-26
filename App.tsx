import React, { useState, useEffect, useCallback } from 'react';
import { Post, Category, SortOrder } from './types';
import { getPosts, createPost, updateVotes, deletePost, updatePost } from './services/api';
import PostCard from './components/PostCard';
import FilterBar from './components/FilterBar';
import SubmissionForm from './components/SubmissionForm';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
    
    const [showSubmissionForm, setShowSubmissionForm] = useState<boolean>(false);
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
    const [showSignupForm, setShowSignupForm] = useState<boolean>(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const { user, logout } = useAuth();

    const fetchPosts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const fetchedPosts = await getPosts(sortOrder, categoryFilter);
            setPosts(fetchedPosts);
        } catch (err) {
            setError('Failed to fetch posts. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [sortOrder, categoryFilter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleVote = async (id: string, delta: 1 | -1) => {
        if (!user) {
            setShowLoginForm(true);
            return;
        }
        
        // Optimistic UI update
        setPosts(currentPosts => 
            currentPosts.map(p => {
                if (p.id !== id) return p;

                const newPost = { ...p, votes: p.votes, votesBy: { ...p.votesBy } };
                const currentVote = newPost.votesBy[user.id];

                if (currentVote === delta) {
                    newPost.votes -= delta;
                    delete newPost.votesBy[user.id];
                } else {
                    if (currentVote) {
                        newPost.votes -= currentVote;
                    }
                    newPost.votes += delta;
                    newPost.votesBy[user.id] = delta;
                }
                
                return newPost;
            })
        );

        try {
            await updateVotes(id, user.id, delta);
        } catch (err) {
            console.error('Failed to update vote:', err);
            fetchPosts(); 
            alert('Failed to save your vote. Please try again.');
        }
    };
    
    const handleSavePost = async (problem: string, solution: string, category: Category, address: string, location: { lat: number; lng: number } | null) => {
        if (!user) {
             setShowLoginForm(true);
             return;
        }
        if (editingPost) {
            // Update logic
            const originalPosts = [...posts];
            const updatedPost = { ...editingPost, problem, solution, category, address, location: location || undefined };
            if (!location) delete updatedPost.location;
            if (!address) delete updatedPost.address;

            setPosts(currentPosts => currentPosts.map(p => p.id === editingPost.id ? updatedPost : p));
            try {
                await updatePost(editingPost.id, user.id, { problem, solution, category, address, location });
            } catch (err) {
                 console.error('Failed to update post:', err);
                 setPosts(originalPosts);
                 alert('Failed to update post. Please try again.');
            }
        } else {
             // Create logic
            await createPost(problem, solution, category, address, user.id, user.email, location || undefined);
            if (sortOrder !== 'newest') {
                setSortOrder('newest'); 
            } else {
                fetchPosts();
            }
        }
    };
    
    const handleOpenSubmitForm = () => {
        if (!user) {
            setShowLoginForm(true);
        } else {
            setEditingPost(null);
            setShowSubmissionForm(true);
        }
    };

    const handleOpenEditForm = (post: Post) => {
        setEditingPost(post);
        setShowSubmissionForm(true);
    };

    const handleDeletePost = async (id: string) => {
        if (!user) return;
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return;
        }
        
        const originalPosts = [...posts];
        setPosts(currentPosts => currentPosts.filter(p => p.id !== id));

        try {
            await deletePost(id, user.id);
        } catch (err) {
            console.error('Failed to delete post:', err);
            setPosts(originalPosts);
            alert('Failed to delete the post. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-vov-blue">
                            Voices of Victoria
                        </h1>
                        <p className="hidden md:block text-gray-500 text-sm">Your Community, Your Voice.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-gray-700 hidden sm:block">{user.email}</span>
                                <button onClick={logout} className="bg-vov-rust hover:bg-vov-maroon text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">
                                    Logout
                                </button>
                            </>
                        ) : (
                             <>
                                <button onClick={() => setShowLoginForm(true)} className="text-vov-blue font-semibold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors text-sm">
                                    Login
                                </button>
                                 <button onClick={() => setShowSignupForm(true)} className="bg-vov-blue hover:bg-vov-cyan text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6">
                <FilterBar
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                />
                
                {isLoading && <div className="text-center text-gray-500">Loading posts...</div>}
                {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}

                {!isLoading && !error && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    onVote={handleVote}
                                    onEdit={handleOpenEditForm}
                                    onDelete={handleDeletePost}
                                />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-10">
                                <h3 className="text-xl font-semibold">No posts found.</h3>
                                <p>Be the first to submit a proposal!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <button
                onClick={handleOpenSubmitForm}
                className="fixed bottom-6 right-6 bg-vov-orange hover:bg-vov-red text-white font-bold w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
                aria-label="Submit a new proposal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
            
            {showSubmissionForm && (
                <SubmissionForm 
                    onSubmit={handleSavePost} 
                    onClose={() => {
                        setShowSubmissionForm(false);
                        setEditingPost(null);
                    }}
                    postToEdit={editingPost} 
                />
            )}
            
            {showLoginForm && (
                <LoginForm
                    onClose={() => setShowLoginForm(false)}
                    onSwitchToSignup={() => {
                        setShowLoginForm(false);
                        setShowSignupForm(true);
                    }}
                />
            )}

            {showSignupForm && (
                <SignupForm
                    onClose={() => setShowSignupForm(false)}
                    onSwitchToLogin={() => {
                        setShowSignupForm(false);
                        setShowLoginForm(true);
                    }}
                />
            )}
        </div>
    );
};

export default App;