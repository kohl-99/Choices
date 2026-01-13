'use client';

import { Person } from '@/lib/types';
import { Wallet, Anchor, AlertTriangle, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface Props {
    person: Person;
}

export function ProductPersonaCard({ person }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!person.specificBarriers) return null;

    // Extract barrier values from biases (these map to product barriers)
    const priceSensitivity = person.biases.confirmationBias;
    const toolLoyalty = person.biases.statusQuoBias;
    const skepticism = person.biases.negativityBias;

    const renderMeter = (value: number, label: string, icon: any) => {
        const colorClass = value > 0.7 ? 'bg-red-500' : value > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
        const statusText = value > 0.7 ? 'High' : value > 0.4 ? 'Medium' : 'Low';
        const statusColor = value > 0.7 ? 'text-red-600' : value > 0.4 ? 'text-yellow-600' : 'text-green-600';

        return (
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {icon}
                        <span className="text-xs font-medium text-slate-700">{label}</span>
                    </div>
                    <span className={clsx('text-xs font-bold', statusColor)}>{statusText}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={clsx('h-full rounded-full transition-all', colorClass)}
                        style={{ width: `${value * 100}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-white border-b border-indigo-100">
                <div className="flex items-start gap-3">
                    <img
                        src={person.avatarUrl}
                        alt={person.name}
                        className="w-14 h-14 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-base truncate">{person.name}</h3>
                        <p className="text-sm text-indigo-700 flex items-center gap-1 mt-0.5 font-medium">
                            <Briefcase className="w-3.5 h-3.5" />
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

            {/* Barriers Visual Dashboard */}
            <div className="p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Buying Obstacles</h4>

                {renderMeter(priceSensitivity, 'Price Sensitivity', <Wallet className="w-3.5 h-3.5 text-slate-400" />)}
                {renderMeter(toolLoyalty, 'Tool Loyalty', <Anchor className="w-3.5 h-3.5 text-slate-400" />)}
                {renderMeter(skepticism, 'Skepticism', <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />)}
            </div>

            {/* Expandable Details */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Background */}
                    {person.background && (
                        <div className="bg-slate-50 rounded-lg p-3">
                            <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Background</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">{person.background}</p>
                        </div>
                    )}

                    {/* Goals */}
                    {person.goals && (
                        <div className="bg-indigo-50 rounded-lg p-3">
                            <h5 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-1.5">Goals</h5>
                            <p className="text-xs text-indigo-800 leading-relaxed">{person.goals}</p>
                        </div>
                    )}

                    {/* Detailed Barriers */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Barrier Details</h5>

                        <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Wallet className="w-3.5 h-3.5 text-red-600" />
                                <span className="text-xs font-bold text-red-900">Price Sensitivity</span>
                            </div>
                            <p className="text-xs text-red-800 leading-relaxed">{person.specificBarriers.priceSensitivity}</p>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Anchor className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-xs font-bold text-amber-900">Tool Loyalty</span>
                            </div>
                            <p className="text-xs text-amber-800 leading-relaxed">{person.specificBarriers.loyalty}</p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                            <div className="flex items-center gap-1.5 mb-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-bold text-blue-900">Skepticism</span>
                            </div>
                            <p className="text-xs text-blue-800 leading-relaxed">{person.specificBarriers.skepticism}</p>
                        </div>
                    </div>
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
                            View Full Analysis
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
