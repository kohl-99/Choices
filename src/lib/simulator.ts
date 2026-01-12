import { Person, Reaction, ReactionSentiment } from './types';

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
    const d = person.demographics;
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
        // Very simplified poltiical reactions
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
        // High neuroticism -> more negative reaction to political conflict
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

const templates = {
    Positive: [
        "I'm really excited about this! It seems like a great step forward.",
        "This sounds amazing. I'd definitely support it.",
        "Finally, something good happening. Love it.",
        "Interesting! I can see a lot of potential here.",
        "Wow, this is exactly what we needed.",
    ],
    Negative: [
        "I'm not sure about this. It seems risky.",
        "This is a terrible idea. Who thought of this?",
        "I don't like the direction this is heading.",
        "This concerns me greatly.",
        "Hard pass from me. Not interested.",
    ],
    Neutral: [
        "I guess it's okay, but I need more info.",
        "Doesn't really affect me much.",
        "I see both sides, hard to say.",
        "It is what it is.",
        "No strong opinion on this right now.",
    ],
    Mixed: [
        "I like the idea, but the execution worries me.",
        "It's complicated. Some good parts, some bad.",
        "I want to support this, but I have doubts.",
    ]
};

function generateComment(person: Person, sentiment: ReactionSentiment, topic: string): string {
    // Select template based on sentiment
    const opts = templates[sentiment];
    let baseComment = opts[Math.floor(Math.random() * opts.length)];

    // Inject personality flavor
    if (person.personality.extraversion > 0.7) {
        baseComment = baseComment.replace('.', '!') + " Let's go!";
    }
    if (person.personality.conscientiousness > 0.7 && Math.random() > 0.5) {
        baseComment += " We should verify the details first.";
    }
    if (person.personality.neuroticism > 0.7 && sentiment === 'Negative') {
        baseComment += " This really stresses me out.";
    }
    if (person.politics === 'Far Right' || person.politics === 'Far Left') {
        if (Math.random() > 0.7) baseComment += " It's typical of what we see these days.";
    }

    return baseComment;
}

export function simulateReaction(person: Person, topic: string): Reaction {
    const { score } = calculateSentiment(person, topic);

    let sentiment: ReactionSentiment = 'Neutral';
    if (score > 0.2) sentiment = 'Positive';
    else if (score < -0.2) sentiment = 'Negative';
    else if (Math.abs(score) <= 0.2 && Math.random() > 0.8) sentiment = 'Mixed'; // Randomly mixed for close calls

    // Interest level correlates with extremity of sentiment + openness
    const interestBase = Math.abs(score) * 10;
    const interest = Math.min(10, Math.max(0, interestBase + (person.personality.openness * 2) + ((person.personality.neuroticism) * 2)));

    return {
        personId: person.id,
        stimulus: topic,
        sentiment,
        interestLevel: Math.round(interest),
        comment: generateComment(person, sentiment, topic),
        timestamp: new Date(),
    };
}
