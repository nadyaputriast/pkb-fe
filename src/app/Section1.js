import React from "react";
import { ClockIcon, TrashIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";

export default function Section1({
  query,
  setQuery,
  handleKeyUp,
  handleSearch,
  loading,
  history,
  showHistory,
  setShowHistory,
  error,
  result,
  setSelectedMovie,
  setShowModal,
  handleClearHistory,
  handleDeleteHistoryItem,
  watchlist,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
}) {
  // Helper function to check if movie is in watchlist
  const isInWatchlist = (movie) => {
    return watchlist.some(
      (m) =>
        (m.id && movie.id && m.id === movie.id) ||
        (!m.id && !movie.id && m.title === movie.title)
    );
  };

  return (
    <div className="p-6 w-full glass-effect mb-8 fade-in">
      <h1 className="text-2xl font-bold mb-8 text-center gradient-text">
        Movie Recommendation Engine
      </h1>

      {/* Search Bar */}
      <div className="flex items-center relative w-full mb-4">
        <input
          type="text"
          className="input-field w-full"
          placeholder="Describe your perfect movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={handleKeyUp}
          onFocus={() => setShowHistory(false)}
        />
        <button
          className="btn-primary ml-2"
          onClick={() => handleSearch(query)}
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
        <div
          className="ml-2 cursor-pointer relative"
          onClick={() => setShowHistory(!showHistory)}
        >
          <ClockIcon className="w-7 h-6 text-gray-400 hover:text-rose-cream transition-colors duration-300" />
          {showHistory && (
            <ul className="absolute right-0 top-9 glass-effect w-64 mt-2 shadow-lg z-10 max-h-40 overflow-y-auto">
              {history?.length === 0 ? (
                <li className="p-2 text-gray-400">No History Available</li>
              ) : (
                <>
                  {history.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-white hover:bg-opacity-20 text-gray-700 cursor-pointer transition-all duration-200"
                    >
                      <span
                        className="flex-1"
                        onClick={() => {
                          setQuery(item);
                          handleSearch(item);
                          setShowHistory(false);
                        }}
                      >
                        {item}
                      </span>
                      <button
                        title="Delete history"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryItem(item);
                        }}
                        className="ml-2 p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-all duration-200"
                      >
                        <TrashIcon className="w-5 h-5 text-red-400" />
                      </button>
                    </li>
                  ))}
                  {history.length > 1 && (
                    <li className="flex justify-center mt-2">
                      <button
                        className="text-xs text-red-400 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearHistory();
                        }}
                      >
                        Clear All History
                      </button>
                    </li>
                  )}
                </>
              )}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 text-red-400 text-center font-medium">{error}</div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="mt-6 text-center slide-up">
          <div className="loading-spinner mx-auto"></div>
          <p className="text-gray-500 mt-2">Fetching Recommendation...</p>
        </div>
      )}

      {/* Recommendation Text */}
      {result?.recommendation && (
        <div className="mt-6 fade-in">
          <div className="movie-recommendation card mb-6">
            <h2 className="text-xl font-semibold mb-2 gradient-text">
              AI Movie Recommendation
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ReactMarkdown className="prose prose-sm max-w-none text-gray-700">
                {result.recommendation}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Movie Cards */}
      {result?.similar_movies?.length > 0 && (
        <div className="mt-6 fade-in">
          <h3 className="text-lg font-semibold mt-4 mb-6 text-gray-700">
            Top Recommendations:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {result.similar_movies
              .filter((movie) => movie.vote_average > 0)
              .map((movie) => {
                const movieInWatchlist = isInWatchlist(movie);

                return (
                  <div
                    key={movie.id || movie.title}
                    className="movie-card group"
                  >
                    <div className="relative">
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "/placeholder-movie.png"
                        }
                        alt={`${movie.title} poster`}
                        className="w-full h-64 object-cover rounded-t-lg cursor-pointer"
                        onClick={() => {
                          setSelectedMovie(movie);
                          setShowModal(true);
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder-movie.png";
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          movieInWatchlist
                            ? handleRemoveFromWatchlist(movie)
                            : handleAddToWatchlist(movie);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm z-10 group ${
                          movieInWatchlist
                            ? "bg-green-500/80 text-white hover:bg-green-600/90"
                            : "bg-blue-500/80 text-white hover:bg-blue-600/90"
                        } transition-all duration-200`}
                        aria-label={
                          movieInWatchlist
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                        }
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {movieInWatchlist
                              ? "Remove from Watchlist"
                              : "Add to Watchlist"}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
                        </div>

                        {movieInWatchlist ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
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
                      <p className="text-sm text-gray-700 mt-2">
                        {movie.overview?.length > 100
                          ? `${movie.overview.substring(0, 100)}...`
                          : movie.overview}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>⭐ {movie.vote_average?.toFixed(1)}/10</span>
                        <span>{movie.vote_count} votes</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
