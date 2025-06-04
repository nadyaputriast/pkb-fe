import React from "react";
import ReactMarkdown from "react-markdown";
import { ClockIcon, TrashIcon } from "@heroicons/react/16/solid";

export default function Section1({
  query,
  setQuery,
  handleKeyUp,
  handleSearch,
  handleClearHistory,
  loading,
  history,
  showHistory,
  setShowHistory,
  error,
  result,
  setSelectedMovie,
  setShowModal,
}) {
  return (
    <div className="p-6 w-full bg-gray-800 rounded-lg shadow-lg mb-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">
        Movie Recommendation Engine
      </h1>
      <div className="flex items-center relative w-full mb-4">
        <input
          type="text"
          className="border border-gray-700 bg-gray-700 text-white p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your preferences here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyUp={handleKeyUp}
          onFocus={() => setShowHistory(false)}
        />
        <div
          className="ml-2 cursor-pointer relative"
          onClick={() => setShowHistory(!showHistory)}
        >
          <ClockIcon className="w-7 h-6 text-gray-400" />
          {showHistory && Array.isArray(history) && (
            <ul className="absolute right-0 top-9 bg-gray-800 border border-gray-700 w-64 mt-2 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
              {history.length === 0 ? (
                <li className="p-2 text-gray-400">No History Available</li>
              ) : (
                <>
                  {history.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-700 cursor-pointer text-white"
                    >
                      <span
                        onClick={() => {
                          setQuery(item);
                          handleSearch(item);
                          setShowHistory(false);
                        }}
                        className="flex-1"
                      >
                        {item}
                      </span>
                      {index === 0 && (
                        <button
                          title="Clear History"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearHistory();
                          }}
                          className="ml-2 p-1 rounded hover:bg-red-700 transition"
                        >
                          <TrashIcon className="w-5 h-5 text-red-400" />
                        </button>
                      )}
                    </li>
                  ))}
                </>
              )}
            </ul>
          )}
        </div>
      </div>
      {/* Tombol Clear History di bawah input/history dihapus, karena sudah ada di list */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        onClick={() => handleSearch(query)}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Recommendation"}
      </button>
      {error && <div className="mt-4 text-red-400 text-center">{error}</div>}
      {loading && (
        <div className="mt-6 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-2">Fetching Recommendation...</p>
        </div>
      )}
      {result &&
        !loading &&
        Array.isArray(result.similar_movies) &&
        result.similar_movies.length > 0 && (
          <div className="mt-6">
            <div className="movie-recommendation">
              <h2 className="text-xl font-semibold mb-2 text-white">
                LLM Movie Recommendation
              </h2>
              <ReactMarkdown className="prose prose-invert">
                {result.recommendation}
              </ReactMarkdown>
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-6 text-white">
              Top Movies:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {result.similar_movies
                .filter((movie) => movie.vote_average > 0)
                .map((movie, index) => (
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
                        {movie.release_date?.split("-")[0]}
                      </p>
                      <p className="text-sm text-gray-200 mt-2">
                        {movie.overview.length > 100
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
          </div>
        )}
    </div>
  );
}
