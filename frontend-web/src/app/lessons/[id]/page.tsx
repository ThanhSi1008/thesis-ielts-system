'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lessonService, type Lesson, type Vocabulary, type Grammar } from '@/services/lesson.service';
import Link from 'next/link';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [grammar, setGrammar] = useState<Grammar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar'>('vocabulary');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      const [lessonData, vocabData, grammarData] = await Promise.all([
        lessonService.getLesson(lessonId),
        lessonService.getVocabulary(lessonId),
        lessonService.getGrammar(lessonId),
      ]);
      setLesson(lessonData);
      setVocabulary(vocabData);
      setGrammar(grammarData);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Lesson not found</p>
          <Link href="/lessons" className="text-blue-600 hover:underline">
            Back to lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/lessons"
            className="text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
          >
            ← Back to Lessons
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
          <p className="text-gray-600">{lesson.description}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('vocabulary')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'vocabulary'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vocabulary ({vocabulary.length})
              </button>
              <button
                onClick={() => setActiveTab('grammar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'grammar'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Grammar ({grammar.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Vocabulary Tab */}
            {activeTab === 'vocabulary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vocabulary.map((word) => (
                  <div
                    key={word.id}
                    onClick={() => toggleCard(word.id)}
                    className="relative h-48 cursor-pointer perspective"
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
                        flippedCards.has(word.id) ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front of card */}
                      <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 flex flex-col justify-center items-center text-white">
                        <div className="text-3xl font-bold mb-2">{word.word}</div>
                        {word.ipa && (
                          <div className="text-sm opacity-90">{word.ipa}</div>
                        )}
                        {word.partOfSpeech && (
                          <div className="mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                            {word.partOfSpeech}
                          </div>
                        )}
                      </div>

                      {/* Back of card */}
                      <div className="absolute w-full h-full backface-hidden bg-white rounded-lg shadow-md p-6 rotate-y-180 flex flex-col justify-center">
                        <div className="text-gray-800 font-semibold mb-2">{word.meaning}</div>
                        {word.example && (
                          <div className="text-sm text-gray-600 italic mt-2 border-l-4 border-blue-500 pl-3">
                            "{word.example}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grammar Tab */}
            {activeTab === 'grammar' && (
              <div className="space-y-6">
                {grammar.map((rule) => (
                  <div key={rule.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{rule.title}</h3>
                    <div className="prose prose-blue max-w-none mb-4">
                      <p className="text-gray-700">{rule.rule}</p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="font-medium text-blue-800 mb-1">Example:</div>
                      <div className="text-blue-900">{rule.example}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty states */}
            {activeTab === 'vocabulary' && vocabulary.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No vocabulary words yet
              </div>
            )}
            {activeTab === 'grammar' && grammar.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No grammar rules yet
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
