import { useState, useEffect } from 'react'
// Icons removed per user request
import './App.css'

interface Chapter {
  chapter_number: number
  title: string
  original_text: string
  modern_translation: string
  modern_interpretation: string
  keywords: string[]
}

function App() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapter, setCurrentChapter] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Chapter[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    fetch('/data/tao_te_ching_complete.json')
      .then(response => response.json())
      .then(data => {
        setChapters(data)
        setSearchResults(data)
      })
      .catch(error => console.error('Error loading chapters:', error))

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('tao-favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    // Save favorites to localStorage
    localStorage.setItem('tao-favorites', JSON.stringify(favorites))
  }, [favorites])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setSearchResults(chapters)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const results = chapters.filter(chapter =>
      chapter.title.toLowerCase().includes(term.toLowerCase()) ||
      chapter.modern_translation.toLowerCase().includes(term.toLowerCase()) ||
      chapter.modern_interpretation.toLowerCase().includes(term.toLowerCase()) ||
      chapter.keywords.some(keyword => keyword.toLowerCase().includes(term.toLowerCase()))
    )
    setSearchResults(results)
  }

  const getRandomChapter = () => {
    const randomIndex = Math.floor(Math.random() * chapters.length)
    setCurrentChapter(chapters[randomIndex].chapter_number)
    setIsSearching(false)
    setSearchTerm('')
  }

  const toggleFavorite = (chapterNumber: number) => {
    setFavorites(prev => 
      prev.includes(chapterNumber)
        ? prev.filter(id => id !== chapterNumber)
        : [...prev, chapterNumber]
    )
  }

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentChapter > 1) {
      setCurrentChapter(currentChapter - 1)
    } else if (direction === 'next' && currentChapter < 81) {
      setCurrentChapter(currentChapter + 1)
    }
    setIsSearching(false)
    setSearchTerm('')
  }

  const getCurrentChapter = () => chapters.find(ch => ch.chapter_number === currentChapter)

  const getChapterImage = (chapterNum: number) => {
    const images = [
      'mountain-mist.jpg',
      'flowing-water.jpeg', 
      'bamboo-forest.jpg',
      'balance-stone.jpg',
      'temple-sunrise.jpg',
      'lotus-pond.jpg'
    ]
    return images[chapterNum % images.length]
  }

  const currentChapterData = getCurrentChapter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50">
      {/* Hero Section */}
      {!isSearching && currentChapter === 1 && (
        <div className="relative h-96 bg-cover bg-center" style={{backgroundImage: 'url(/images/mountain-mist.jpg)'}}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-white text-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">Tao Te Ching</h1>
              <p className="text-xl mb-6">道德经 • Ancient Wisdom for Modern Life</p>
              <button
                onClick={() => setCurrentChapter(1)}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              >
                Begin the Journey
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Tao Te Ching</h1>
                <p className="text-sm text-stone-600">Ancient Wisdom for Modern Life</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={getRandomChapter}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                Random
              </button>
              
              <div>
                <input
                  type="text"
                  placeholder="Search wisdom..."
                  className="px-4 py-2 w-64 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isSearching ? (
          /* Search Results */
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-800">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map(chapter => (
                <div
                  key={chapter.chapter_number}
                  className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setCurrentChapter(chapter.chapter_number)
                    setIsSearching(false)
                    setSearchTerm('')
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm text-amber-600 font-medium">Chapter {chapter.chapter_number}</span>
                      <h3 className="text-lg font-semibold text-stone-800">{chapter.title}</h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(chapter.chapter_number)
                      }}
                      className="p-1 rounded text-sm"
                    >
                      {favorites.includes(chapter.chapter_number) ? '★' : '☆'}
                    </button>
                  </div>
                  <p className="text-stone-600 text-sm line-clamp-3">
                    {chapter.modern_translation.substring(0, 150)}...
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {chapter.keywords.slice(0, 3).map(keyword => (
                      <span key={keyword} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : currentChapterData ? (
          /* Chapter View */
          <div className="max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigateChapter('prev')}
                disabled={currentChapter <= 1}
                className="px-4 py-2 bg-white rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="text-center">
                <span className="text-sm text-amber-600 font-medium">Chapter {currentChapter} of 81</span>
              </div>
              
              <button
                onClick={() => navigateChapter('next')}
                disabled={currentChapter >= 81}
                className="px-4 py-2 bg-white rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>

            {/* Chapter Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              {/* Chapter Header */}
              <div className="bg-gradient-to-r from-amber-50 to-stone-50 px-8 py-6 border-b border-stone-200 relative">
                <div 
                  className="absolute inset-0 opacity-10 bg-cover bg-center"
                  style={{backgroundImage: `url(/images/${getChapterImage(currentChapter)})`}}
                ></div>
                <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-stone-800 mb-2">
                      {currentChapterData.title}
                    </h1>
                    <p className="text-amber-600 font-medium">Chapter {currentChapter}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="px-3 py-1 text-sm bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      {showOriginal ? 'Hide' : 'Show'} Original
                    </button>
                    <button
                      onClick={() => toggleFavorite(currentChapter)}
                      className="p-2 rounded-lg text-sm"
                    >
                      {favorites.includes(currentChapter) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
                </div>
              </div>

              {/* Chapter Text */}
              <div className="p-8 space-y-8">
                {showOriginal && (
                  <div className="bg-stone-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-4">Original Chinese Text</h3>
                    <p className="text-stone-700 leading-relaxed text-lg font-medium" style={{fontFamily: 'serif'}}>
                      {currentChapterData.original_text}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">Modern Translation</h3>
                  <p className="text-stone-700 leading-relaxed text-lg">
                    {currentChapterData.modern_translation}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">Modern Interpretation</h3>
                  <p className="text-stone-600 leading-relaxed">
                    {currentChapterData.modern_interpretation}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">Key Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentChapterData.keywords.map(keyword => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => handleSearch(keyword)}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-stone-600">Loading wisdom...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-300 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="mb-2">The Way that can be spoken is not the eternal Way</p>
          <p className="text-sm text-stone-400">
            Tao Te Ching • Modern Translation • Ancient Wisdom for Contemporary Living
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
