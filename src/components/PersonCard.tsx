import { Person, BigFiveTraits } from '@/lib/types';
import { User, Brain, Heart, Zap, Anchor, Activity, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import clsx from 'clsx';

function TraitBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-24 font-medium text-slate-500">{label}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={clsx("h-full rounded-full", color)}
                    style={{ width: `${value * 100}%` }}
                />
            </div>
        </div>
    );
}

export function PersonCard({ person }: { person: Person }) {
    // Color coding for politics
    const polColor = {
        'Far Left': 'bg-blue-600 text-white',
        'Liberal': 'bg-blue-500 text-white',
        'Moderate': 'bg-purple-500 text-white',
        'Conservative': 'bg-red-500 text-white',
        'Far Right': 'bg-red-700 text-white',
        'Libertarian': 'bg-yellow-500 text-black',
        'Green': 'bg-green-500 text-white',
        'Apolitical': 'bg-gray-400 text-white',
    }[person.politics] || 'bg-gray-400 text-white';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{person.name}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                        <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", polColor)}>
                            {person.politics}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium uppercase tracking-wider">
                            {person.demographics.age}yo
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 opacity-50" />
                    <span className="truncate" title={person.demographics.education}>{person.demographics.education}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 opacity-50" />
                    <span className="truncate" title={person.demographics.incomeLevel + " Income"}>{person.demographics.incomeLevel} Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 opacity-50" />
                    <span className="truncate">{person.demographics.hometownType}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3.5 text-center opacity-50 font-serif">✝</span>
                    <span className="truncate">{person.demographics.religion}</span>
                </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <TraitBar label="Openness" value={person.personality.openness} color="bg-indigo-500" />
                <TraitBar label="Conscientiousness" value={person.personality.conscientiousness} color="bg-emerald-500" />
                <TraitBar label="Extraversion" value={person.personality.extraversion} color="bg-orange-500" />
                <TraitBar label="Agreeableness" value={person.personality.agreeableness} color="bg-pink-500" />
                <TraitBar label="Neuroticism" value={person.personality.neuroticism} color="bg-slate-500" />
            </div>

            {/* Biases peek */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div className="text-[10px] text-slate-500">
                    Auth Bias: <span className="font-medium text-slate-700">{Math.round(person.biases.authorityBias * 100)}%</span>
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                    Neg Bias: <span className="font-medium text-slate-700">{Math.round(person.biases.negativityBias * 100)}%</span>
                </div>
            </div>
        </div>
    );
}
