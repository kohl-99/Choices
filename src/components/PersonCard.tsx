'use client';

import { Person, ScenarioType } from '@/lib/types';
import { User, MapPin, GraduationCap, Briefcase, DollarSign, Church, Home, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export function PersonCard({ person, scenario = 'GENERAL' }: { person: Person; onChat?: (p: Person) => void, scenario?: ScenarioType }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const politicsColor = {
        'Very Liberal': 'bg-blue-600 text-white',
        'Liberal': 'bg-blue-500 text-white',
        'Moderate': 'bg-purple-500 text-white',
        'Conservative': 'bg-red-500 text-white',
        'Very Conservative': 'bg-red-600 text-white',
    }[person.politics] || 'bg-slate-500 text-white';

    const incomeColor = {
        'Low': 'text-orange-600 bg-orange-50 border-orange-200',
        'Middle': 'text-green-600 bg-green-50 border-green-200',
        'High': 'text-blue-600 bg-blue-50 border-blue-200',
    }[person.demographics.incomeLevel] || 'text-slate-600 bg-slate-50 border-slate-200';

    const educationShort = {
        'High School': 'HS',
        'Some College': 'Some College',
        'Bachelor\'s Degree': 'Bachelor\'s',
        'Master\'s Degree': 'Master\'s',
        'Doctorate': 'PhD',
    }[person.demographics.education] || person.demographics.education;

    // Determine which traits to show based on scenario
    const traits = scenario === 'GENERAL'
        ? [
            { label: 'Openness', value: person.personality.openness },
            { label: 'Conscientiousness', value: person.personality.conscientiousness },
            { label: 'Extraversion', value: person.personality.extraversion },
            { label: 'Agreeableness', value: person.personality.agreeableness },
            { label: 'Neuroticism', value: person.personality.neuroticism },
        ]
        : scenario === 'PRODUCT_LAUNCH'
            ? [
                { label: 'Price Sensitivity', value: person.biases.confirmationBias },
                { label: 'Tool Loyalty', value: person.biases.statusQuoBias },
                { label: 'Skepticism', value: person.biases.negativityBias },
            ]
            : [
                { label: 'Confirmation Bias', value: person.biases.confirmationBias },
                { label: 'Status Quo Bias', value: person.biases.statusQuoBias },
                { label: 'Authority Bias', value: person.biases.authorityBias },
            ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-start gap-3">
                    <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="w-14 h-14 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base truncate">{person.name}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{person.demographics.occupation}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-medium text-slate-500">{person.demographics.age} yrs</span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{person.demographics.gender}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                <div className="flex flex-wrap gap-1.5">
                    <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', politicsColor)}>
                        {person.politics}
                    </span>
                    <span className={clsx('text-xs font-medium px-2 py-1 rounded-full border', incomeColor)}>
                        <DollarSign className="w-3 h-3 inline mr-0.5" />
                        {person.demographics.incomeLevel}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                        <GraduationCap className="w-3 h-3 inline mr-0.5" />
                        {educationShort}
                    </span>
                </div>
            </div>

            {/* Traits Preview */}
            <div className="p-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    {scenario === 'GENERAL' ? 'Personality' : scenario === 'PRODUCT_LAUNCH' ? 'Buying Obstacles' : 'Biases'}
                </h4>
                {traits.slice(0, 3).map((trait) => (
                    <div key={trait.label} className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 w-24 truncate">{trait.label}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={clsx(
                                    'h-full rounded-full transition-all',
                                    trait.value > 0.7 ? 'bg-red-500' : trait.value > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                                )}
                                style={{ width: `${trait.value * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-slate-500 w-8 text-right">
                            {Math.round(trait.value * 100)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Expandable Details */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* All Traits */}
                    {traits.length > 3 && (
                        <div className="space-y-2">
                            {traits.slice(3).map((trait) => (
                                <div key={trait.label} className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600 w-24 truncate">{trait.label}</span>
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={clsx(
                                                'h-full rounded-full transition-all',
                                                trait.value > 0.7 ? 'bg-red-500' : trait.value > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                                            )}
                                            style={{ width: `${trait.value * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 w-8 text-right">
                                        {Math.round(trait.value * 100)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Demographics */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                        <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Demographics</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                                <Home className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-600">{person.demographics.hometownType}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Church className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-600">{person.demographics.religion}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-600">{person.demographics.race}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-600">{person.demographics.education}</span>
                            </div>
                        </div>
                    </div>

                    {/* Background (if available from LLM) */}
                    {person.background && (
                        <div className="bg-indigo-50 rounded-lg p-3">
                            <h5 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-1.5">Background</h5>
                            <p className="text-xs text-indigo-800 leading-relaxed">{person.background}</p>
                        </div>
                    )}

                    {/* Goals (if available from LLM) */}
                    {person.goals && (
                        <div className="bg-green-50 rounded-lg p-3">
                            <h5 className="text-xs font-semibold text-green-900 uppercase tracking-wide mb-1.5">Goals</h5>
                            <p className="text-xs text-green-800 leading-relaxed">{person.goals}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Expand/Collapse Button */}
            <div className="px-4 pb-3">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            View Full Profile
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
