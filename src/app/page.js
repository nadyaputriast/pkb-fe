"use client";
import { useState, useEffect, useMemo } from "react";
import Section1 from "./Section1";
import Section2 from "./Section2";

export default function Home() {
  // State & logic utama
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [filterVotes, setFilterVotes] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loadingThisMonth, setLoadingThisMonth] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(12);

  // Section 1
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // === Perubahan utama: deletedHistory di localStorage ===
  const [deletedHistory, setDeletedHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deletedHistory");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("deletedHistory", JSON.stringify(deletedHistory));
    }
  }, [deletedHistory]);

  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Set default tahun & bulan di client
  useEffect(() => {
    const now = new Date();
    setFilterYear(now.getFullYear().toString());
    setFilterMonth(String(now.getMonth() + 1).padStart(2, "0"));
  }, []);

  // Responsive: set moviesPerPage sesuai device
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) setMoviesPerPage(4); // phone
      else if (window.innerWidth < 1024) setMoviesPerPage(12); // tablet
      else setMoviesPerPage(16); // desktop
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset ke page 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterYear, filterMonth, filterRating, filterVotes]);

  // Ambil history dari backend setiap kali showHistory dibuka atau setelah search
  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, deletedHistory]); // depend on deletedHistory

  // Ambil history dari backend saat pertama kali load
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  // Fungsi untuk fetch history dari backend
  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      // Filter history yang sudah dihapus di UI
      setHistory(data.filter((q) => !deletedHistory.includes(q)));
    } catch (error) {
      setHistory([]);
    }
  };

  // Ambil film sesuai filter tahun & bulan
  useEffect(() => {
    if (!filterYear || !filterMonth) return;
    const fetchMovies = async () => {
      setLoadingThisMonth(true);
      try {
        const response = await fetch(
          `http://localhost:5001/api/movies?year=${filterYear}&month=${filterMonth}`
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

  // Filter & sort hasil fetch sesuai filter rating, votes, dan urut tanggal
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
          // Urutkan dari tanggal 1 ke akhir bulan
          const ad = a.release_date
            ? parseInt(a.release_date.split("-")[2])
            : 0;
          const bd = b.release_date
            ? parseInt(b.release_date.split("-")[2])
            : 0;
          return ad - bd;
        }),
    [filteredMovies, filterRating, filterVotes]
  );

  // PAGINATION LOGIC
  const totalPages = Math.ceil(moviesToShow.length / moviesPerPage);
  const paginatedMovies = moviesToShow.slice(
    (currentPage - 1) * moviesPerPage,
    currentPage * moviesPerPage
  );

  // Helper: generate tahun dan bulan untuk dropdown (SSR-safe)
  const yearOptions = useMemo(() => {
    const arr = [];
    const nowYear =
      typeof window !== "undefined" ? new Date().getFullYear() : 2025;
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

  // Modal detail movie
  const MovieModal = () =>
    showModal &&
    selectedMovie && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative text-white">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
              alt={`${selectedMovie.title} poster`}
              className="w-full sm:w-40 h-60 object-cover rounded"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{selectedMovie.title}</h2>
              <p className="mb-2 text-gray-300">{selectedMovie.overview}</p>
              <ul className="text-sm text-gray-200 space-y-1">
                <li>
                  <strong>Release Date:</strong> {selectedMovie.release_date}
                </li>
                <li>
                  <strong>Genres:</strong>{" "}
                  {Array.isArray(selectedMovie.genre_name)
                    ? selectedMovie.genre_name.join(", ")
                    : selectedMovie.genre_name}
                </li>
                <li>
                  <strong>Rating:</strong> {selectedMovie.vote_average}/10
                </li>
                <li>
                  <strong>Vote Count:</strong> {selectedMovie.vote_count}
                </li>
                {selectedMovie.runtime && (
                  <li>
                    <strong>Duration:</strong> {selectedMovie.runtime} min
                  </li>
                )}
                {Object.entries(selectedMovie).map(
                  ([key, value]) =>
                    ![
                      "title",
                      "overview",
                      "poster_path",
                      "release_date",
                      "genre_name",
                      "vote_average",
                      "vote_count",
                      "runtime",
                    ].includes(key) && (
                      <li key={key}>
                        <strong>{key}:</strong>{" "}
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : value}
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );

  // PAGINATION BUTTONS
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Back
        </button>
        {pageNumbers.map((num) => (
          <button
            key={num}
            className={`px-3 py-1 rounded ${
              num === currentPage
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-white hover:bg-blue-500"
            }`}
            onClick={() => setCurrentPage(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-blue-600 disabled:opacity-50"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  // Fungsi handleSearch untuk Section1
  const handleSearch = async (q) => {
    if (!q || q.trim() === "") {
      setError("Please enter a search query");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch("http://localhost:5001/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response from server");
      }
      if (!response.ok) {
        throw new Error(
          (data && data.error) ||
            (typeof data === "string" ? data : JSON.stringify(data)) ||
            "Failed to fetch recommendation"
        );
      }
      if (!data.similar_movies || !Array.isArray(data.similar_movies)) {
        throw new Error("Invalid response format from server");
      }
      setResult(data);

      // Jika prompt yang dihapus di-search lagi, hapus dari deletedHistory
      setDeletedHistory((prev) => prev.filter((item) => item !== q.trim()));
      fetchHistory();
    } catch (error) {
      setError(
        error.message || "Failed to fetch recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fungsi handleKeyUp untuk Section1
  const handleKeyUp = (event) => {
    if (event.key === "Enter") {
      handleSearch(query);
    }
  };

  // Fungsi hapus history untuk Section1 (hapus satu query saja)
  const handleDeleteHistoryItem = (q) => {
    setDeletedHistory((prev) => {
      const updated = [...prev, q];
      if (typeof window !== "undefined") {
        localStorage.setItem("deletedHistory", JSON.stringify(updated));
      }
      return updated;
    });
    setHistory((prev) => prev.filter((item) => item !== q));
  };

  // Fungsi hapus semua history (opsional, jika ada tombol clear all)
  const handleClearHistory = async () => {
    setDeletedHistory((prev) => {
      const updated = [...prev, ...history];
      if (typeof window !== "undefined") {
        localStorage.setItem("deletedHistory", JSON.stringify(updated));
      }
      return updated;
    });
    setHistory([]);
    setShowHistory(false);
  };

  // Jangan render sebelum tahun/bulan siap (SSR-safe)
  if (!filterYear || !filterMonth) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 grid grid-rows-[20px_1fr_20px] items-center justify-items-center px-2 pb-20 sm:px-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
        <Section1
          query={query}
          setQuery={setQuery}
          handleKeyUp={handleKeyUp}
          handleSearch={handleSearch}
          loading={loading}
          history={history}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          error={error}
          result={result}
          setSelectedMovie={setSelectedMovie}
          setShowModal={setShowModal}
          handleClearHistory={handleClearHistory}
          handleDeleteHistoryItem={handleDeleteHistoryItem}
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
        />
        <MovieModal />
      </main>
    </div>
  );
}