// hooks/useCurrentUser.js
import { useEffect, useState } from 'react';
import { apiFetch } from '../Controls/apiFetch'; // adjust path if needed
import { apiUrl } from '../Constants';

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await apiFetch(`${apiUrl}/me`, { credentials: 'include' });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  return { user, loading };
}
