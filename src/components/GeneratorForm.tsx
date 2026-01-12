'use client';

import { RefreshCw, Users } from 'lucide-react';

interface GeneratorProps {
    onGenerate: (count: number) => void;
    isGenerating: boolean;
}

export function GeneratorForm({ onGenerate, isGenerating }: GeneratorProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Users className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Cohort Generator</h2>
            </div>

            <p className="text-sm text-slate-500 mb-6">
                Generate a synthetic population based on real-world demographic and psychometric distributions.
            </p>

            <button
                onClick={() => onGenerate(12)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Generate New Cohort'}
            </button>
        </div>
    );
}
