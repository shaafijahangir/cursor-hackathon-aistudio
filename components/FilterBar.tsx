
import React from 'react';
import { Category, SortOrder } from '../types';

interface FilterBarProps {
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    categoryFilter: Category | 'all';
    setCategoryFilter: (category: Category | 'all') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ sortOrder, setSortOrder, categoryFilter, setCategoryFilter }) => {
    const sortButtonClasses = (order: SortOrder) => 
        `px-4 py-2 text-sm font-medium transition-colors rounded-md ${
            sortOrder === order 
            ? 'bg-vov-blue text-white shadow' 
            : 'text-gray-600 hover:bg-gray-200'
        }`;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">Sort by:</span>
                <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
                    <button onClick={() => setSortOrder('newest')} className={sortButtonClasses('newest')}>
                        Newest
                    </button>
                    <button onClick={() => setSortOrder('votes')} className={sortButtonClasses('votes')}>
                        Most Voted
                    </button>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">Filter:</span>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as Category | 'all')}
                    className="border-gray-300 rounded-md shadow-sm focus:border-vov-cyan focus:ring focus:ring-vov-cyan focus:ring-opacity-50"
                >
                    <option value="all">All Categories</option>
                    {Object.values(Category).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FilterBar;
