'use client';

import { Person, ProductSpec } from '@/lib/types';
import {
    calculateConversionScore,
    segmentByConversion,
    analyzeWillingnessToPay,
    analyzeConversionBarriers,
    calculateMarketPotential,
    getPersonaAnalytics,
} from '@/lib/productAnalytics';
import { TrendingUp, DollarSign, Users, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface Props {
    people: Person[];
    productSpec: ProductSpec;
}

export function ProductAnalyticsDashboard({ people, productSpec }: Props) {
    const [selectedSegment, setSelectedSegment] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    // Calculate all analytics
    const segments = segmentByConversion(people);
    const wtpAnalysis = analyzeWillingnessToPay(people, productSpec.price);
    const barriers = analyzeConversionBarriers(people);
    const marketPotential = calculateMarketPotential(people, productSpec.price);

    // Filter people by selected segment
    const filteredPeople = selectedSegment === 'all'
        ? people
        : selectedSegment === 'high'
            ? segments.highIntent
            : selectedSegment === 'medium'
                ? segments.mediumIntent
                : segments.lowIntent;

    // Get analytics for each person
    const personaAnalytics = filteredPeople.map(person => ({
        person,
        analytics: getPersonaAnalytics(person, productSpec.price),
    })).sort((a, b) => b.analytics.conversionScore - a.analytics.conversionScore);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Product Analytics</h2>
                </div>
                <p className="text-indigo-100">Market insights for <span className="font-semibold">{productSpec.name}</span></p>
            </div>

            {/* Market Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* High Intent */}
                <button
                    onClick={() => setSelectedSegment('high')}
                    className={clsx(
                        "bg-white rounded-xl p-5 border-2 transition-all text-left hover:shadow-lg",
                        selectedSegment === 'high' ? 'border-green-500 shadow-lg' : 'border-slate-200'
                    )}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-3xl font-bold text-green-600">
                            {Math.round((segments.highIntent.length / people.length) * 100)}%
                        </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">High Intent</h3>
                    <p className="text-sm text-slate-500">{segments.highIntent.length} likely buyers</p>
                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500"
                            style={{ width: `${(segments.highIntent.length / people.length) * 100}%` }}
                        />
                    </div>
                </button>

                {/* Medium Intent */}
                <button
                    onClick={() => setSelectedSegment('medium')}
                    className={clsx(
                        "bg-white rounded-xl p-5 border-2 transition-all text-left hover:shadow-lg",
                        selectedSegment === 'medium' ? 'border-yellow-500 shadow-lg' : 'border-slate-200'
                    )}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Target className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-3xl font-bold text-yellow-600">
                            {Math.round((segments.mediumIntent.length / people.length) * 100)}%
                        </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">Medium Intent</h3>
                    <p className="text-sm text-slate-500">{segments.mediumIntent.length} potential buyers</p>
                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${(segments.mediumIntent.length / people.length) * 100}%` }}
                        />
                    </div>
                </button>

                {/* Low Intent */}
                <button
                    onClick={() => setSelectedSegment('low')}
                    className={clsx(
                        "bg-white rounded-xl p-5 border-2 transition-all text-left hover:shadow-lg",
                        selectedSegment === 'low' ? 'border-red-500 shadow-lg' : 'border-slate-200'
                    )}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-3xl font-bold text-red-600">
                            {Math.round((segments.lowIntent.length / people.length) * 100)}%
                        </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">Low Intent</h3>
                    <p className="text-sm text-slate-500">{segments.lowIntent.length} unlikely buyers</p>
                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500"
                            style={{ width: `${(segments.lowIntent.length / people.length) * 100}%` }}
                        />
                    </div>
                </button>
            </div>

            {/* Revenue Potential */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Revenue Potential</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                        <div className="text-sm text-indigo-600 font-medium mb-1">Estimated Buyers</div>
                        <div className="text-2xl font-bold text-indigo-900">{marketPotential.estimatedBuyers}</div>
                        <div className="text-xs text-indigo-600 mt-1">{marketPotential.conversionRate}% conversion</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 font-medium mb-1">Monthly Revenue</div>
                        <div className="text-2xl font-bold text-green-900">${marketPotential.monthlyRevenuePotential.toLocaleString()}</div>
                        <div className="text-xs text-green-600 mt-1">Based on {productSpec.price}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 font-medium mb-1">Annual Revenue</div>
                        <div className="text-2xl font-bold text-purple-900">${marketPotential.annualRevenuePotential.toLocaleString()}</div>
                        <div className="text-xs text-purple-600 mt-1">Projected ARR</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 font-medium mb-1">Optimal Price</div>
                        <div className="text-2xl font-bold text-blue-900">${wtpAnalysis.optimalPrice}</div>
                        <div className="text-xs text-blue-600 mt-1">Median WTP</div>
                    </div>
                </div>
            </div>

            {/* Top Barriers */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Top Conversion Barriers</h3>
                </div>
                <div className="space-y-3">
                    {barriers.map((barrier, idx) => (
                        <div key={barrier.barrier} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-slate-900">{barrier.barrier}</span>
                                    <span className="text-sm font-semibold text-slate-600">{barrier.percentage}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={clsx(
                                            "h-full",
                                            idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                                        )}
                                        style={{ width: `${barrier.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-slate-500">{barrier.count} people</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Persona Conversion Scores */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Persona Conversion Scores</h3>
                    </div>
                    {selectedSegment !== 'all' && (
                        <button
                            onClick={() => setSelectedSegment('all')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Show All
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase">Name</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase">Score</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase">Segment</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase">Max WTP</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-slate-600 uppercase">Primary Barrier</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personaAnalytics.map(({ person, analytics }) => (
                                <tr key={person.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <img src={person.avatarUrl} alt={person.name} className="w-8 h-8 rounded-full" />
                                            <div>
                                                <div className="font-medium text-slate-900 text-sm">{person.name}</div>
                                                <div className="text-xs text-slate-500">{person.demographics.occupation}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "text-lg font-bold",
                                                analytics.conversionScore >= 70 ? 'text-green-600' :
                                                    analytics.conversionScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                                            )}>
                                                {analytics.conversionScore}
                                            </span>
                                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        "h-full",
                                                        analytics.conversionScore >= 70 ? 'bg-green-500' :
                                                            analytics.conversionScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                    )}
                                                    style={{ width: `${analytics.conversionScore}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            analytics.segment === 'High Intent' ? 'bg-green-100 text-green-700' :
                                                analytics.segment === 'Medium Intent' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                        )}>
                                            {analytics.segment}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className={clsx(
                                            "font-semibold",
                                            analytics.willPay ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            ${analytics.maxPrice}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <span className="text-sm text-slate-600">{analytics.primaryBarrier}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
