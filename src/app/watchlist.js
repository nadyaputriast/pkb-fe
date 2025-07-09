import React from "react";

export default function SectionWatchlist({
  watchlist,
  handleRemoveFromWatchlist,
  setSelectedMovie,
  setShowModal,
}) {
  if (!watchlist.length) return null;

  return (
    <div className="p-6 w-full glass-effect mb-8 fade-in">
      <h2 className="text-2xl font-bold mb-8 text-center gradient-text">
        My Watchlist
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {watchlist.map((movie) => (
          <div
            key={movie.id || movie.title} // Fallback to title if id doesn't exist
            className="movie-card group relative"
          >
            <div className="relative">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/placeholder-movie.png'
                }
                alt={`${movie.title} poster`}
                className="w-full h-64 object-cover rounded-t-lg cursor-pointer"
                onClick={() => {
                  setSelectedMovie(movie);
                  setShowModal(true);
                }}
                onError={(e) => {
                  e.target.src = '/placeholder-movie.png';
                }}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveFromWatchlist(movie);
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600/90 backdrop-blur-sm transition-all duration-200 z-10"
                aria-label={`Remove ${movie.title} from watchlist`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div 
              className="p-4 cursor-pointer"
              onClick={() => {
                setSelectedMovie(movie);
                setShowModal(true);
              }}
            >
              <h4 className="text-md font-semibold text-gray-800 truncate">
                {movie.title}
              </h4>
              <p className="text-sm text-gray-600 mt-0 py-0 my-0">
                {movie.release_date?.split("-")[0]}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>⭐ {movie.vote_average?.toFixed(1)}/10</span>
                <span>{movie.vote_count} votes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}