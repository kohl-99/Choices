'use client';

import { useState, useEffect } from 'react';
import { Person, Reaction, ScenarioType, ProductSpec } from '@/lib/types';
import { simulateReaction } from '@/lib/simulator';
import { calculateBreakdown } from '@/lib/analytics';
import { exportToCSV, flattenReactionsForExport } from '@/lib/exportUtils';
// Wait, simulator.ts is pure logic, so yes. Next.js can import strict TS files in components if they don't use node-only APIs.

import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Activity, Download } from 'lucide-react';
import clsx from 'clsx';
import { PersonCard } from './PersonCard';

interface Props {
    people: Person[];
    scenario: ScenarioType;
    prefilledProductSpec?: ProductSpec;
}

export function SimulationDashboard({ people, scenario, prefilledProductSpec }: Props) {
    const [topic, setTopic] = useState('');
    const [productSpec, setProductSpec] = useState({ name: '', prop: '', price: '', competitor: '' });
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Sync prefilled spec when it changes (or on mount)
    useEffect(() => {
        if (prefilledProductSpec && scenario === 'PRODUCT_LAUNCH') {
            setProductSpec(prefilledProductSpec);
        }
    }, [prefilledProductSpec, scenario]);

    // Reset reactions is handled by key prop in parent

    const handleExport = () => {
        const title = scenario === 'PRODUCT_LAUNCH' && productSpec.name ? productSpec.name : topic;
        const data = flattenReactionsForExport(reactions, people, title);
        exportToCSV(data, `choices_simulation_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const handleSimulate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Construct effective topic based on scenario
        let effectiveTopic = topic;
        if (scenario === 'PRODUCT_LAUNCH') {
            effectiveTopic = `Product: ${productSpec.name}. Value Proposition: ${productSpec.prop}. Price: ${productSpec.price}. Competitor/Alternative: ${productSpec.competitor}.`;
            if (!productSpec.name || !productSpec.prop || !productSpec.price) return; // Simple validation
        } else {
            if (!topic.trim()) return;
        }

        if (people.length === 0) return;

        setIsSimulating(true);
        // Simulate async delay for effect
        setTimeout(() => {
            const newReactions = people.map(p => simulateReaction(p, effectiveTopic, scenario));
            setReactions(newReactions);
            setIsSimulating(false);
        }, 800);
    };

    const getPlaceholder = () => {
        switch (scenario) {
            case 'PRODUCT_LAUNCH': return "Describe a new product (e.g., 'Eco-friendly $500 Smartphone')...";
            case 'POLICY_CHANGE': return "Describe a policy (e.g., 'Increase income tax by 5%')...";
            case 'POLITICAL_BIAS': return "Enter a political statement (e.g., 'The government is spending too much')...";
            default: return "Enter a topic, product, or headline to simulate reactions...";
        }
    };

    const getReactionIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'Positive': return <ThumbsUp className="w-4 h-4 text-emerald-600" />;
            case 'Negative': return <ThumbsDown className="w-4 h-4 text-red-600" />;
            case 'Mixed': return <Activity className="w-4 h-4 text-yellow-600" />;
            default: return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const stats = {
        positive: reactions.filter(r => r.sentiment === 'Positive').length,
        negative: reactions.filter(r => r.sentiment === 'Negative').length,
        neutral: reactions.filter(r => r.sentiment === 'Neutral').length,
        mixed: reactions.filter(r => r.sentiment === 'Mixed').length,
    };

    return (
        <div className="space-y-8">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        {scenario === 'PRODUCT_LAUNCH' ? 'Test Your Product Hypothesis' : 'Market Simulation'}
                    </h2>
                </div>

                <form onSubmit={handleSimulate} className="space-y-4">
                    {/* Conditional Input Form */}
                    {scenario === 'PRODUCT_LAUNCH' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Product Name</label>
                                <input
                                    type="text"
                                    value={productSpec.name}
                                    onChange={(e) => setProductSpec({ ...productSpec, name: e.target.value })}
                                    placeholder="e.g. EduAI"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Price Point</label>
                                <input
                                    type="text"
                                    value={productSpec.price}
                                    onChange={(e) => setProductSpec({ ...productSpec, price: e.target.value })}
                                    placeholder="e.g. $19/mo or Free"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Core Value Proposition</label>
                                <input
                                    type="text"
                                    value={productSpec.prop}
                                    onChange={(e) => setProductSpec({ ...productSpec, prop: e.target.value })}
                                    placeholder="e.g. Personalized AI tutor that adapts to your learning style"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Primary Competitor / Alternative</label>
                                <input
                                    type="text"
                                    value={productSpec.competitor}
                                    onChange={(e) => setProductSpec({ ...productSpec, competitor: e.target.value })}
                                    placeholder="e.g. Traditional tutors, ChatGPT, Coursera"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={getPlaceholder()}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                        />
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSimulating || (scenario !== 'PRODUCT_LAUNCH' && !topic)}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md transform active:scale-95"
                        >
                            {isSimulating ? 'Simulating...' : 'Run Simulation'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {reactions.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Segment Analysis (New) */}
                    <SegmentAnalysis reactions={reactions} people={people} />

                    {/* Stats Bar */}
                    <div className="flex gap-4">
                        <StatCard label="Positive" count={stats.positive} total={people.length} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
                        <StatCard label="Negative" count={stats.negative} total={people.length} color="bg-red-50 text-red-700 border-red-100" />
                        <StatCard label="Mixed" count={stats.mixed} total={people.length} color="bg-yellow-50 text-yellow-700 border-yellow-100" />
                        <StatCard label="Neutral" count={stats.neutral} total={people.length} color="bg-slate-50 text-slate-700 border-slate-100" />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Results to CSV
                        </button>
                    </div>

                    {/* In-depth Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {reactions.map((r) => {
                            const person = people.find(p => p.id === r.personId);
                            if (!person) return null;

                            return (
                                <div key={r.personId} className="relative group">
                                    <PersonCard person={person} />
                                    {/* Reaction Overlay */}
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-slate-200">
                                        <div className="mb-2 p-2 rounded-full bg-slate-50">
                                            {getReactionIcon(r.sentiment)}
                                        </div>
                                        <p className="text-sm font-medium text-slate-900 mb-1">&quot;{r.comment}&quot;</p>
                                        <span className="text-xs text-slate-500">Interest: {r.interestLevel}/10</span>
                                    </div>

                                    {/* Badge always visible */}
                                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-slate-100 z-10">
                                        {getReactionIcon(r.sentiment)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
    const percent = Math.round((count / total) * 100);
    return (
        <div className={clsx("flex-1 p-4 rounded-xl border flex flex-col items-center justify-center", color)}>
            <span className="text-2xl font-bold">{percent}%</span>
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</span>
        </div>
    );
}

function SegmentAnalysis({ reactions, people }: { reactions: Reaction[]; people: Person[] }) {
    const [view, setView] = useState<'politics' | 'hometownType' | 'ageGroup'>('politics');
    const data = calculateBreakdown(reactions, people, view);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Segment Analysis</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {[
                        { id: 'politics', label: 'Politics' },
                        { id: 'hometownType', label: 'Location' },
                        { id: 'ageGroup', label: 'Age' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id as 'politics' | 'hometownType' | 'ageGroup')}
                            className={clsx(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                view === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {data.map((item) => (
                    <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700">{item.label} <span className="text-slate-400 font-normal">({item.total})</span></span>
                            <div className="flex gap-3">
                                <span className="text-emerald-600 font-medium">{item.positivePercent}% Pos</span>
                                <span className="text-red-600 font-medium">{item.negativePercent}% Neg</span>
                            </div>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                            {/* Positive Segment */}
                            <div className="h-full bg-emerald-500" style={{ width: `${item.positivePercent}%` }} />
                            {/* Neutral/Mixed (Gray) */}
                            <div className="h-full bg-slate-300" style={{ width: `${100 - item.positivePercent - item.negativePercent}%` }} />
                            {/* Negative Segment */}
                            <div className="h-full bg-red-500" style={{ width: `${item.negativePercent}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
