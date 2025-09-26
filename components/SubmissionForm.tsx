import React, { useState, useEffect, useRef } from 'react';
import { Category, Post } from '../types';

declare var L: any;

interface SubmissionFormProps {
    onSubmit: (problem: string, solution: string, category: Category, address: string, location: { lat: number, lng: number } | null) => Promise<void>;
    onClose: () => void;
    postToEdit?: Post | null;
}

const MapPicker: React.FC<{ value: { lat: number, lng: number } | null, onChange: (location: { lat: number, lng: number } | null) => void }> = ({ value, onChange }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any | null>(null);
    const markerRef = useRef<any | null>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current).setView([48.4284, -123.3656], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            map.on('click', (e: any) => {
                onChange(e.latlng);
            });

            mapRef.current = map;

            if (value) {
                 markerRef.current = L.marker(value).addTo(map);
                 map.setView(value, 15);
            }
        }
    }, []); // Run only once

    useEffect(() => {
        if (mapRef.current) {
            if (value && !markerRef.current) {
                markerRef.current = L.marker(value).addTo(mapRef.current);
            } else if (value && markerRef.current) {
                markerRef.current.setLatLng(value);
            } else if (!value && markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
        }
    }, [value]);

    return (
        <div>
            <div ref={mapContainerRef} className="h-64 w-full rounded-md" />
            {value && (
                <button type="button" onClick={() => onChange(null)} className="text-xs text-red-500 mt-2 hover:underline">
                    Remove Pin
                </button>
            )}
        </div>
    );
};

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, onClose, postToEdit }) => {
    const [problem, setProblem] = useState('');
    const [solution, setSolution] = useState('');
    const [category, setCategory] = useState<Category>(Category.Other);
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!postToEdit;

    useEffect(() => {
        if (isEditing) {
            setProblem(postToEdit.problem);
            setSolution(postToEdit.solution);
            setCategory(postToEdit.category);
            setAddress(postToEdit.address || '');
            setLocation(postToEdit.location || null);
        }
    }, [postToEdit, isEditing]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!problem.trim() || !solution.trim()) {
            setError('Problem and Solution fields are required.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await onSubmit(problem, solution, category, address, location);
            onClose();
        } catch (err) {
            setError('Failed to submit post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit Proposal' : 'Submit a New Proposal'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="problem" className="block text-sm font-medium text-gray-700">The Problem</label>
                        <input
                            id="problem"
                            type="text"
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-vov-cyan focus:border-vov-cyan"
                            placeholder="e.g., Lack of crosswalks on Elm Street"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="solution" className="block text-sm font-medium text-gray-700">Proposed Solution</label>
                        <textarea
                            id="solution"
                            value={solution}
                            onChange={(e) => setSolution(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-vov-cyan focus:border-vov-cyan"
                            placeholder="e.g., Install two high-visibility painted crosswalks with pedestrian-activated signals."
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-vov-cyan focus:border-vov-cyan"
                        >
                            {Object.values(Category).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-vov-cyan focus:border-vov-cyan"
                            placeholder="e.g., 1234 Fort Street"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Pin on Map (Optional)</label>
                        <p className="text-xs text-gray-500 mb-2">Click on the map to pinpoint the problem's location.</p>
                        <MapPicker value={location} onChange={setLocation} />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-vov-blue hover:bg-vov-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vov-blue disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Submitting...' : (isEditing ? 'Save Changes' : 'Submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmissionForm;