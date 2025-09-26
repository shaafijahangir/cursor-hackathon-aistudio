import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignupFormProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onClose, onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await signup(email, password);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to sign up. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            id="email-signup"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-vov-cyan focus:border-vov-cyan"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password-signup"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-vov-cyan focus:border-vov-cyan"
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div className="flex flex-col items-center space-y-4 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-vov-blue hover:bg-vov-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vov-blue disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </button>
                         <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <button type="button" onClick={onSwitchToLogin} className="font-medium text-vov-blue hover:text-vov-cyan">
                                Login
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupForm;