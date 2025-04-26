import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('mostRecent');

  const fetchPosts = async () => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*');

    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*');

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
    } else {
      setPosts(postsData);
    }

    if (commentsError) {
      console.error('❌ Error fetching comments:', commentsError);
    } else {
      setComments(commentsData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpvote = async (postId, currentUpvotes) => {
    const { error } = await supabase
      .from('posts')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', postId);

    if (error) {
      console.error('❌ Error upvoting:', error);
      alert('Something went wrong.');
    } else {
      fetchPosts();
    }
  };

  const filteredPosts = posts
    .filter((post) => {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.username.toLowerCase().includes(q) ||
        post.movie_id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOption === 'mostRecent') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortOption === 'leastRecent') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortOption === 'mostUpvotes') {
        return b.upvotes - a.upvotes;
      } else if (sortOption === 'leastUpvotes') {
        return a.upvotes - b.upvotes;
      }
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">🎬 Movie Recommendation Forum</h1>

      {/*Search & Sort Controls */}
      <div className="search-filter-wrapper">
        <input
          type="text"
          placeholder="Search by title, username, or movie ID..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="search-input"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="mostRecent">Most Recent</option>
          <option value="leastRecent">Oldest</option>
          <option value="mostUpvotes">Most Upvoted</option>
          <option value="leastUpvotes">Least Upvoted</option>
        </select>
      </div>

      {loading && <p className="text-center text-gray-500">Loading reviews...</p>}

      {filteredPosts.length === 0 && !loading && (
        <p className="text-center text-gray-500">No matching reviews found.</p>
      )}

      <div className="review-grid">
        {filteredPosts.map((post) => {
          const commentCount = comments.filter(c => c.post_id === post.id).length;

          return (
            <div key={post.id} className="review-card">
              <Link to={`/post/${post.id}`} className="block hover:opacity-90 transition">
                <div className="review-header">
                  <h2>{post.title}</h2>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <div className="text-gray-700 font-medium mt-1 mb-2">
                  🎬 Movie reviewed: <span className="text-black">{post.movie_title}</span>
                </div>

                <p className="review-text">
                  {post.content?.length > 150 ? post.content.slice(0, 150) + '...' : post.content || <i>(No content)</i>}
                </p>

                {post.url && (
                  <img
                    src={post.url}
                    alt="Reaction GIF"
                    className="w-full max-h-48 object-cover rounded-lg mt-2"
                  />
                )}

                <div className="review-meta">
                  <span>🎯 Movie ID: {post.movie_id}</span>
                  <span>⭐ Rating: {post.rating}/5</span>
                </div>

                <div className="review-genres mt-1 text-sm text-blue-600 font-medium">
                  🎭 Genres: {post.genres}
                </div>
              </Link>

              <div className="review-footer flex items-center justify-between mt-4">
                <span>🧑 {post.username}</span>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleUpvote(post.id, post.upvotes)}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition"
                  >
                    ⬆️ {post.upvotes}
                  </button>

                  <button
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition"
                  >
                    💬 {commentCount}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
