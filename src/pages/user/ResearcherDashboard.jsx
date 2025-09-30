import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/userService";
import { signOut } from "../../services/userService";
import { getMyResearchPosts, getSavedResearchPosts } from "../../api/research";

export default function ResearcherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [tab, setTab] = useState("mine");
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [u, mine, saved] = await Promise.all([
        getCurrentUser(),
        getMyResearchPosts(),
        getSavedResearchPosts(),
      ]);
      setUser(u);
      setMyPosts(mine);
      setSavedPosts(saved);
      setLoading(false);
    };
    load();
  }, []);

  const PostCard = ({ p }) => (
    <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/research/${p.id}`} className="text-base font-semibold text-blue-600 hover:underline">
            {p.title}
          </Link>
          {p.abstract && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">{p.abstract}</p>
          )}
          <div className="mt-2 text-xs text-neutral-500">
            <span>Created: {new Date(p.created_at).toLocaleString()}</span>
            <span className="mx-2">•</span>
            <span>Status: {p.status}</span>
          </div>
        </div>
        <div className="text-sm text-neutral-500 min-w-[5rem] text-right">
          <div>Votes: <span className="text-neutral-300">{p.votes_count ?? 0}</span></div>
          <div>Comments: <span className="text-neutral-300">{p.comments_count ?? 0}</span></div>
        </div>
      </div>
    </div>
  );

  const Section = ({ title, items }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide">{title}</h3>
      {items.length ? (
        <div className="grid gap-3">
          {items.map((p) => (
            <PostCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-neutral-500">No posts yet.</div>
      )}
    </div>
  );

  return (
    <div className="pt-28 pb-16 w-full lg:w-[70%] mx-auto px-4 lg:px-0">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Researcher Dashboard</h1>

      {/* Account Details */}
      {user && (
        <div className="mt-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4 justify-between">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
              {user?.profile?.avatar ? (
                <img src={user.profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold">
                  {(user?.profile?.name || user?.email || 'U')?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm text-neutral-400">Signed in as</div>
              <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{user?.profile?.name || user?.email}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Email: {user?.email}</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">Role: {user?.profile?.user_type || 'researcher'}</div>
            </div>
            <div>
              <button onClick={handleLogout} className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          className={`px-3 py-2 rounded-md border ${tab === "mine" ? "bg-blue-600 text-white border-blue-600" : "border-neutral-800 text-neutral-300 hover:bg-neutral-800"}`}
          onClick={() => setTab("mine")}
        >
          My Posts
        </button>
        <button
          className={`px-3 py-2 rounded-md border ${tab === "saved" ? "bg-blue-600 text-white border-blue-600" : "border-neutral-800 text-neutral-300 hover:bg-neutral-800"}`}
          onClick={() => setTab("saved")}
        >
          Saved Posts
        </button>
      </div>

      {loading ? (
        <div className="mt-6 text-neutral-400">Loading…</div>
      ) : (
        <div className="mt-6 space-y-8">
          {tab === "mine" ? (
            <Section title="Your Research Posts" items={myPosts} />
          ) : (
            <Section title="Saved Research Posts" items={savedPosts} />
          )}
        </div>
      )}
    </div>
  );
}
