import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentUsername, setCommentUsername] = useState('');

  const [showEditForm, setShowEditForm] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState('');
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, []);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) console.error(error);
    else {
      setPost(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setEditRating(data.rating);
      setEditUrl(data.url);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) console.error(error);
    else setComments(data);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentUsername || !newComment) {
      alert('Please provide username and comment');
      return;
    }

    const { error } = await supabase.from('comments').insert([
      { post_id: id, username: commentUsername, content: newComment }
    ]);

    if (error) console.error(error);
    else {
      setNewComment('');
      setCommentUsername('');
      fetchComments();
    }
  };

  const handleUnlock = () => {
    if (editUsername === post.username && editPassword === post.password) {
      setIsAuthorized(true);
    } else {
      alert("❌ Incorrect username or secret key.");
    }
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase
      .from('posts')
      .update({
        title: editTitle,
        content: editContent,
        rating: editRating,
        url: editUrl
      })
      .eq('id', post.id);

    if (error) {
      console.error("Error updating post:", error);
      alert("Something went wrong.");
    } else {
      alert("Post updated successfully!");
      setIsAuthorized(false);
      setShowEditForm(false);
      fetchPost();
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this review?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      console.error("Error deleting post:", error);
      alert("Something went wrong.");
    } else {
      alert("Review deleted successfully.");
      navigate('/');
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <div className="back-button-wrapper">
        <Link to="/" className="back-button">&larr; Back to Home</Link>
      </div>

      {/*View/Edit Review */}
      {!isAuthorized ? (
        <>
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <p className="mb-4">{post.content}</p>
          <p className="mb-2">⭐ Rating: {post.rating}/5</p>
          {post.url && (
            <img
              src={post.url}
              alt="GIF Reaction"
              className="w-full max-w-sm rounded mb-4"
            />
          )}
          <p className="text-sm text-gray-600 mb-4">Posted by: {post.username}</p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">Edit Your Review</h2>
          <label>
            Title
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            />
          </label>
          <label>
            Content
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
              rows="4"
            />
          </label>
          <label>
            Rating
            <select
              value={editRating}
              onChange={(e) => setEditRating(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-2"
            >
              <option value="">Choose one</option>
              {[1, 2, 3, 4, 5].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            GIF/Image URL
            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleSaveEdit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              💾 Save Changes
            </button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              🗑️ Delete This Review
            </button>
          </div>
        </>
      )}

      {/*Edit Unlock Form */}
      {!isAuthorized && showEditForm && (
        <div className="border p-4 mt-6 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Verify to Edit/Delete Post</h3>
          <input
            type="text"
            placeholder="Username"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
            className="w-full mb-2 border px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Secret Key"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            className="w-full mb-2 border px-3 py-2 rounded"
          />
          <button onClick={handleUnlock} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            🔓 Unlock
          </button>
        </div>
      )}

      {!showEditForm && !isAuthorized && (
        <button
          onClick={() => setShowEditForm(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mt-4"
        >
          ✏️ Edit This Review
        </button>
      )}

      {/*Comments */}
      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-4">💬 Comments ({comments.length})</h2>

      <div className="comments-section">
        {comments.length === 0 && <p className="text-gray-500">No comments yet.</p>}

        {comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <p className="comment-username">{comment.username}</p>
            <p className="comment-content">{comment.content}</p>
          </div>
        ))}
      </div>

      {/*Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="add-comment-form mt-6">
        <input
          type="text"
          placeholder="Your name"
          value={commentUsername}
          onChange={(e) => setCommentUsername(e.target.value)}
        />
        <textarea
          placeholder="Your comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows="4"
        />
        <button type="submit" className="add-comment-button">
          ➕ Add Comment
        </button>
      </form>
    </div>
  );
}

export default PostPage;