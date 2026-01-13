import { Person, Race, Religion, PoliticalAffiliation, BigFiveTraits, CognitiveBiases, Region } from './types';

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

// Region Data Configuration
interface RegionProfile {
    firstNames: string[];
    lastNames: string[];
    raceWeights: { item: Race; weight: number }[];
    religionWeights: { item: Religion; weight: number }[];
}

const regionData: Record<Region, RegionProfile> = {
    'US': {
        firstNames: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Liam', 'Emma', 'Noah', 'Olivia', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia'],
        lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'],
        raceWeights: [
            { item: 'White', weight: 60 },
            { item: 'Black or African American', weight: 13 },
            { item: 'Hispanic or Latino', weight: 18 },
            { item: 'Asian', weight: 6 },
            { item: 'Mixed', weight: 2 },
            { item: 'Other', weight: 1 },
        ],
        religionWeights: [
            { item: 'Christianity', weight: 63 },
            { item: 'Atheist/Agnostic', weight: 20 },
            { item: 'Judaism', weight: 2 },
            { item: 'Islam', weight: 1 },
            { item: 'Buddhism', weight: 1 },
            { item: 'Spiritual but not religious', weight: 10 },
            { item: 'Other', weight: 3 },
        ]
    },
    'SEA': {
        firstNames: ['Wei', 'Siti', 'Budi', 'Lestari', 'Nguyen', 'Tan', 'Lim', 'Rizal', 'Ahmad', 'Noor', 'Maria', 'Jose', 'Santos', 'Reyes', 'Somchai', 'Somsak', 'Arthit', 'Kamala', 'Ananda', 'Perera', 'Silva', 'Devi', 'Kumar', 'Fatima', 'Aisha', 'Ibrahim', 'Chai', 'Mei', 'Jia', 'Hui'],
        lastNames: ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Tan', 'Lim', 'Lee', 'Wong', 'Chua', 'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Widodo', 'Putri', 'Sari', 'Kusuma', 'Perera'],
        raceWeights: [
            { item: 'Asian', weight: 85 },
            { item: 'Mixed', weight: 10 },
            { item: 'Other', weight: 5 },
            { item: 'White', weight: 0 }, // For simplicity in MVP
            { item: 'Black or African American', weight: 0 },
            { item: 'Hispanic or Latino', weight: 0 },
        ],
        religionWeights: [
            { item: 'Islam', weight: 40 },
            { item: 'Buddhism', weight: 35 },
            { item: 'Christianity', weight: 15 },
            { item: 'Hinduism', weight: 5 },
            { item: 'Atheist/Agnostic', weight: 5 },
            { item: 'Spiritual but not religious', weight: 0 },
            { item: 'Other', weight: 0 },
        ]
    },
    'EU': {
        firstNames: ['Sophie', 'Liam', 'Maria', 'Noah', 'Emma', 'Oliver', 'Olivia', 'George', 'Charlotte', 'Arthur', 'Isla', 'Harry', 'Amelia', 'Leo', 'Grace', 'Louis', 'Freya', 'Max', 'Lily', 'Oscar'],
        lastNames: ['Schmidt', 'Dubois', 'Rossi', 'Garcia', 'Müller', 'Silva', 'Jensen', 'Novak', 'Smirnov', 'Jones', 'Davies', 'Patel', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Wright', 'Robinson', 'Thompson', 'White'],
        raceWeights: [
            { item: 'White', weight: 85 },
            { item: 'Mixed', weight: 5 },
            { item: 'Asian', weight: 4 },
            { item: 'Black or African American', weight: 3 },
            { item: 'Other', weight: 3 },
            { item: 'Hispanic or Latino', weight: 0 }, // For simplicity in MVP
        ],
        religionWeights: [
            { item: 'Christianity', weight: 60 },
            { item: 'Atheist/Agnostic', weight: 25 },
            { item: 'Islam', weight: 5 },
            { item: 'Judaism', weight: 1 },
            { item: 'Buddhism', weight: 1 },
            { item: 'Spiritual but not religious', weight: 5 },
            { item: 'Other', weight: 3 },
        ]
    }
};

function generateName(region: Region = 'US'): string {
    const data = regionData[region];
    return `${getRandom(data.firstNames)} ${getRandom(data.lastNames)}`;
}

// Gaussian random for better trait distribution
function gaussianRandom(mean = 0.5, stdev = 0.15): number {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const val = z * stdev + mean;
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

export function generatePerson(region: Region = 'US', ageMean: number = 40, ageStDev: number = 15): Person {
    const data = regionData[region];
    const demographics: Person['demographics'] = {
        age: Math.floor(gaussianRandom(ageMean, ageStDev) * 100) / 100 > 18 ? Math.floor(gaussianRandom(ageMean, ageStDev)) : 18 + Math.floor(Math.random() * 60),
        gender: getWeighted([
            { item: 'Male', weight: 49 },
            { item: 'Female', weight: 49 },
            { item: 'Non-binary', weight: 1.5 },
            { item: 'Other', weight: 0.5 },
        ]),
        race: getWeighted(data.raceWeights),
        education: getWeighted([
            { item: 'Less than High School', weight: 10 },
            { item: 'High School Diploma', weight: 28 },
            { item: 'Some College', weight: 15 },
            { item: 'Bachelor\'s Degree', weight: 23 },
            { item: 'Master\'s Degree', weight: 10 },
            { item: 'Doctorate', weight: 2 },
            { item: 'Vocational', weight: 12 },
        ]),
        religion: getWeighted(data.religionWeights),
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
    if (demographics.religion === 'Christianity' || demographics.religion === 'Islam') liberalScore -= 0.05;

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
        name: generateName(region),
        demographics,
        politics,
        personality,
        biases,
        // Use a placeholder avatar service
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demographics.gender}-${generateName(region)}`,
    };
}

export function generateCohort(size: number, region: Region = 'US'): Person[] {
    return Array.from({ length: size }, () => generatePerson(region));
}

export function generateProductCohort(): Person[] {
    return [
        {
            id: 'p_dreamer',
            name: 'Li Xiang',
            demographics: {
                age: 20,
                gender: 'Male',
                race: 'Asian',
                education: 'Some College',
                religion: 'Atheist/Agnostic',
                hometownType: 'Urban',
                incomeLevel: 'Low',
                occupation: 'CS Student'
            },
            politics: 'Liberal',
            personality: { openness: 0.9, conscientiousness: 0.3, extraversion: 0.4, agreeableness: 0.6, neuroticism: 0.7 },
            biases: { confirmationBias: 0.8, statusQuoBias: 0.4, authorityBias: 0.2, negativityBias: 0.6 },
            background: 'Sophomore majoring in Computer Science, deeply passionate about AI technologies.',
            goals: 'Wants to "build something big" before graduation and has countless vague "AI + X" ideas floating in his head.',
            specificBarriers: {
                priceSensitivity: 'Extremely high. He believes all information should be freely available online. Any purchase costing more than a single takeout meal makes him hesitate.',
                loyalty: 'Loyal to free, mainstream platforms. He spends a lot of time searching on Bilibili, Zhihu, and Google.',
                skepticism: '“This looks like another student project—can it really be trusted? Won’t AI just give me a bunch of technically correct but useless advice?”'
            }
        },
        {
            id: 'p_doer',
            name: 'Wang Min',
            demographics: {
                age: 21,
                gender: 'Female',
                race: 'Asian',
                education: 'Bachelor\'s Degree',
                religion: 'Other',
                hometownType: 'Urban',
                incomeLevel: 'Middle',
                occupation: 'Business Student'
            },
            politics: 'Moderate',
            personality: { openness: 0.6, conscientiousness: 0.9, extraversion: 0.8, agreeableness: 0.5, neuroticism: 0.4 },
            biases: { confirmationBias: 0.4, statusQuoBias: 0.7, authorityBias: 0.6, negativityBias: 0.4 },
            background: 'Junior business school student, currently forming a team to participate in a national entrepreneurship competition.',
            goals: 'Needs to quickly refine a business plan (BP) and use AI-driven analysis to validate market assumptions.',
            specificBarriers: {
                priceSensitivity: 'Moderate. Willing to pay a limited amount for tools that clearly increase success chances, but needs clear ROI.',
                loyalty: 'Accustomed to Notion and Trello. Learning a new tool comes with a time cost.',
                skepticism: '“Will judges actually认可 AI-generated analysis? What are the data sources? If it’s just generic templates, it’s completely useless.”'
            }
        },
        {
            id: 'p_follower',
            name: 'Zhang Wei',
            demographics: {
                age: 19,
                gender: 'Male',
                race: 'Asian',
                education: 'Some College',
                religion: 'Atheist/Agnostic',
                hometownType: 'Suburban',
                incomeLevel: 'Low',
                occupation: 'Freshman'
            },
            politics: 'Apolitical',
            personality: { openness: 0.5, conscientiousness: 0.2, extraversion: 0.7, agreeableness: 0.8, neuroticism: 0.6 },
            biases: { confirmationBias: 0.2, statusQuoBias: 0.1, authorityBias: 0.4, negativityBias: 0.1 },
            background: 'Freshman, major unspecified. Surrounded by constant talk about AI, he feels both anxious and curious.',
            goals: 'Just wants to "check it out" and see what AI entrepreneurship is about, mainly to pick up some cool talking points.',
            specificBarriers: {
                priceSensitivity: 'Infinite (Zero willingness). Driven purely by curiosity—unless it’s completely free, he won’t use it.',
                loyalty: 'None. He is a blank slate, which also means he has no stickiness.',
                skepticism: '“How is this any different from those ‘get rich quick’ courses? Is it just another gimmick?”'
            }
        }
    ];
}
