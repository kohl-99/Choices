'use client';

import { useState } from 'react';
import { Person, Region, ScenarioType, ProductSpec } from '@/lib/types'; // Import ProductSpec
import { generateCohort } from '@/lib/generator';
import { GeneratorForm } from '@/components/GeneratorForm';
import { SimulationDashboard } from '@/components/SimulationDashboard';
import { PersonCard } from '@/components/PersonCard';
import { ProductPersonaCard } from '@/components/ProductPersonaCard';
import { ProductAnalyticsDashboard } from '@/components/ProductAnalyticsDashboard';
import { ComparativeDashboard } from '@/components/ComparativeDashboard';
import { Sparkles, Users, Info, GitCompare, LayoutTemplate, ShoppingBag, Landmark, Scale, BarChart3, Presentation } from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleB, setPeopleB] = useState<Person[]>([]);
  const [regionA, setRegionA] = useState<Region>('US');
  const [regionB, setRegionB] = useState<Region>('US');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenario, setScenario] = useState<ScenarioType>('GENERAL');

  // Hoist ProductSpec state here so it can be passed to GeneratorForm and used for generation
  const [productSpec, setProductSpec] = useState<ProductSpec>({ name: '', prop: '', price: '', competitor: '' });
  const [activeView, setActiveView] = useState<'simulation' | 'analytics'>('simulation');

  const SubTab = ({ type, icon: Icon, label, active, onClick }: { type: string, icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all",
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const ScenarioTab = ({ type, icon: Icon, label }: { type: ScenarioType, icon: any, label: string }) => (
    <button
      onClick={() => setScenario(type)}
      className={clsx(
        "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
        scenario === type
          ? "text-indigo-600 bg-indigo-50/50"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      )}
    >
      <Icon className={clsx("w-4 h-4", scenario === type ? "text-indigo-600" : "text-slate-400")} />
      {label}
      {scenario === type && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
      )}
    </button>
  );

  const handleGenerate = async (count: number, region: Region) => {
    setIsGenerating(true);

    // Logic: If in Product Launch mode AND productSpec has content, use LLM generation.
    // Otherwise, use standard/hardcoded generation.
    // NOTE: We need to implement the async API call here.

    try {
      let newCohort: Person[] = [];

      if (scenario === 'PRODUCT_LAUNCH' && productSpec.name) {
        // Call the new API to generate tailored personas
        const response = await fetch('/api/generate-personas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productSpec, count, region })
        });
        if (response.ok) {
          const data = await response.json();
          newCohort = data.people;
        } else {
          console.error("Failed to generate personas via API");
          // Fallback? Or empty? User said "Only generate with LLM when user has input"
          // If error, maybe fallback to hardcoded
          /* newCohort = generateProductCohort(); */
        }
      } else if (scenario === 'PRODUCT_LAUNCH') {
        // User has NO input, use hardcoded (or maybe just standard random?)
        // User said: "if just click the general new cohort and no other input dod not waste the api quota"
        // But existing behavior for PRODUCT_LAUNCH was generateProductCohort (hardcoded). 
        // "Hardcoded" DOES NOT use API quota. So it is safe to stick with it.
        // Wait, I need to check if generateProductCohort is still imported?
        // I'll import it just in case, but maybe dynamically import?
        // Ideally we move this logic.
        // For now, I'll keep the import.
        const { generateProductCohort } = await import('@/lib/generator');
        newCohort = generateProductCohort();
      } else {
        newCohort = generateCohort(count, region);
      }

      if (isCompareMode && people.length > 0 && peopleB.length === 0) {
        setPeopleB(newCohort || []);
        setRegionB(region);
      } else {
        setPeople(newCohort || []);
        setRegionA(region);
        if (isCompareMode) {
          setPeopleB([]);
          setRegionB('US');
        }
      }
    } catch (e) {
      console.error("Generation error", e);
    } finally {
      setIsGenerating(false);
    }
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
            <button
              onClick={() => {
                setIsCompareMode(!isCompareMode);
                if (!isCompareMode) setPeopleB([]); // clear B on enter
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors border",
                isCompareMode
                  ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                  : "bg-white hover:bg-slate-50 border-slate-200"
              )}
            >
              <GitCompare className="w-4 h-4" />
              {isCompareMode ? 'Compare Mode Active' : 'Enable Compare Mode'}
            </button>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100">
              <Users className="w-4 h-4" />
              {people.length + peopleB.length} Models Active
            </span>
          </div>
        </div>
      </header>

      {/* Scenario Selector Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mr-4 flex-shrink-0">Select Field:</span>
            <ScenarioTab type="GENERAL" icon={LayoutTemplate} label="General" />
            <ScenarioTab type="PRODUCT_LAUNCH" icon={ShoppingBag} label="Product" />
            <ScenarioTab type="POLICY_CHANGE" icon={Landmark} label="Policy" />
            <ScenarioTab type="POLITICAL_BIAS" icon={Scale} label="Politics" />
          </div>
        </div>
      </div>

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
              {/* Note: We need to update GeneratorForm to accept productSpec if we want inputs here */}
              <GeneratorForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                scenario={scenario}
                productSpec={productSpec}
                setProductSpec={setProductSpec}
              />
            </div>
          </div>
        )}

        {/* Main Interface */}
        {people.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6">
              <GeneratorForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                scenario={scenario}
                productSpec={productSpec}
                setProductSpec={setProductSpec}
              />

              {isCompareMode && peopleB.length === 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-800 animate-pulse">
                  <p className="font-semibold mb-1">Compare Mode Active</p>
                  <p>Select a different region above and click &quot;Generate&quot; again to create the second cohort.</p>
                </div>
              )}

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
              {/* Internal Navigation for Product Scenarios */}
              {scenario === 'PRODUCT_LAUNCH' && (
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm w-fit">
                  <SubTab
                    type="simulation"
                    icon={Presentation}
                    label="Simulation"
                    active={activeView === 'simulation'}
                    onClick={() => setActiveView('simulation')}
                  />
                  <SubTab
                    type="analytics"
                    icon={BarChart3}
                    label="Market Analytics"
                    active={activeView === 'analytics'}
                    onClick={() => setActiveView('analytics')}
                  />
                </div>
              )}

              {activeView === 'analytics' && scenario === 'PRODUCT_LAUNCH' ? (
                <ProductAnalyticsDashboard people={people} productSpec={productSpec} />
              ) : (
                <>
                  {!isCompareMode ? (
                    <SimulationDashboard
                      key={people[0]?.id || 'empty'}
                      people={people}
                      scenario={scenario}
                      prefilledProductSpec={productSpec}
                    />
                  ) : (
                    <div className="space-y-6">
                      <ComparativeDashboard
                        peopleA={people}
                        peopleB={peopleB}
                        labelA={`Cohort A (${regionA})`}
                        labelB={peopleB.length > 0 ? `Cohort B (${regionB})` : "Waiting for Cohort B..."}
                      />
                    </div>
                  )}

                  {/* Meet the Cohort */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        {isCompareMode ? `Cohort A (${regionA})` : 'Meet the Cohort'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {people.map((person) => (
                          (scenario === 'PRODUCT_LAUNCH' && person.specificBarriers)
                            ? <ProductPersonaCard key={person.id} person={person} />
                            : <PersonCard key={person.id} person={person} scenario={scenario} />
                        ))}
                      </div>
                    </div>

                    {isCompareMode && peopleB.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Cohort B ({regionB})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {peopleB.map((person) => (
                            (scenario === 'PRODUCT_LAUNCH' && person.specificBarriers)
                              ? <ProductPersonaCard key={person.id} person={person} />
                              : <PersonCard key={person.id} person={person} scenario={scenario} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ChatModal Removed */}
    </main>
  );
}
