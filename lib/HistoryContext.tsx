'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  collection, 
  query as firestoreQuery,
  where, 
  orderBy, 
  getDocs,
} from 'firebase/firestore';

interface HistoryContextType {
  searchHistory: any[];
  fetchSearchHistory: () => Promise<void>;
  isLoading: boolean;
}

const HistoryContext = createContext<HistoryContextType>({
  searchHistory: [],
  fetchSearchHistory: async () => {},
  isLoading: false
});

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearchHistory = async (silent = true) => {
    if (!user) return;

    // Only show loading state on initial load, not during background updates
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
      }));

      // Only update if there are actual changes
      if (JSON.stringify(newHistory) !== JSON.stringify(searchHistory)) {
        setSearchHistory(newHistory);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (newUser) => {
      setUser(newUser);
      if (newUser) {
        await fetchSearchHistory(false); // Show loading on initial load
      } else {
        setSearchHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Background refresh
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchSearchHistory(true); // Silent refresh
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  return (
    <HistoryContext.Provider value={{ searchHistory, fetchSearchHistory, isLoading }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);