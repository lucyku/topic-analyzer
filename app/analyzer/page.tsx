'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, BookOpen, Film, Loader2, Moon, Sun, Save, Menu, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { User } from 'firebase/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  query as firestoreQuery,
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore'

export default function Analyzer() {
  const [topic, setTopic] = useState('')
  const [movie, setMovie] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedAnalyses, setSavedAnalyses] = useState<{ topic: string; movie: string; response: string }[]>([])
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('savedAnalyses')
    if (saved) {
      setSavedAnalyses(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await fetchSearchHistory();
      } else {
        setSearchHistory([]);
      }
      setIsInitialLoad(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google sign in error:', error);
    }
  };

  async function query(data: any) {
    const response = await fetch(
      "https://api.stack-ai.com/inference/v0/run/ce07b230-9ff1-445b-996d-6aa979e64cff/67210f957573e04bc1b199ae",
      {
        headers: {
          'Authorization': 'Bearer 86bc8f6f-a535-48ad-8711-7125f966542d',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    )
    const result = await response.json()
    return result.outputs['out-0']
  }

  const fetchSearchHistory = async () => {
    if (!user) return;

    try {
      const q = firestoreQuery(
        collection(db, 'searchHistory'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      if (JSON.stringify(history) !== JSON.stringify(searchHistory)) {
        setSearchHistory(history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const saveToHistory = async () => {
    if (!user || !response || !topic || !movie) return;

    try {
      const searchData = {
        topic,
        movie,
        response,
      };

      const docData = {
        userId: user.uid,
        searchData,
        timestamp: Timestamp.now(),
        userEmail: user.email
      };

      await addDoc(collection(db, 'searchHistory'), docData);
      await fetchSearchHistory();
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const data = {
        "user_id": "user123",
        "in-0": `${topic}\nmovie-${movie}`
      };
      
      const result = await query(data);
      setResponse(result);

      if (user && result) {
        await saveToHistory();
        await fetchSearchHistory();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isInitialLoad) {
      const interval = setInterval(() => {
        fetchSearchHistory();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, isInitialLoad]);

  const removeAnalysis = (index: number) => {
    const updatedAnalyses = savedAnalyses.filter((_, i) => i !== index)
    setSavedAnalyses(updatedAnalyses)
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses))
  }

  const saveAnalysis = () => {
    const newAnalysis = { topic, movie, response }
    const updatedAnalyses = [...savedAnalyses, newAnalysis]
    setSavedAnalyses(updatedAnalyses)
    localStorage.setItem('savedAnalyses', JSON.stringify(updatedAnalyses))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <header className="border-b bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MovieConcepts
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
            </Button>
            
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[90vw] max-w-[500px] md:w-[500px]"
              >
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                      {user.email}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel>Search History</DropdownMenuLabel>
                    {historyLoading ? (
                      <DropdownMenuItem disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading history...
                      </DropdownMenuItem>
                    ) : searchHistory.length > 0 ? (
                      searchHistory.map((item) => (
                        <div key={item.id}>
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
                                        e.stopPropagation(); // Prevent the dropdown item click
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
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="w-full">
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup" className="w-full">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleGoogleSignIn}>
                      <img 
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                        alt="Google logo" 
                        className="w-4 h-4 mr-2"
                      />
                      Sign in with Google
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className="container mx-auto max-w-4xl p-6">
        <div className="space-y-8">
          <header className="text-center space-y-4 py-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              Movie Topic Analyzer
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Discover how academic concepts appear in your favorite movies
            </motion.p>
          </header>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="backdrop-blur-lg backdrop-filter bg-white/90 dark:bg-gray-800/90">
              <CardHeader>
                <CardTitle>Analyze Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="topic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Academic Topic
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="topic"
                          type="text"
                          placeholder="e.g., Newton's 3rd law"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="movie" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Movie Name
                      </label>
                      <div className="relative">
                        <Film className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="movie"
                          type="text"
                          placeholder="e.g., Pushpa"
                          value={movie}
                          onChange={(e) => setMovie(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading || !topic || !movie}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : 'Asan_hai🚀'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="flex items-center space-x-2 pt-6">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="backdrop-blur-lg backdrop-filter bg-white/90 dark:bg-gray-800/90">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Analysis Result</CardTitle>
                    <Button variant="outline" size="sm" onClick={saveAnalysis}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Analysis
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {response}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {savedAnalyses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="backdrop-blur-lg backdrop-filter bg-white/90 dark:bg-gray-800/90">
                <CardHeader>
                  <CardTitle>Saved Analyses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {savedAnalyses.map((analysis, index) => (
                      <li key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {analysis.topic} in {analysis.movie}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {analysis.response.substring(0, 100)}...
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeAnalysis(index)}
                            className="ml-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}