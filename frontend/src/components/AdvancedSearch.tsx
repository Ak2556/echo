'use client';

import React, { useState, useEffect } from 'react';

interface SearchResults {
  users?: any[];
  posts?: any[];
  files?: any[];
}

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState<SearchResults>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      fetchAutocomplete();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchAutocomplete = async () => {
    try {
      const url = new URL('/api/search/autocomplete', window.location.origin);
      url.searchParams.set('q', query);
      const response = await fetch(url.toString());
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {}
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const url = new URL('/api/search/search', window.location.origin);
      url.searchParams.set('q', query);
      url.searchParams.set('search_type', searchType);
      const response = await fetch(url.toString());
      const data = await response.json();
      setResults(data.results || {});
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Advanced Search</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, posts, files..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All</option>
            <option value="users">Users</option>
            <option value="posts">Posts</option>
            <option value="files">Files</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="bg-white border rounded-lg shadow-lg p-2">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setQuery(suggestion.text)}
              >
                <span className="text-xs text-gray-500 mr-2">
                  {suggestion.type}
                </span>
                {suggestion.text}
              </div>
            ))}
          </div>
        )}
      </form>

      <div className="space-y-6">
        {results.users && results.users.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Users</h3>
            <div className="space-y-2">
              {results.users.map((user: any) => (
                <div key={user.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.posts && results.posts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Posts</h3>
            <div className="space-y-2">
              {results.posts.map((post: any) => (
                <div key={post.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-600">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.files && results.files.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Files</h3>
            <div className="space-y-2">
              {results.files.map((file: any) => (
                <div key={file.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-600">{file.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
