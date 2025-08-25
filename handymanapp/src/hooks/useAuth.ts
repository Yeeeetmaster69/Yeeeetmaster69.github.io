
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, getIdTokenResult, User } from 'firebase/auth';

type Claims = { role?: 'admin'|'worker'|'client' };

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<Claims>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const res = await getIdTokenResult(u, true);
        setClaims({ role: (res.claims.role as any) || 'client' });
      } else {
        setClaims({});
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, claims, loading };
}
