'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Film, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MovieConcepts
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button asChild>
              <Link href="/analyzer">Try Now</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Connect Movies with Academic Concepts
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover how academic principles come to life in your favorite films. 
              Make learning engaging through the power of cinema.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/analyzer">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/examples">View Examples</Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-card">
              <BookOpen className="w-12 h-12 text-purple-600" />
              <h3 className="mt-4 text-xl font-semibold">Academic Concepts</h3>
              <p className="mt-2 text-muted-foreground">
                From physics to philosophy, connect any academic topic to movies.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <Film className="w-12 h-12 text-blue-600" />
              <h3 className="mt-4 text-xl font-semibold">Movie Analysis</h3>
              <p className="mt-2 text-muted-foreground">
                Deep dive into how movies demonstrate real-world concepts.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <Sparkles className="w-12 h-12 text-purple-600" />
              <h3 className="mt-4 text-xl font-semibold">AI-Powered</h3>
              <p className="mt-2 text-muted-foreground">
                Advanced AI helps find meaningful connections instantly.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold">MovieConcepts</h4>
              <p className="text-sm text-muted-foreground">
                Making learning engaging through the power of cinema.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/analyzer">Analyzer</Link></li>
                <li><Link href="/examples">Examples</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 MovieConcepts. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}