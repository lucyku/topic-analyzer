'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  query as firestoreQuery,
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Loader2, Menu, Moon, Sun, ChevronUp } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export default function Analyzer() {
  const [user, setUser] = useState<User | null>(null)
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  const [topic, setTopic] = useState('')
  const [movie, setMovie] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchSearchHistory = async (silent = true) => {
    if (!user) return;

    if (!silent) {
      setHistoryLoading(true);
    }

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

      if (JSON.stringify(newHistory) !== JSON.stringify(searchHistory)) {
        setSearchHistory(newHistory);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      if (!silent) {
        setHistoryLoading(false);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
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
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const saveToHistory = async () => {
    if (!user || !response) return

    try {
      const searchData = {
        topic,
        movie,
        response,
      }

      await addDoc(collection(db, 'searchHistory'), {
        userId: user.uid,
        searchData,
        timestamp: Timestamp.now(),
        userEmail: user.email
      })

      await fetchSearchHistory()
    } catch (error) {
      console.error('Error saving history:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResponse('')

    try {
      const data = {
        "user_id": "user123",
        "in-0": `${topic}\nmovie-${movie}`
      }
      
      const result = await query(data)
      setResponse(result)

      if (user && result) {
        await saveToHistory()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <DropdownMenuContent align="end" className="w-[90vw] max-w-[500px] md:w-[500px]">
      {user ? (
        <>
          <DropdownMenuItem disabled className="text-sm text-muted-foreground">
            {user.email}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Search History</DropdownMenuLabel>
          {historyLoading && searchHistory.length === 0 ? (
            <DropdownMenuItem disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading history...
            </DropdownMenuItem>
          ) : searchHistory.length > 0 ? (
            searchHistory.map((item) => (
              <div key={item.id} className="animate-none">
                <DropdownMenuItem
                  className="flex flex-col items-start cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!expandedHistoryId || expandedHistoryId !== item.id) {
                      setExpandedHistoryId(item.id);
                    }
                  }}
                >
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">
                        {item.searchData?.topic} in {item.searchData?.movie}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {expandedHistoryId === item.id && (
                      <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Response:</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedHistoryId(null);
                            }}
                          >
                            <ChevronUp className="h-4 w-4" />
                            <span className="sr-only">Minimize response</span>
                          </Button>
                        </div>
                        <div className="max-h-[40vh] overflow-y-auto whitespace-pre-wrap break-words">
                          {item.searchData?.response}
                        </div>
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
                {item !== searchHistory[searchHistory.length - 1] && (
                  <DropdownMenuSeparator />
                )}
              </div>
            ))
          ) : (
            <DropdownMenuItem disabled>
              No search history
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </>
      ) : (
        // ... login options remain the same ...
      )}
    </DropdownMenuContent>
  );
}