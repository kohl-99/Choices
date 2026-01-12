export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Other';

export type Race =
    | 'White'
    | 'Black or African American'
    | 'Asian'
    | 'Hispanic or Latino'
    | 'Native American'
    | 'Pacific Islander'
    | 'Mixed'
    | 'Other';

export type EducationLevel =
    | 'Less than High School'
    | 'High School Diploma'
    | 'Some College'
    | 'Bachelor\'s Degree'
    | 'Master\'s Degree'
    | 'Doctorate'
    | 'Vocational';

export type Religion =
    | 'Christianity'
    | 'Islam'
    | 'Judaism'
    | 'Hinduism'
    | 'Buddhism'
    | 'Atheist/Agnostic'
    | 'Spiritual but not religious'
    | 'Other';

export type PoliticalAffiliation =
    | 'Far Left'
    | 'Liberal'
    | 'Moderate'
    | 'Conservative'
    | 'Far Right'
    | 'Libertarian'
    | 'Green'
    | 'Apolitical';

export interface BigFiveTraits {
    openness: number;        // 0-1: Inventive/Curious vs. Consistent/Cautious
    conscientiousness: number; // 0-1: Efficient/Organized vs. Easy-going/Careless
    extraversion: number;    // 0-1: Outgoing/Energetic vs. Solitary/Reserved
    agreeableness: number;   // 0-1: Friendly/Compassionate vs. Challenging/Detached
    neuroticism: number;     // 0-1: Sensitive/Nervous vs. Secure/Confident
}

// Additional specific biases that might override general traits
export interface CognitiveBiases {
    confirmationBias: number; // 0-1: Tendency to search for, interpret, favor, and recall information in a way that confirms or supports one's prior beliefs or values.
    statusQuoBias: number;    // 0-1: Preference for the current state of affairs.
    authorityBias: number;    // 0-1: Tendency to attribute greater accuracy to the opinion of an authority figure.
    negativityBias: number;   // 0-1: Things of a more negative nature have a greater effect on one's psychological state and processes than neutral or positive things.
}

export interface Demographics {
    age: number;
    gender: Gender;
    race: Race;
    education: EducationLevel;
    religion: Religion;
    hometownType: 'Urban' | 'Suburban' | 'Rural';
    incomeLevel: 'Low' | 'Middle' | 'High'; // Simplified for MVP
    occupation: string;
}

export interface Person {
    id: string;
    name: string;
    avatarUrl?: string; // Optional URL for generated avatar
    demographics: Demographics;
    politics: PoliticalAffiliation;
    personality: BigFiveTraits;
    biases: CognitiveBiases;
}

export type ReactionSentiment = 'Positive' | 'Negative' | 'Neutral' | 'Mixed';

export interface Reaction {
    personId: string;
    stimulus: string;
    sentiment: ReactionSentiment;
    interestLevel: number; // 0-10
    comment: string;
    timestamp: Date;
}
