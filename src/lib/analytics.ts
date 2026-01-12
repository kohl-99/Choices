import { Person, Reaction, ReactionSentiment, Demographics, PoliticalAffiliation } from './types';

export interface BreakdownResult {
    label: string;
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    positivePercent: number;
    negativePercent: number;
}

export function calculateBreakdown(
    reactions: Reaction[],
    people: Person[],
    key: 'politics' | 'hometownType' | 'ageGroup'
): BreakdownResult[] {
    const map = new Map<string, { pos: number; neg: number; neu: number; mixed: number; total: number }>();

    reactions.forEach(r => {
        const person = people.find(p => p.id === r.personId);
        if (!person) return;

        let groupLabel = '';

        if (key === 'politics') {
            groupLabel = person.politics;
        } else if (key === 'hometownType') {
            groupLabel = person.demographics.hometownType;
        } else if (key === 'ageGroup') {
            const age = person.demographics.age;
            if (age < 30) groupLabel = '18-29';
            else if (age < 50) groupLabel = '30-49';
            else if (age < 65) groupLabel = '50-64';
            else groupLabel = '65+';
        }

        if (!map.has(groupLabel)) {
            map.set(groupLabel, { pos: 0, neg: 0, neu: 0, mixed: 0, total: 0 });
        }

        const stats = map.get(groupLabel)!;
        stats.total++;
        if (r.sentiment === 'Positive') stats.pos++;
        else if (r.sentiment === 'Negative') stats.neg++;
        else if (r.sentiment === 'Neutral') stats.neu++;
        else if (r.sentiment === 'Mixed') stats.mixed++;
    });

    const results: BreakdownResult[] = [];
    map.forEach((stats, label) => {
        results.push({
            label,
            total: stats.total,
            positive: stats.pos,
            negative: stats.neg,
            neutral: stats.neu,
            mixed: stats.mixed,
            positivePercent: Math.round((stats.pos / stats.total) * 100),
            negativePercent: Math.round((stats.neg / stats.total) * 100),
        });
    });

    // Sort by label usually, or by most total? Let's sort alphabetically for now, or specific order for Age
    if (key === 'ageGroup') {
        const order = ['18-29', '30-49', '50-64', '65+'];
        return results.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
    }

    // Sort politics relative to spectrum? 
    if (key === 'politics') {
        const order = ['Far Left', 'Liberal', 'Moderate', 'Apolitical', 'Conservative', 'Far Right', 'Libertarian', 'Green'];
        return results.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
    }

    return results.sort((a, b) => a.label.localeCompare(b.label));
}
