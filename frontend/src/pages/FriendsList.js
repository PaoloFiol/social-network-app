import React, { useEffect, useMemo, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await API.get('/friends/list');
        setFriends(res.data);
      } catch (err) {
        setError('Could not load friends.');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return friends;
    return friends.filter(f =>
      `${f.firstName || ''} ${f.lastName || ''}`.toLowerCase().includes(term) ||
      (f.username || '').toLowerCase().includes(term)
    );
  }, [friends, search]);

  return (
    <div className="center-page">
      <section className="panel-card panel-card--wide">
        <p className="eyebrow">Connections</p>
        <h1 className="page-heading">Friends</h1>
        <p className="page-subtitle">Search your current friends and open their profiles or message threads.</p>

        <input
          className="search-input"
          placeholder="Search by name or username"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search friends"
        />

        {loading && <div className="empty-state">Loading friends...</div>}
        {error && <div className="empty-state">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">No friends found.</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="list-card">
            {filtered.map(friend => (
              <li key={friend._id} className="list-item">
                <Link to={`/profile/${friend.username}`} className="person-link">
                  <img src={friend.profilePic || '/default-profile.png'} alt="" className="avatar-sm" />
                  <span className="person-copy">
                    {friend.firstName} {friend.lastName}
                    <span>@{friend.username}</span>
                  </span>
                </Link>
                <Link to={`/messages/${friend._id}`} className="button-secondary">Message</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default FriendsList;
