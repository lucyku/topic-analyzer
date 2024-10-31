'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from './firebase';
import { 
  collection, 
  query as firestoreQuery,
  where, 
  orderBy, 
  getDocs,
} from 'firebase/firestore';

interface SearchHistoryItem {
  id: string;
  userId: string;
  searchData: {
    topic: string;
    movie: string;
    response: string;
  };
  timestamp: Date;
  userEmail: string;
}

interface HistoryContextType {
  searchHistory: SearchHistoryItem[];
  fetchSearchHistory: (silent?: boolean) => Promise<void>;
  isLoading: boolean;
}

const HistoryContext = createContext<HistoryContextType>({
  searchHistory: [],
  fetchSearchHistory: async () => {},
  isLoading: false
});

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearchHistory = async (silent = true) => {
    if (!user) return;

    if (!silent) setIsLoading(true);

    try {
      const q = firestoreQuery(
        collection(db, 'searchHistory'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const newHistory = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as SearchHistoryItem[];

      if (JSON.stringify(newHistory) !== JSON.stringify(searchHistory)) {
        setSearchHistory(newHistory);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (newUser) => {
      setUser(newUser);
      if (newUser) {
        await fetchSearchHistory(false);
      } else {
        setSearchHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchSearchHistory(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <HistoryContext.Provider value={{ searchHistory, fetchSearchHistory, isLoading }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);