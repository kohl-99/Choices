'use client';

import { useState } from 'react';
import { Person } from '@/lib/types';
import { generateCohort } from '@/lib/generator';
import { GeneratorForm } from '@/components/GeneratorForm';
import { SimulationDashboard } from '@/components/SimulationDashboard';
import { PersonCard } from '@/components/PersonCard';
import { Sparkles, Users, Info } from 'lucide-react';

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial generation on empty state? Maybe not, let user choose.

  const handleGenerate = (count: number) => {
    setIsGenerating(true);
    // Simulate async
    setTimeout(() => {
      const newCohort = generateCohort(count);
      setPeople(newCohort);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Choices <span className="text-slate-400 font-normal">MVP</span></h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100">
              <Users className="w-4 h-4" />
              {people.length} Models Active
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Intro / Empty State */}
        {people.length === 0 && !isGenerating && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto mt-10">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Choices</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              This tool allows you to generate a synthetic population based on real-world demographic and psychometric data.
              Simulate how different groups of people react to new products, policies, or topics.
            </p>
            <div className="flex justify-center">
              <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>
          </div>
        )}

        {/* Main Interface */}
        {people.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6">
              <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <div className="flex items-center gap-2 mb-2 font-semibold">
                  <Info className="w-4 h-4" />
                  <span>Simulation Logic</span>
                </div>
                <p className="opacity-90">
                  Reactions are generated using a heuristic model based on Big Five personality traits and demographic data.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <SimulationDashboard people={people} />

              {/* Meet the Cohort */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Meet the Cohort</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {people.map((person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
