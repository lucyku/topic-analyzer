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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        fetchSearchHistory()
      } else {
        setSearchHistory([])
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchSearchHistory = async () => {
    if (!user) return

    try {
      const q = firestoreQuery(
        collection(db, 'searchHistory'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }))

      setSearchHistory(history)
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

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

  // ... rest of your component JSX ...
}