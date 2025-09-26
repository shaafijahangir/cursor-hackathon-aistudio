import React, { useState, useEffect, useRef } from 'react';
import { Post, Category } from '../types';
import { useAuth } from '../contexts/AuthContext';

declare var L: any;

interface PostCardProps {
    post: Post;
    onVote: (id: string, delta: 1 | -1) => void;
    onEdit: (post: Post) => void;
    onDelete: (id: string) => void;
}

const categoryColors: Record<Category, string> = {
    [Category.Housing]: 'bg-blue-100 text-blue-800',
    [Category.Roads]: 'bg-gray-100 text-gray-800',
    [Category.Transit]: 'bg-green-100 text-green-800',
    [Category.Parks]: 'bg-yellow-100 text-yellow-800',
    [Category.Safety]: 'bg-red-100 text-red-800',
    [Category.Other]: 'bg-purple-100 text-purple-800',
};

const TimeAgo = ({ dateString }: { dateString: string }) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const VoteIcon = ({ direction }: { direction: 'up' | 'down' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d={direction === 'up' ? "M10 2a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L11 5.414V15a1 1 0 11-2 0V5.414L5.707 8.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 2z" : "M10 18a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L9 14.586V5a1 1 0 112 0v9.586l3.293-3.293a1 1 0 011.414 1.414l-5 5A1 1 0 0110 18z"} />
    </svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const PostActionsMenu: React.FC<{ onEdit: () => void; onDelete: () => void }> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 100)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500"
                aria-label="Post options"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>
            {isOpen && (
                 <div
                    className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20"
                    onMouseDown={(e) => e.preventDefault()} 
                >
                    <button
                        onClick={onEdit}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Edit Post
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                        Delete Post
                    </button>
                </div>
            )}
        </div>
    );
};

const PostMap: React.FC<{ location: { lat: number; lng: number } }> = ({ location }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any | null>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [location.lat, location.lng],
                zoom: 15,
                zoomControl: false,
                dragging: false,
                touchZoom: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            L.marker([location.lat, location.lng]).addTo(map);
            mapRef.current = map;
        }
    }, [location]);

    return <div ref={mapContainerRef} className="h-full w-full" />;
};


const PostCard: React.FC<PostCardProps> = ({ post, onVote, onEdit, onDelete }) => {
    const { user } = useAuth();
    const userVote = user ? post.votesBy[user.id] : undefined;
    const isAuthor = user && user.id === post.authorId;
    
    const upvoteClasses = `p-1 rounded-full transition-colors ${
        userVote === 1
            ? 'bg-green-100 text-green-600'
            : 'text-gray-500 hover:bg-green-100'
    } disabled:text-gray-300 disabled:hover:bg-transparent`;

    const downvoteClasses = `p-1 rounded-full transition-colors ${
        userVote === -1
            ? 'bg-red-100 text-red-600'
            : 'text-gray-500 hover:bg-red-100'
    } disabled:text-gray-300 disabled:hover:bg-transparent`;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg w-full flex isolate">
            <div className="flex flex-col items-center justify-start space-y-2 bg-gray-50 p-4">
                 <button 
                    onClick={() => onVote(post.id, 1)} 
                    disabled={!user}
                    className={upvoteClasses}
                    aria-label="Upvote"
                    aria-pressed={userVote === 1}
                >
                    <VoteIcon direction="up" />
                </button>
                <span className="text-xl font-bold text-gray-800 w-10 text-center">{post.votes}</span>
                <button 
                    onClick={() => onVote(post.id, -1)} 
                    disabled={!user}
                    className={downvoteClasses}
                    aria-label="Downvote"
                    aria-pressed={userVote === -1}
                >
                    <VoteIcon direction="down" />
                </button>
            </div>
            <div className="p-6 flex-grow flex space-x-6">
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${categoryColors[post.category]}`}>
                                {post.category}
                            </span>
                            <span className="text-sm text-gray-500"><TimeAgo dateString={post.created_at} /></span>
                        </div>
                    {isAuthor && <PostActionsMenu onEdit={() => onEdit(post)} onDelete={() => onDelete(post.id)} />}
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold text-vov-rust uppercase">The Problem</p>
                        <h3 className="text-xl font-bold text-gray-900 mt-1">{post.problem}</h3>
                        {post.address && (
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                <MapPinIcon />
                                <span>{post.address}</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold text-vov-cyan uppercase">Proposed Solution</p>
                        <p className="mt-1 text-gray-600">{post.solution}</p>
                    </div>
                    <div className="mt-4 border-t pt-2 text-right">
                        <p className="text-xs text-gray-500">Proposed by: {post.authorEmail}</p>
                    </div>
                </div>
                {post.location && (
                    <div className="w-2/5 flex-shrink-0 rounded-lg overflow-hidden my-auto h-48">
                        <PostMap location={post.location} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;