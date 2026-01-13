'use client';

import { RefreshCw, Users, Globe, ShoppingBag } from 'lucide-react';
import { Region, ScenarioType, ProductSpec } from '@/lib/types';
import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';

interface GeneratorProps {
    onGenerate: (count: number, region: Region) => void;
    isGenerating: boolean;
    scenario?: ScenarioType;
    productSpec?: ProductSpec;
    setProductSpec?: Dispatch<SetStateAction<ProductSpec>>;
}

import { useState } from 'react';

export function GeneratorForm({ onGenerate, isGenerating, scenario, productSpec, setProductSpec }: GeneratorProps) {
    const [selectedRegion, setSelectedRegion] = useState<Region>('US'); // Default to US

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Users className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Cohort Generator</h2>
            </div>

            <div className="mb-6 space-y-3">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    Target Region
                </label>
                <select
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value as Region)}
                >
                    <option value="US">🇺🇸 United States</option>
                    <option value="SEA">🌏 South East Asia</option>
                    <option value="EU">🇪🇺 Europe</option>
                </select>
            </div>

            {/* Product Inputs (Only in Product Launch Mode) */}
            {scenario === 'PRODUCT_LAUNCH' && productSpec && setProductSpec && (
                <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        Target Product Context
                    </label>
                    <div className="text-xs text-slate-500 mb-2">
                        Fill this to generate personas specifically tailored to your product. Leave empty for generic personas.
                    </div>

                    <input
                        type="text"
                        placeholder="Product Name"
                        value={productSpec.name}
                        onChange={(e) => setProductSpec({ ...productSpec, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Value Prop (e.g. AI Tutor)"
                        value={productSpec.prop}
                        onChange={(e) => setProductSpec({ ...productSpec, prop: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Price (e.g. $50)"
                        value={productSpec.price}
                        onChange={(e) => setProductSpec({ ...productSpec, price: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Competitor (optional)"
                        value={productSpec.competitor}
                        onChange={(e) => setProductSpec({ ...productSpec, competitor: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            )}

            <button
                onClick={() => onGenerate(12, selectedRegion)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Generate New Cohort'}
            </button>
        </div>
    );
}
