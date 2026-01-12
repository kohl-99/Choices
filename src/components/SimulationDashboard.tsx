'use client';

import { useState, useEffect } from 'react';
import { Person, Reaction } from '@/lib/types';
import { simulateReaction } from '@/lib/simulator'; // Logic is pure, safe to use here? 
// Wait, simulator.ts is pure logic, so yes. Next.js can import strict TS files in components if they don't use node-only APIs.

import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Activity } from 'lucide-react';
import clsx from 'clsx';
import { PersonCard } from './PersonCard';

interface Props {
    people: Person[];
}

export function SimulationDashboard({ people }: Props) {
    const [topic, setTopic] = useState('');
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Reset reactions when the cohort changes to prevent ID mismatches
    useEffect(() => {
        setReactions([]);
        setTopic('');
    }, [people]);

    const handleSimulate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || people.length === 0) return;

        setIsSimulating(true);
        // Simulate async delay for effect
        setTimeout(() => {
            const newReactions = people.map(p => simulateReaction(p, topic));
            setReactions(newReactions);
            setIsSimulating(false);
        }, 800);
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
                    <h2 className="text-lg font-semibold text-slate-900">Market Simulation</h2>
                </div>

                <form onSubmit={handleSimulate} className="flex gap-3">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a product, topic, or policy (e.g., 'Universal Basic Income', 'New AI Assistant')"
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isSimulating || !topic}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSimulating ? 'Simulating...' : 'Test Reaction'}
                    </button>
                </form>
            </div>

            {/* Results Section */}
            {reactions.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Stats Bar */}
                    <div className="flex gap-4">
                        <StatCard label="Positive" count={stats.positive} total={people.length} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
                        <StatCard label="Negative" count={stats.negative} total={people.length} color="bg-red-50 text-red-700 border-red-100" />
                        <StatCard label="Mixed" count={stats.mixed} total={people.length} color="bg-yellow-50 text-yellow-700 border-yellow-100" />
                        <StatCard label="Neutral" count={stats.neutral} total={people.length} color="bg-slate-50 text-slate-700 border-slate-100" />
                    </div>

                    {/* In-depth Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {reactions.map((r) => {
                            const person = people.find(p => p.id === r.personId)!;
                            return (
                                <div key={r.personId} className="relative group">
                                    <PersonCard person={person} />
                                    {/* Reaction Overlay */}
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-slate-200">
                                        <div className="mb-2 p-2 rounded-full bg-slate-50">
                                            {getReactionIcon(r.sentiment)}
                                        </div>
                                        <p className="text-sm font-medium text-slate-900 mb-1">"{r.comment}"</p>
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
