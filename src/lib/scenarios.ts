import { Person, ScenarioType, DerivedTraits } from './types';

export function calculateDerivedTraits(person: Person, scenario: ScenarioType): DerivedTraits {
    const { personality, demographics, politics, biases } = person;
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = personality;

    // Base values (middle ground)
    const traits: DerivedTraits = {
        priceSensitivity: 0.5,
        brandLoyalty: 0.5,
        innovationAdoption: 0.5,
        trustInAuthority: 0.5,
        civicDuty: 0.5,
        economicAnxiety: 0.5,
        partyLoyalty: 0.5,
        ideologicalRigidity: 0.5
    };

    // Helper to clamp values between 0 and 1
    const clamp = (val: number) => Math.min(1, Math.max(0, val));

    // --- LOGIC: PRODUCT LAUNCH ---
    // Innovation Adoption: Driven by Openness (+) and Age (-)
    const ageFactor = Math.max(0, 1 - (demographics.age - 18) / 60); // 1.0 at 18, 0.0 at 78
    traits.innovationAdoption = clamp((openness * 0.7) + (ageFactor * 0.3));

    // Price Sensitivity: Driven by Income (-) and Neuroticism (+) (anxiety about money)
    const incomeScore = demographics.incomeLevel === 'High' ? 0.2 : demographics.incomeLevel === 'Middle' ? 0.5 : 0.9;
    traits.priceSensitivity = clamp((incomeScore * 0.6) + (neuroticism * 0.4));

    // Brand Loyalty: Driven by Conscientiousness (+) and Openness (-) (trying new things)
    traits.brandLoyalty = clamp((conscientiousness * 0.6) + ((1 - openness) * 0.4));


    // --- LOGIC: POLICY CHANGE ---
    // Trust in Authority: Driven by Authority Bias and Agreeableness
    traits.trustInAuthority = clamp((biases.authorityBias * 0.6) + (agreeableness * 0.4));

    // Economic Anxiety: Driven by Low Income and Neuroticism
    traits.economicAnxiety = clamp((incomeScore * 0.5) + (neuroticism * 0.5));

    // Civic Duty: Driven by Conscientiousness and Age
    traits.civicDuty = clamp((conscientiousness * 0.5) + (ageFactor < 0.5 ? 0.2 : 0.5)); // Older people tend to feel more duty


    // --- LOGIC: POLITICAL BIAS ---
    // Party Loyalty: High for extremes, low for moderates
    const isExtreme = politics === 'Far Left' || politics === 'Far Right';
    traits.partyLoyalty = isExtreme ? 0.9 : (politics === 'Moderate' ? 0.2 : 0.6);

    // Ideological Rigidity: Driven by Low Openness and Confirmation Bias
    traits.ideologicalRigidity = clamp(((1 - openness) * 0.5) + (biases.confirmationBias * 0.5));

    return traits;
}

export function getScenarioLabel(scenario: ScenarioType): string {
    switch (scenario) {
        case 'PRODUCT_LAUNCH': return 'Product Test';
        case 'POLICY_CHANGE': return 'Policy Simulation';
        case 'POLITICAL_BIAS': return 'Political Bias';
        default: return 'General Profile';
    }
}
