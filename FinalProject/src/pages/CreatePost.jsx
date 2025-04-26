import React, { useState, useEffect } from 'react';
import { searchMovies, getMovieDetails } from '../lib/tmdb';
import { supabase } from '../lib/supabase';

function CreatePost() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [postTitle, setPostTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rating, setRating] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const imgurRegex = /^https:\/\/i\.imgur\.com\/.+$/i;


  useEffect(() => {
    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(async () => {
      try {
        const results = await searchMovies(query);
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      }
    }, 300);

    setTypingTimeout(timeout);
  }, [query]);

  const handleMovieSelect = async (movie) => {
    try {
      const details = await getMovieDetails(movie.id);
      const genreNames = details.genres.map((g) => g.name).join(', ');

      setSelectedMovie({
        id: movie.id,
        title: movie.title,
        genres: genreNames,
        poster: movie.poster_path
          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
          : null,
      });

      setQuery(movie.title);
      setSearchResults([]);
    } catch (err) {
      console.error("Error fetching movie details:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !postTitle || !username || !password || !rating) {
      alert("Please complete all required fields.");
      return;
    }

    //Validate Imgur GIF URL
    if (imageUrl && !imgurRegex.test(imageUrl)) {
      alert("Please provide a valid Imgur GIF URL (e.g. https://i.imgur.com/abcd123.gif)");
      return;
    }

    const payload = {
      movie_id: selectedMovie.id.toString(),
      movie_title: selectedMovie.title,
      title: postTitle,
      content,
      username,
      password,
      rating: Number(rating),
      url: imageUrl || null,
      upvotes: 0,
      genres: selectedMovie.genres || '',
    };

    const { error } = await supabase.from('posts').insert([payload]);

    if (error) {
      console.error("❌ Error inserting post:", error);
      alert("Something went wrong.");
    } else {
      alert("Post submitted successfully!");
      setPostTitle('');
      setContent('');
      setUsername('');
      setPassword('');
      setRating('');
      setImageUrl('');
      setSelectedMovie(null);
      setQuery('');
    }
  };

  return (
    <div className="create-post-container">
      <h1>Submit a Movie Review</h1>

      <div className="autocomplete-wrapper">
        <label>Search for a Movie *</label>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedMovie(null);
          }}
          className="autocomplete-input"
          placeholder="Start typing..."
        />
        {searchResults.length > 0 && (
          <ul className="suggestions-list">
            {searchResults.map((movie) => (
              <li
                key={movie.id}
                className="suggestion-item"
                onClick={() => handleMovieSelect(movie)}
              >
                {movie.title} ({movie.release_date?.slice(0, 4)})
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedMovie && (
        <div className="selected-movie">
          {selectedMovie.poster && (
            <img src={selectedMovie.poster} alt={selectedMovie.title} />
          )}
          <div className="selected-movie-info">
            <h3>{selectedMovie.title}</h3>
            <p>Genres: {selectedMovie.genres}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-fields">
        <label>
          Review Title *
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Your Review (optional)
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
          />
        </label>

        <label>
          Username *
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          Secret Key (to edit/delete) *
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label>
          Rating (1–5) *
          <select value={rating} onChange={(e) => setRating(e.target.value)} required>
            <option value="">Choose one</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label>
          GIF Reaction (from Imgur only):
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste your GIF URL from https://imgur.com"
          />
          <small className="text-sm text-gray-500">
            Upload your GIF to <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Imgur</a> and paste the direct GIF link (e.g. <code>https://i.imgur.com/abcd123.gif</code>)
          </small>
          {imageUrl && (
            <p className={`text-sm mt-1 ${imgurRegex.test(imageUrl) ? 'text-green-600' : 'text-red-600'}`}>
              {imgurRegex.test(imageUrl)
                ? '✅ Valid Imgur GIF URL'
                : '❌ Must be a direct image link from i.imgur.com'}
            </p>
          )}
        </label>

        {imageUrl && imgurRegex.test(imageUrl) && (
          <div className="gif-preview">
            <img
              src={imageUrl}
              alt="GIF Preview"
              className="gif-preview-img"
            />
          </div>
        )}

        <button type="submit" className="submit-button">Post Review</button>
      </form>
    </div>
  );
}

export default CreatePost;
