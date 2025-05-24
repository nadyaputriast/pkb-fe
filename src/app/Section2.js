import React from "react";

export default function Section2({
  filterYear, setFilterYear,
  filterMonth, setFilterMonth,
  filterRating, setFilterRating,
  filterVotes, setFilterVotes,
  yearOptions, monthOptions,
  loadingThisMonth, paginatedMovies,
  renderPagination, setSelectedMovie, setShowModal
}) {
  return (
    <div className="p-6 w-full bg-gray-800 rounded-lg shadow-lg mb-8">
      <h2 className="text-xl font-bold mb-4 text-white">
        Movies Released This Month
      </h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="border border-gray-700 bg-gray-700 text-white p-2 rounded"
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
          className="border border-gray-700 bg-gray-700 text-white p-2 rounded"
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
          className="border border-gray-700 bg-gray-700 text-white p-2 rounded"
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
        />
        <input
          type="number"
          min="0"
          placeholder="Min Votes"
          className="border border-gray-700 bg-gray-700 text-white p-2 rounded"
          value={filterVotes}
          onChange={(e) => setFilterVotes(e.target.value)}
        />
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          onClick={() => {
            setFilterRating("");
            setFilterVotes("");
          }}
          type="button"
        >
          Reset Filter
        </button>
      </div>
      {loadingThisMonth ? (
        <div className="text-gray-400">Loading...</div>
      ) : paginatedMovies.length === 0 ? (
        <div className="text-gray-400">No movies found for this filter.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedMovies.map((movie, index) => (
              <div
                key={index}
                className="bg-gray-700 shadow-md rounded-lg overflow-hidden border border-gray-600 cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                onClick={() => {
                  setSelectedMovie(movie);
                  setShowModal(true);
                }}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} poster`}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-md font-semibold text-white truncate">
                    {movie.title}
                  </h4>
                  <p className="text-sm text-gray-300 mt-0 py-0 my-0">
                    {movie.release_date}
                  </p>
                  <p className="text-sm text-gray-200 mt-2">
                    {movie.overview && movie.overview.length > 100
                      ? `${movie.overview.substring(0, 100)}...`
                      : movie.overview}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                    <span>Rating: {movie.vote_average}/10</span>
                    <span>{movie.vote_count} Votes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}