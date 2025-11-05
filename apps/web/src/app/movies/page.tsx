'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '../../lib/api';

interface Movie {
  id: string;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Movie[] }>('/api/movies');
      if (response.success) {
        setMovies(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Movie Catalog</h1>
      
      {loading && <p>Loading movies...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {movies.map((movie) => (
            <Link key={movie.id} href={`/movies/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{movie.title}</h3>
                  {movie.release_date && (
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '0' }}>
                      {new Date(movie.release_date).getFullYear()}
                    </p>
                  )}
                  {movie.vote_average && (
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                      Rating: {movie.vote_average.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && !error && movies.length === 0 && (
        <p>No movies found. Try searching for movies to populate the catalog.</p>
      )}
    </main>
  );
}

