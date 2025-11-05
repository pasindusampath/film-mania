'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '../../../lib/api';

interface Movie {
  id: string;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  language?: string;
}

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.id as string;
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ success: boolean; data: Movie }>(`/api/movies/${movieId}`);
      if (response.success) {
        setMovie(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load movie');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <main style={{ padding: '2rem' }}><p>Loading...</p></main>;
  if (error) return <main style={{ padding: '2rem' }}><p style={{ color: 'red' }}>Error: {error}</p></main>;
  if (!movie) return <main style={{ padding: '2rem' }}><p>Movie not found</p></main>;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/movies" style={{ color: '#0070f3', textDecoration: 'none' }}>← Back to Movies</a>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {movie.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            style={{ width: '100%', borderRadius: '8px' }}
          />
        )}
        
        <div>
          <h1 style={{ marginTop: 0 }}>{movie.title}</h1>
          {movie.overview && <p>{movie.overview}</p>}
          
          <div style={{ marginTop: '1.5rem' }}>
            {movie.release_date && (
              <p><strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}</p>
            )}
            {movie.vote_average && (
              <p><strong>Rating:</strong> {movie.vote_average.toFixed(1)} / 10</p>
            )}
            {movie.runtime && (
              <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
            )}
            {movie.language && (
              <p><strong>Language:</strong> {movie.language.toUpperCase()}</p>
            )}
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <button style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer' }}>
              Watch Now (Requires Subscription)
            </button>
          </div>
        </div>
      </div>
      
      {movie.backdrop_path && (
        <img
          src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
          alt={movie.title}
          style={{ width: '100%', borderRadius: '8px', marginTop: '2rem' }}
        />
      )}
    </main>
  );
}

