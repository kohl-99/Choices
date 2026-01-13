import { Person, Reaction } from './types';

// Helper to sanitize fields for CSV (escape quotes, handle commas)
const sanitize = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => headers.map(header => sanitize(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export function flattenReactionsForExport(reactions: Reaction[], people: Person[], topic: string) {
    return reactions.map(r => {
        const person = people.find(p => p.id === r.personId);
        return {
            ID: person?.id.substring(0, 8), // Short ID
            Name: person?.name || 'Unknown',
            Age: person?.demographics.age,
            Gender: person?.demographics.gender,
            Location: person?.demographics.hometownType,
            Politics: person?.politics,
            Topic: topic,
            Sentiment: r.sentiment,
            Interest: r.interestLevel,
            Comment: r.comment
        };
    });
}
