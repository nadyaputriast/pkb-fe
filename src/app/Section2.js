import React from "react";

export default function Section2({
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  filterRating,
  setFilterRating,
  filterVotes,
  setFilterVotes,
  yearOptions,
  monthOptions,
  loadingThisMonth,
  paginatedMovies,
  renderPagination,
  setSelectedMovie,
  setShowModal,
  watchlist,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
}) {
  // Helper function to check if movie is in watchlist
  const isInWatchlist = (movie) => {
    return watchlist.some((m) => {
      // Use movie.id if available, otherwise fallback to title
      if (movie.id && m.id) {
        return m.id === movie.id;
      }
      return m.title === movie.title;
    });
  };

  return (
    <div className="p-6 w-full glass-effect mb-8 fade-in">
      <h2 className="text-xl font-bold mb-4 gradient-text">
        Movies Released This Month
      </h2>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="select-field"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="select-field"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Min Rating"
          className="input-field"
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Min Votes"
          className="input-field"
          value={filterVotes}
          onChange={(e) => setFilterVotes(e.target.value)}
        />

        <button
          className="btn-secondary"
          onClick={() => {
            setFilterRating("");
            setFilterVotes("");
          }}
          type="button"
        >
          Reset Filters
        </button>
      </div>

      {/* Content */}
      {loadingThisMonth ? (
        <div className="text-center slide-up">
          <div className="loading-spinner mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading movies...</p>
        </div>
      ) : paginatedMovies.length === 0 ? (
        <div className="text-center card">
          <p className="text-gray-600">No movies found for selected filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {paginatedMovies.map((movie) => {
              const movieInWatchlist = isInWatchlist(movie);
              
              return (
                <div
                  key={movie.id || movie.title} // Use id if available, otherwise title
                  className="movie-card group"
                  onClick={() => {
                    setSelectedMovie(movie);
                    setShowModal(true);
                  }}
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
                      onError={(e) => {
                        e.target.src = '/placeholder-movie.png';
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (movieInWatchlist) {
                          handleRemoveFromWatchlist(movie);
                        } else {
                          handleAddToWatchlist(movie);
                        }
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm z-10 ${
                        movieInWatchlist
                          ? 'bg-green-500/80 text-white hover:bg-green-600/90'
                          : 'bg-blue-500/80 text-white hover:bg-blue-600/90'
                      } transition-all duration-200`}
                      aria-label={
                        movieInWatchlist
                          ? 'Remove from watchlist'
                          : 'Add to watchlist'
                      }
                    >
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
                  <div className="p-4 cursor-pointer">
                    <h4 className="text-md font-semibold text-gray-800 truncate">
                      {movie.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-0 py-0 my-0">
                      {movie.release_date}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      {movie.overview && movie.overview.length > 100
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

          {/* Pagination */}
          <div className="flex justify-center">
            {renderPagination()}
          </div>
        </>
      )}
    </div>
  );
}