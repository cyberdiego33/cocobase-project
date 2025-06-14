import React, { useState, useEffect } from "react";
import db from "../utils/cocbase";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Smile,
  Meh,
  Frown,
  Heart,
  Sun,
  Cloud,
  Loader,
  MoreVertical,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DailyJournal = ({ isPublic = true }) => {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({ text: "", mood: "happy" });
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const entriesPerPage = 3;

  const moodEmojis = {
    happy: {
      icon: Smile,
      color: "text-green-500",
      bg: "bg-green-50",
      label: "Happy",
    },
    neutral: {
      icon: Meh,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      label: "Neutral",
    },
    sad: {
      icon: Frown,
      color: "text-blue-500",
      bg: "bg-blue-50",
      label: "Sad",
    },
    excited: {
      icon: Sun,
      color: "text-orange-500",
      bg: "bg-orange-50",
      label: "Excited",
    },
    grateful: {
      icon: Heart,
      color: "text-pink-500",
      bg: "bg-pink-50",
      label: "Grateful",
    },
  };

  const navigate = useNavigate();

  // Auth check on mount
  useEffect(() => {
    db.getCurrentUser()
      .then((u) => {
        setUser(u);
        setIsAuthenticated(!!u);
      })
      .catch(() => {
        setUser(null);
        setIsAuthenticated(false);
      });
  }, []);

  // Fetch entries with filtering
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const allEntries = await db.listDocuments("journal-entries");
      let filtered = allEntries;
      if (isPublic) {
        // Only show public entries that are not private (no userId or userId is null/empty)
        filtered = allEntries.filter(
          (entry) =>
            entry.data.published === true &&
            (!entry.data.userId ||
              entry.data.userId === null ||
              entry.data.userId === "")
        );
      } else if (user) {
        filtered = allEntries.filter((entry) => entry.data.userId === user.id);
      } else {
        filtered = [];
      }
      const sortedEntries = filtered.sort((a, b) => {
        const dateA = new Date(a.data.timestamp || a.created_at);
        const dateB = new Date(b.data.timestamp || b.created_at);
        return dateB - dateA;
      });
      setEntries(sortedEntries);
    } catch (error) {
      // Optionally log error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line
  }, [user, isPublic]);

  const filteredEntries = entries.filter((entry) => {
    const matchesDate = !selectedDate || entry.data.date === selectedDate;
    const matchesSearch =
      !searchTerm ||
      entry.data.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleAddEntry = async () => {
    if (newEntry.text.trim()) {
      try {
        setSubmitting(true);
        const entryData = {
          title: `Journal Entry - ${new Date().toLocaleDateString()}`, // Add required title field
          content: newEntry.text, // Use 'content' instead of 'text'
          mood: newEntry.mood,
          date: new Date().toISOString().split("T")[0],
          timestamp: new Date().toISOString(),
          published: true,
          userId: user?.id,
          userEmail: user?.email,
        };

        const savedEntry = await db.createDocument(
          "journal-entries",
          entryData
        );
        setEntries([savedEntry, ...entries]);
        setNewEntry({ text: "", mood: "happy" });
        setShowAddForm(false);
      } catch (error) {
        alert("Failed to save entry. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Function to delete an entry by id, with loading effect
  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await db.deleteDocument("journal-entries", id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      setOpenMenuId(null); // Close menu after delete
    } catch (error) {
      alert("Failed to remove entry.");
    } finally {
      setRemovingId(null);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    if (!date) return "Invalid Date";
    try {
      const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      return formattedDate;
    } catch (error) {
      return "Invalid Date";
    }
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (
        !e.target.closest("#auth-dropdown-btn") &&
        !e.target.closest("#auth-dropdown-menu")
      ) {
        setShowAuthDropdown(false);
      }
    };
    if (showAuthDropdown) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAuthDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Daily Journal
          </h1>
          <p className="text-gray-600 text-lg">
            Capture your thoughts, track your moods
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex gap-4 items-center relative">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              disabled={isPublic && !isAuthenticated}
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
            {/* My Entries Button with Dropdown */}
            <div className="relative">
              <button
                id="auth-dropdown-btn"
                onClick={() => setShowAuthDropdown((v) => !v)}
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none"
              >
                <UserCircle className="w-5 h-5" />
                My Entries
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showAuthDropdown ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {/* Dropdown menu */}
              <div
                id="auth-dropdown-menu"
                className={`absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden transition-all duration-300 ${
                  showAuthDropdown
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }`}
                style={{ pointerEvents: showAuthDropdown ? "auto" : "none" }}
              >
                {!isAuthenticated ? (
                  <>
                    <button
                      className="w-full text-left px-6 py-3 text-gray-800 hover:bg-blue-50 transition-all duration-200 font-medium text-base"
                      onClick={() => {
                        setShowAuthDropdown(false);
                        navigate("/auth");
                      }}
                    >
                      Create an Account
                    </button>
                    <button
                      className="w-full text-left px-6 py-3 text-gray-800 hover:bg-blue-50 transition-all duration-200 font-medium text-base border-t border-gray-100"
                      onClick={() => {
                        setShowAuthDropdown(false);
                        navigate("/auth");
                      }}
                    >
                      Sign In to Your Account
                    </button>
                  </>
                ) : (
                  <button
                    className="w-full text-left px-6 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 font-medium text-base"
                    onClick={async () => {
                      await db.logout();
                      setUser(null);
                      setIsAuthenticated(false);
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20 animate-in slide-in-from-top duration-300">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              How was your day?
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your thoughts
              </label>
              <textarea
                value={newEntry.text}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, text: e.target.value })
                }
                placeholder="Write about your day..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none h-32 bg-white/70"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling?
              </label>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(moodEmojis).map(([mood, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <button
                      key={mood}
                      onClick={() => setNewEntry({ ...newEntry, mood })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        newEntry.mood === mood
                          ? `${config.bg} ${config.color} ring-2 ring-current ring-opacity-30 scale-105`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddEntry}
                disabled={submitting} // new entry
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewEntry({ text: "", mood: "happy" });
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-6 mb-8">
          {/* new entry  */}
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 text-lg">Loading your entries...</p>
            </div>
          ) : paginatedEntries.length === 0 ? (
            <div className="text-center py-12">
              <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No entries found</p>
              <p className="text-gray-400">
                Try adjusting your search or date filter
              </p>
            </div>
          ) : (
            paginatedEntries.map((entry, index) => {
              const moodConfig =
                moodEmojis[entry.data.mood] || moodEmojis.neutral;
              const IconComponent = moodConfig.icon;

              return (
                <div
                  key={entry.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-in slide-in-from-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${moodConfig.bg}`}>
                        <IconComponent
                          className={`w-5 h-5 ${moodConfig.color}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {formatDate(entry.data.date)}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(entry.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${moodConfig.bg} ${moodConfig.color}`}
                      >
                        {moodConfig.label}
                      </span>
                      {/* 3-dot menu icon to the right of the mood label */}
                      <div className="relative">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === entry.id ? null : entry.id
                            )
                          }
                          aria-label="Open menu"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {/* Remove button dropdown */}
                        {openMenuId === entry.id && (
                          <div className="absolute z-10 right-0 mt-2 w-24 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col items-stretch">
                            <button
                              className="px-4 py-2 text-red-600 hover:bg-red-50 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                              onClick={() => handleRemove(entry.id)}
                              disabled={removingId === entry.id}
                            >
                              {removingId === entry.id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : null}
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {entry.data.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-white/80 border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-white/80 border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-white/80 border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyJournal;
