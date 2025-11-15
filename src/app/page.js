"use client";
import { useState, useEffect, useMemo } from "react";
import Section1 from "./Section1";
import Section2 from "./Section2";
import SectionWatchlist from "./watchlist";

export default function Home() {
  // --- STATE ---
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [filterVotes, setFilterVotes] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loadingThisMonth, setLoadingThisMonth] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(12);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localHistory, setLocalHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // SSR-safe: initialize empty, fill from localStorage in useEffect
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- EFFECTS ---

  // Load history dari localStorage saja
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDeleted = localStorage.getItem("deletedHistory");
      if (savedDeleted) setDeletedHistory(JSON.parse(savedDeleted));
      
      const savedWatchlist = localStorage.getItem("watchlist");
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
      
      // Ambil history dari localStorage
      const savedHistory = localStorage.getItem("searchHistory");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setLocalHistory(parsedHistory);
      }
    }
  }, []);

  // Sync localHistory ke localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("searchHistory", JSON.stringify(localHistory));
    }
  }, [localHistory]);

  // Update deletedHistory effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("deletedHistory", JSON.stringify(deletedHistory));
      setLocalHistory(prev => prev.filter(item => !deletedHistory.includes(item)));
    }
  }, [deletedHistory]);

  useEffect(() => {
    const now = new Date();
    setFilterYear(now.getFullYear().toString());
    setFilterMonth(String(now.getMonth() + 1).padStart(2, "0"));
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) setMoviesPerPage(4);
      else if (window.innerWidth < 1024) setMoviesPerPage(12);
      else setMoviesPerPage(16);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterYear, filterMonth, filterRating, filterVotes]);

  useEffect(() => {
    if (!filterYear || !filterMonth) return;
    const fetchMovies = async () => {
      setLoadingThisMonth(true);
      try {
        const response = await fetch(
          `https://nadyaputriast-pkb-be-movie.hf.space/api/movies?year=${filterYear}&month=${filterMonth}`
        );
        const data = await response.json();
        setFilteredMovies(data);
      } catch {
        setFilteredMovies([]);
      } finally {
        setLoadingThisMonth(false);
      }
    };
    fetchMovies();
  }, [filterYear, filterMonth]);

  // --- MEMOIZED DATA ---

  const moviesToShow = useMemo(
    () =>
      filteredMovies
        .filter((m) =>
          filterRating
            ? m.vote_average && m.vote_average >= parseFloat(filterRating)
            : true
        )
        .filter((m) =>
          filterVotes
            ? m.vote_count && m.vote_count >= parseInt(filterVotes)
            : true
        )
        .sort((a, b) => {
          const ad = a.release_date ? parseInt(a.release_date.split("-")[2]) : 0;
          const bd = b.release_date ? parseInt(b.release_date.split("-")[2]) : 0;
          return ad - bd;
        }),
    [filteredMovies, filterRating, filterVotes]
  );

  const totalPages = Math.ceil(moviesToShow.length / moviesPerPage);
  const paginatedMovies = moviesToShow.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  const yearOptions = useMemo(() => {
    const arr = [];
    const nowYear = typeof window !== "undefined" ? new Date().getFullYear() : 2025;
    for (let y = nowYear; y >= 1980; y--) arr.push(y.toString());
    return arr;
  }, []);

  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // --- HANDLERS ---

  const handleAddToWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.some(m => 
        (m.id && movie.id && m.id === movie.id) || 
        (!m.id && !movie.id && m.title === movie.title)
      );
      return exists ? prev : [...prev, movie];
    });
  };

  const handleRemoveFromWatchlist = (movie) => {
    setWatchlist((prev) => 
      prev.filter(m => 
        !((m.id && movie.id && m.id === movie.id) || 
        (!m.id && !movie.id && m.title === movie.title))
      )
    );
  };

  const handleSearch = async (q) => {
    if (!q || q.trim() === "") {
      setError("Please enter a search query");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await fetch("https://nadyaputriast-pkb-be-movie.hf.space/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });
      let data = await response.json();
      if (!response.ok || !data.similar_movies) {
        throw new Error("Invalid response from server");
      }
      setResult(data);
      
      // Tambah ke history lokal (bukan ambil dari API)
      setLocalHistory(prev => {
        const trimmedQuery = q.trim();
        if (!prev.includes(trimmedQuery)) {
          const newHistory = [trimmedQuery, ...prev.slice(0, 9)]; // Max 10 items
          return newHistory;
        }
        return prev;
      });
      
      // Hapus dari deletedHistory jika ada
      setDeletedHistory(prev => prev.filter(item => item !== q.trim()));
      
    } catch (error) {
      setError(error.message || "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === "Enter") {
      handleSearch(query);
    }
  };

  const handleDeleteHistoryItem = (q) => {
    // Hapus dari history lokal
    setLocalHistory(prev => prev.filter(item => item !== q));
    // Tambah ke deletedHistory
    setDeletedHistory(prev => [...prev, q]);
  };

  const handleClearHistory = () => {
    // Clear history lokal
    setLocalHistory([]);
    // Pindah semua ke deletedHistory  
    setDeletedHistory(prev => [...prev, ...localHistory]);
    setShowHistory(false);
  };

  // --- PAGINATION RENDER ---

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
        <button
          className="pagination-btn flex items-center gap-2"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`pagination-btn ${
              page === currentPage ? "active" : ""
            } ${page === "..." ? "cursor-default" : ""}`}
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={page === "..."}
          >
            {page}
          </button>
        ))}
        
        <button
          className="pagination-btn flex items-center gap-2"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  // --- MODAL ---
  const MovieModal = () => {
    if (!showModal || !selectedMovie) return null;
    
    const isInWatchlist = watchlist.some(m => 
      (m.id && selectedMovie.id && m.id === selectedMovie.id) || 
      (!m.id && !selectedMovie.id && m.title === selectedMovie.title)
    );
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ overflow: 'hidden' }}>
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setShowModal(false)}
        ></div>
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden z-10">
          <button
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition-all duration-200 hover:scale-110 border border-white/30 shadow-lg"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="overflow-y-auto max-h-[90vh]" style={{ scrollBehavior: 'smooth' }}>
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/3 relative">
                <div className="aspect-[2/3] lg:aspect-auto lg:h-full">
                  <img
                    src={selectedMovie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                      : '/placeholder-movie.png'
                    }
                    alt={`${selectedMovie.title} poster`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-movie.png';
                    }}
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
                
                <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                  <h1 className="text-2xl font-bold text-white mb-2">{selectedMovie.title}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      ⭐ {selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/3 flex flex-col">
                <div className="p-6 lg:p-8 space-y-6 flex-grow">
                  <div className="hidden lg:block">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedMovie.title}</h1>
                    {selectedMovie.original_title && selectedMovie.original_title !== selectedMovie.title && (
                      <p className="text-lg text-gray-500 mb-4">({selectedMovie.original_title})</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg">
                      <span className="text-amber-500 text-sm">⭐</span>
                      <span className="text-sm font-bold text-gray-900 ml-1">
                        {selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-gray-500 text-sm">/10</span>
                    </div>
                    
                    <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg">
                      <svg className="w-4 h-4 text-gray-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 font-medium text-sm">
                        {selectedMovie.vote_count ? selectedMovie.vote_count.toLocaleString() : 0} votes
                      </span>
                    </div>
                  </div>

                  {selectedMovie.overview && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedMovie.overview}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Release Date</h4>
                          <p className="text-gray-600">
                            {selectedMovie.release_date 
                              ? new Date(selectedMovie.release_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'TBA'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Popularity</h4>
                          <p className="text-gray-600">
                            {selectedMovie.popularity ? selectedMovie.popularity.toFixed(1) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-2">Genre</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedMovie.genre_name ? (
                            Array.isArray(selectedMovie.genre_name) ? (
                              selectedMovie.genre_name.map((genre, index) => (
                                <span key={index} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                                  {genre}
                                </span>
                              ))
                            ) : (
                              <span className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                                {selectedMovie.genre_name}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500 text-sm">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedMovie.runtime && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Duration</h4>
                          <p className="text-gray-600">
                            {Math.floor(selectedMovie.runtime / 60)}h {selectedMovie.runtime % 60}m
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {selectedMovie.homepage && (
                      <a
                        href={selectedMovie.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                        </svg>
                        <span>Official Site</span>
                      </a>
                    )}
                    
                    {selectedMovie.imdb_id && (
                      <a
                        href={`https://www.imdb.com/title/${selectedMovie.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2 font-medium text-sm"
                      >
                        <span>IMDb</span>
                      </a>
                    )}
                    
                    <button
                      onClick={() => {
                        const searchQuery = encodeURIComponent(`${selectedMovie.title} ${selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : ''} trailer`);
                        window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-medium text-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>Watch Trailer</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isInWatchlist) {
                          handleRemoveFromWatchlist(selectedMovie);
                        } else {
                          handleAddToWatchlist(selectedMovie);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 font-medium text-sm ${
                        isInWatchlist
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER ---
  if (!filterYear || !filterMonth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="loading-spinner"></div>
          <span className="text-gray-600 font-medium">Loading MoodFlix AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <header className="text-center mb-12 fade-in">
          <h1 className="text-5xl lg:text-5xl font-bold gradient-text mb-4">
            MoodFlix AI
          </h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Discover your perfect movie match with AI-powered recommendations
          </p>
        </header>

        <main className="space-y-12">
          <Section1
            query={query}
            setQuery={setQuery}
            handleKeyUp={handleKeyUp}
            handleSearch={handleSearch}
            loading={loading}
            history={localHistory} // Kirim localHistory, bukan history dari API
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            error={error}
            result={result}
            setSelectedMovie={setSelectedMovie}
            setShowModal={setShowModal}
            handleClearHistory={handleClearHistory}
            handleDeleteHistoryItem={handleDeleteHistoryItem}
            watchlist={watchlist}
            handleAddToWatchlist={handleAddToWatchlist}
            handleRemoveFromWatchlist={handleRemoveFromWatchlist}
          />
          
          <Section2
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterRating={filterRating}
            setFilterRating={setFilterRating}
            filterVotes={filterVotes}
            setFilterVotes={setFilterVotes}
            yearOptions={yearOptions}
            monthOptions={monthOptions}
            loadingThisMonth={loadingThisMonth}
            paginatedMovies={paginatedMovies}
            renderPagination={renderPagination}
            setSelectedMovie={setSelectedMovie}
            setShowModal={setShowModal}
            watchlist={watchlist}
            handleAddToWatchlist={handleAddToWatchlist}
            handleRemoveFromWatchlist={handleRemoveFromWatchlist}
          />

          <SectionWatchlist
            watchlist={watchlist}
            handleRemoveFromWatchlist={handleRemoveFromWatchlist}
            setSelectedMovie={setSelectedMovie}
            setShowModal={setShowModal}
          />

          <MovieModal />
        </main>
      </div>
    </div>
  );
}