import { Person, Gender, Race, EducationLevel, Religion, PoliticalAffiliation, BigFiveTraits, CognitiveBiases } from './types';

// Helper to get random item from array
function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper for weighted random (simple implementation)
function getWeighted<T>(items: { item: T; weight: number }[]): T {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let random = Math.random() * totalWeight;
    for (const { item, weight } of items) {
        random -= weight;
        if (random <= 0) return item;
    }
    return items[items.length - 1].item;
}

// Names for generation (Just a small subset for MVP)
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Liam', 'Emma', 'Noah', 'Olivia', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

function generateName(): string {
    return `${getRandom(firstNames)} ${getRandom(lastNames)}`;
}

// Gaussian random for better trait distribution
function gaussianRandom(mean = 0.5, stdev = 0.15): number {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    let val = z * stdev + mean;
    return Math.max(0, Math.min(1, val)); // Clamp between 0 and 1
}

function generatePersonality(): BigFiveTraits {
    return {
        openness: gaussianRandom(0.5, 0.2),
        conscientiousness: gaussianRandom(0.5, 0.2),
        extraversion: gaussianRandom(0.5, 0.2),
        agreeableness: gaussianRandom(0.5, 0.2),
        neuroticism: gaussianRandom(0.5, 0.2),
    };
}

function generateBiases(personality: BigFiveTraits): CognitiveBiases {
    // Biases often correlate with personality traits
    // e.g., Low openness might correlate with statusQuoBias

    return {
        confirmationBias: gaussianRandom(0.5 + (1 - personality.openness) * 0.1, 0.15),
        statusQuoBias: gaussianRandom(0.5 + (1 - personality.openness) * 0.2, 0.15),
        authorityBias: gaussianRandom(0.5 + (personality.conscientiousness) * 0.1, 0.15),
        negativityBias: gaussianRandom(0.5 + (personality.neuroticism) * 0.2, 0.15),
    };
}

export function generatePerson(): Person {
    const demographics: Person['demographics'] = {
        age: Math.floor(gaussianRandom(40, 15) * 100) / 100 > 18 ? Math.floor(gaussianRandom(40, 15)) : 18 + Math.floor(Math.random() * 60),
        gender: getWeighted([
            { item: 'Male', weight: 49 },
            { item: 'Female', weight: 49 },
            { item: 'Non-binary', weight: 1.5 },
            { item: 'Other', weight: 0.5 },
        ]),
        race: getWeighted([
            { item: 'White', weight: 60 },
            { item: 'Black or African American', weight: 13 },
            { item: 'Hispanic or Latino', weight: 18 },
            { item: 'Asian', weight: 6 },
            { item: 'Mixed', weight: 2 },
            { item: 'Other', weight: 1 },
        ]),
        education: getWeighted([
            { item: 'Less than High School', weight: 10 },
            { item: 'High School Diploma', weight: 28 },
            { item: 'Some College', weight: 15 },
            { item: 'Bachelor\'s Degree', weight: 23 },
            { item: 'Master\'s Degree', weight: 10 },
            { item: 'Doctorate', weight: 2 },
            { item: 'Vocational', weight: 12 },
        ]),
        religion: getWeighted([
            { item: 'Christianity', weight: 63 },
            { item: 'Atheist/Agnostic', weight: 20 },
            { item: 'Judaism', weight: 2 },
            { item: 'Islam', weight: 1 },
            { item: 'Buddhism', weight: 1 },
            { item: 'Spiritual but not religious', weight: 10 },
            { item: 'Other', weight: 3 },
        ]),
        hometownType: getWeighted([
            { item: 'Urban', weight: 35 },
            { item: 'Suburban', weight: 45 },
            { item: 'Rural', weight: 20 },
        ]),
        incomeLevel: getWeighted([
            { item: 'Low', weight: 30 },
            { item: 'Middle', weight: 50 },
            { item: 'High', weight: 20 },
        ]),
        occupation: getRandom(['Teacher', 'Engineer', 'Nurse', 'Manager', 'Salesperson', 'Artist', 'Driver', 'Student', 'Retired', 'Lawyer', 'Accountant', 'Developer', 'Designer', 'Chef', 'Mechanic']),
    };

    const personality = generatePersonality();
    const biases = generateBiases(personality);

    // Simple heuristic for politics based on demographics and personality
    // NOT scientifically accurate, just for MVP demonstration
    // Urban + Young + High Openness -> Tend Liberal
    // Rural + Older + High Conscientiousness -> Tend Conservative

    let liberalScore = 0.5;

    // Demographics adjustments
    if (demographics.hometownType === 'Urban') liberalScore += 0.1;
    if (demographics.hometownType === 'Rural') liberalScore -= 0.1;
    if (demographics.age < 35) liberalScore += 0.1;
    if (demographics.age > 55) liberalScore -= 0.1;
    if (demographics.education === 'Master\'s Degree' || demographics.education === 'Doctorate') liberalScore += 0.1;
    if (demographics.religion === 'Christianity') liberalScore -= 0.05;

    // Personality adjustments
    liberalScore += (personality.openness - 0.5) * 0.4; // High openness correlates with liberalism
    liberalScore -= (personality.conscientiousness - 0.5) * 0.2; // High conscientiousness correlates with conservatism (slightly)

    const politics: PoliticalAffiliation = (() => {
        const val = Math.random() + (liberalScore - 0.5); // Add noise
        if (val > 0.8) return 'Far Left';
        if (val > 0.6) return 'Liberal';
        if (val > 0.45) return 'Moderate';
        if (val > 0.25) return 'Conservative';
        return 'Far Right';  // Simplified
    })();

    return {
        id: crypto.randomUUID(),
        name: generateName(),
        demographics,
        politics,
        personality,
        biases,
        // Use a placeholder avatar service
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demographics.gender}-${generateName()}`,
    };
}

export function generateCohort(size: number): Person[] {
    return Array.from({ length: size }, () => generatePerson());
}
