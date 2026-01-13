import { useState } from 'react';
import { Person, Reaction } from '@/lib/types';
import { simulateReaction } from '@/lib/simulator';
import { MessageSquare, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    peopleA: Person[];
    peopleB: Person[];
    labelA: string;
    labelB: string;
}

export function ComparativeDashboard({ peopleA, peopleB, labelA, labelB }: Props) {
    const [topic, setTopic] = useState('');
    const [reactionsA, setReactionsA] = useState<Reaction[]>([]);
    const [reactionsB, setReactionsB] = useState<Reaction[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsSimulating(true);
        setTimeout(() => {
            setReactionsA(peopleA.map(p => simulateReaction(p, topic)));
            setReactionsB(peopleB.map(p => simulateReaction(p, topic)));
            setIsSimulating(false);
        }, 800);
    };

    const getStats = (reactions: Reaction[]) => ({
        positive: reactions.filter(r => r.sentiment === 'Positive').length,
        negative: reactions.filter(r => r.sentiment === 'Negative').length,
        neutral: reactions.filter(r => r.sentiment === 'Neutral').length,
        total: reactions.length,
        pct: reactions.length ? Math.round((reactions.filter(r => r.sentiment === 'Positive').length / reactions.length) * 100) : 0
    });

    const statsA = getStats(reactionsA);
    const statsB = getStats(reactionsB);

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900">Comparative Simulation</h2>
                </div>
                <form onSubmit={handleSimulate} className="flex gap-3">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter topic to compare..."
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isSimulating || !topic}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg disabled:opacity-50"
                    >
                        {isSimulating ? 'Running...' : 'Compare'}
                    </button>
                </form>
            </div>

            {/* Results */}
            {(reactionsA.length > 0 && reactionsB.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                    <ResultColumn label={labelA} stats={statsA} color="bg-blue-50 border-blue-100 text-blue-700" />
                    <ResultColumn label={labelB} stats={statsB} color="bg-purple-50 border-purple-100 text-purple-700" />
                </div>
            )}
        </div>
    );
}

function ResultColumn({ label, stats, color }: { label: string, stats: { positive: number, negative: number, neutral: number, total: number, pct: number }, color: string }) {
    return (
        <div className={clsx("rounded-xl border p-6 flex flex-col h-full", color)}>
            <h3 className="font-semibold text-lg mb-4 text-center">{label}</h3>

            <div className="flex-1 flex flex-col items-center justify-center mb-6">
                <div className="text-5xl font-bold mb-2">{stats.pct}%</div>
                <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Positive</div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm opacity-90">
                    <span>Positive</span>
                    <span className="font-bold">{stats.positive}</span>
                </div>
                <div className="flex justify-between text-sm opacity-90">
                    <span>Negative</span>
                    <span className="font-bold">{stats.negative}</span>
                </div>
                <div className="flex justify-between text-sm opacity-90">
                    <span>Neutral/Mixed</span>
                    <span className="font-bold">{stats.neutral + (stats.total - stats.positive - stats.negative - stats.neutral)}</span>
                </div>
                <div className="pt-2 border-t border-black/10 flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{stats.total}</span>
                </div>
            </div>
        </div>
    );
}
