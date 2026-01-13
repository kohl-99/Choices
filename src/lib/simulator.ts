import { Person, Reaction, ReactionSentiment, ScenarioType } from './types';
import { calculateDerivedTraits } from './scenarios';

interface SentimentScore {
    score: number; // -1 to 1
    reason: string;
}

// Simple topic analysis
function analyzeTopic(topic: string): { keywords: string[]; category: 'tech' | 'politics' | 'lifestyle' | 'general' } {
    const lower = topic.toLowerCase();
    if (lower.includes('tax') || lower.includes('policy') || lower.includes('government') || lower.includes('vote')) {
        return { keywords: ['politics'], category: 'politics' };
    }
    if (lower.includes('phone') || lower.includes('app') || lower.includes('ai') || lower.includes('tech')) {
        return { keywords: ['tech'], category: 'tech' };
    }
    if (lower.includes('food') || lower.includes('travel') || lower.includes('fashion') || lower.includes('home')) {
        return { keywords: ['lifestyle'], category: 'lifestyle' };
    }
    return { keywords: [], category: 'general' };
}

function calculateSentiment(person: Person, topic: string): SentimentScore {
    let score = 0; // Neutral start
    const { category } = analyzeTopic(topic);
    const p = person.personality;
    const pol = person.politics;

    // Base enthusiasm from Extraversion
    score += (p.extraversion - 0.5) * 0.2;

    // Reaction to "New" things (Openness)
    if (topic.toLowerCase().includes('new') || category === 'tech') {
        if (p.openness > 0.6) score += 0.4;
        else if (p.openness < 0.4) score -= 0.2;
    }

    // Political topics
    if (category === 'politics') {
        const isConservativeTopic = topic.toLowerCase().includes('tradition') || topic.toLowerCase().includes('tax cut') || topic.toLowerCase().includes('border');
        const isLiberalTopic = topic.toLowerCase().includes('diversity') || topic.toLowerCase().includes('tax increase') || topic.toLowerCase().includes('climate');

        if (isConservativeTopic) {
            if (pol === 'Conservative' || pol === 'Far Right') score += 0.6;
            else if (pol === 'Liberal' || pol === 'Far Left') score -= 0.6;
        }
        if (isLiberalTopic) {
            if (pol === 'Liberal' || pol === 'Far Left') score += 0.6;
            else if (pol === 'Conservative' || pol === 'Far Right') score -= 0.6;
        }
        score -= (p.neuroticism - 0.5) * 0.3;
    }

    // Negativity Bias
    if (score < 0) {
        score *= (1 + person.biases.negativityBias);
    }

    // Clamp -1 to 1
    return {
        score: Math.max(-1, Math.min(1, score)),
        reason: 'Heuristic',
    };
}

// Specialized Product Market Fit Templates
const productTemplates = {
    priceSensitive: [
        "Although the value prop is clear, my willingness to pay is notoriously low for this category. I'm used to free alternatives.",
        "I can't justify the cost given my current budget constraints. It solves a problem, but not an expensive one.",
        "The pricing model is the biggest barrier for me. If there was a freemium tier, maybe, but otherwise no.",
        "It's a nice-to-have, not a must-have. I wouldn't pay effectively for this.",
    ],
    loyalSkeptic: [
        "I'm deeply entrenched in my current workflow. Switching costs are simply too high for me to consider this.",
        "My current tools are good enough. This doesn't offer the 10x improvement I need to switch.",
        "I'm skeptical that this can actually replace what I use. I'll stick to the industry standard.",
        "Acquisition here will be tough. I trust the giants I already use.",
    ],
    earlyAdopter: [
        "This is exactly what I've been looking for. The current solutions are outdated.",
        "I'd be willing to beta test this immediately. Ideally, it integrates with my existing stack.",
        "Finally, someone addresses this pain point. Take my money.",
        "This is a blue ocean opportunity. I haven't seen anything quite like this execution.",
    ]
};

const generalTemplates = {
    Positive: [
        "I'm really excited about this! It seems like a great step forward.",
        "This sounds amazing. I'd definitely support it.",
        "Finally, something good happening. Love it.",
    ],
    Negative: [
        "I'm not sure about this. It seems risky.",
        "This is a terrible idea. Who thought of this?",
        "I don't like the direction this is heading.",
    ],
    Neutral: [
        "I guess it's okay, but I need more info.",
        "Doesn't really affect me much.",
        "No strong opinion on this right now.",
    ],
    Mixed: [
        "I like the idea, but the execution worries me.",
        "It's complicated. Some good parts, some bad.",
    ]
};

function generateComment(person: Person, sentiment: ReactionSentiment, topic: string, scenario: ScenarioType): string {
    const derived = calculateDerivedTraits(person, scenario);

    // --- PRODUCT LAUNCH LOGIC ---
    if (scenario === 'PRODUCT_LAUNCH') {
        const randomness = Math.random();

        // High Price Sensitivity is a dominant blocker
        if (derived.priceSensitivity > 0.7) {
            const t = productTemplates.priceSensitive;
            return t[Math.floor(randomness * t.length)];
        }

        // High Brand Loyalty / Low Innovation is a dominant blocker
        if (derived.brandLoyalty > 0.7 || derived.innovationAdoption < 0.3) {
            const t = productTemplates.loyalSkeptic;
            return t[Math.floor(randomness * t.length)];
        }

        // High Innovation Adoption + Lower Sensitivity = Adopter
        if (derived.innovationAdoption > 0.7 && derived.priceSensitivity < 0.6) {
            const t = productTemplates.earlyAdopter;
            return t[Math.floor(randomness * t.length)];
        }

        // Fallback for moderate profiles in Product mode
        if (sentiment === 'Positive') return "It has potential, but I'd need to see a demo first.";
        if (sentiment === 'Negative') return "The market is too crowded for this to succeed.";
        return "I'd need to compare it against the free alternatives before deciding.";
    }

    // --- GENERAL LOGIC ---
    const opts = generalTemplates[sentiment];
    let baseComment = opts[Math.floor(Math.random() * opts.length)];

    // Inject personality flavor (General only)
    if (person.personality.extraversion > 0.7) baseComment = baseComment.replace('.', '!') + " Let's go!";
    if (person.personality.neuroticism > 0.7 && sentiment === 'Negative') baseComment += " This really stresses me out.";

    return baseComment;
}

export function simulateReaction(person: Person, topic: string, scenario: ScenarioType = 'GENERAL'): Reaction {
    const { score } = calculateSentiment(person, topic);

    let sentiment: ReactionSentiment = 'Neutral';
    if (score > 0.2) sentiment = 'Positive';
    else if (score < -0.2) sentiment = 'Negative';
    else if (Math.abs(score) <= 0.2 && Math.random() > 0.8) sentiment = 'Mixed';

    // Interest level correlates with extremity of sentiment + openness
    const interestBase = Math.abs(score) * 10;
    const interest = Math.min(10, Math.max(0, interestBase + (person.personality.openness * 2) + ((person.personality.neuroticism) * 2)));

    // Override sentiment for critical product personas (e.g. Price Sensitive is almost always Negative/Mixed on price)
    const derived = calculateDerivedTraits(person, scenario);
    let finalSentiment = sentiment;

    if (scenario === 'PRODUCT_LAUNCH') {
        // Skeptics and Price Sensitive people are harder to please
        if ((derived.priceSensitivity > 0.8 || derived.brandLoyalty > 0.8) && sentiment === 'Positive') {
            finalSentiment = Math.random() > 0.5 ? 'Mixed' : 'Positive'; // Dampen enthusiasm
        }
    }

    return {
        personId: person.id,
        stimulus: topic,
        sentiment: finalSentiment,
        interestLevel: Math.round(interest),
        comment: generateComment(person, finalSentiment, topic, scenario),
        timestamp: new Date(),
    };
}
