import { useState, useEffect } from "react";
import api from "../services/api";

function InviteMemberModal({ projectId, existingMembers = [], onClose, onMemberAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/auth/users/search?query=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error("User search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddUser = async (user) => {
    setAddingId(user._id);
    try {
      const { data } = await api.put(`/projects/${projectId}/members`, { userId: user._id });
      onMemberAdded(data);
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setAddingId(null);
    }
  };

  const existingIds = new Set(existingMembers.map((m) => m._id || m));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="animate-pop relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
        >
          ✕
        </button>

        <h2 className="font-display text-xl font-bold text-slate-800">Invite Team Members</h2>
        <p className="mt-1 text-xs text-slate-500">Search registered users by name or email address</p>

        <div className="mt-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type name or email (min 2 chars)..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
          {loading && <p className="p-3 text-center text-xs text-slate-400">Searching...</p>}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="p-3 text-center text-xs text-slate-400">No users found matching "{query}"</p>
          )}

          {results.map((u) => {
            const isAlreadyMember = existingIds.has(u._id);
            return (
              <div
                key={u._id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 shadow-xs"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{u.name}</p>
                  <p className="text-[11px] text-slate-500">{u.email}</p>
                </div>
                {isAlreadyMember ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                    Already Member
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={addingId === u._id}
                    onClick={() => handleAddUser(u)}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {addingId === u._id ? "Adding..." : "+ Add"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default InviteMemberModal;
