import { Person, ProductSpec } from './types';

/**
 * Calculate conversion likelihood score (0-100)
 * Higher score = more likely to convert
 */
export function calculateConversionScore(person: Person): number {
    const priceSensitivity = person.biases.confirmationBias;
    const toolLoyalty = person.biases.statusQuoBias;
    const skepticism = person.biases.negativityBias;

    // Innovation adoption is derived from openness and low neuroticism
    const innovationAdoption = (person.personality.openness + (1 - person.personality.neuroticism)) / 2;

    const score = (
        (1 - priceSensitivity) * 0.4 +      // 40% weight - price is critical
        (1 - toolLoyalty) * 0.3 +            // 30% weight - switching cost
        (1 - skepticism) * 0.2 +             // 20% weight - trust barrier
        innovationAdoption * 0.1             // 10% weight - early adopter tendency
    ) * 100;

    return Math.round(score);
}

/**
 * Segment personas by conversion likelihood
 */
export function segmentByConversion(people: Person[]) {
    const highIntent: Person[] = [];
    const mediumIntent: Person[] = [];
    const lowIntent: Person[] = [];

    people.forEach(person => {
        const score = calculateConversionScore(person);
        if (score >= 70) {
            highIntent.push(person);
        } else if (score >= 40) {
            mediumIntent.push(person);
        } else {
            lowIntent.push(person);
        }
    });

    return { highIntent, mediumIntent, lowIntent };
}

/**
 * Parse price string to number (e.g., "$12/month" -> 12)
 */
function parsePrice(priceStr: string): number {
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

/**
 * Calculate willingness to pay for a specific persona
 */
export function calculateWillingnessToPay(person: Person, productPrice: string) {
    const priceValue = parsePrice(productPrice);
    const priceSensitivity = person.biases.confirmationBias;

    // Income multipliers
    const incomeMultiplier = {
        'High': 1.8,
        'Middle': 1.2,
        'Low': 0.7,
    }[person.demographics.incomeLevel] || 1.0;

    // Calculate max WTP based on income and price sensitivity
    const maxWTP = priceValue * incomeMultiplier * (1.5 - priceSensitivity);

    // Price barrier is how much the price is a problem (0 = no problem, 1 = major problem)
    const priceBarrier = priceSensitivity;

    return {
        willPay: maxWTP >= priceValue,
        maxPrice: Math.round(maxWTP),
        priceBarrier,
    };
}

/**
 * Analyze willingness to pay across entire cohort
 */
export function analyzeWillingnessToPay(people: Person[], productPrice: string) {
    const results = people.map(person => ({
        person,
        ...calculateWillingnessToPay(person, productPrice),
    }));

    const willPayCount = results.filter(r => r.willPay).length;
    const avgMaxPrice = results.reduce((sum, r) => sum + r.maxPrice, 0) / results.length;

    // Calculate optimal price (median of max prices for those who will pay)
    const maxPrices = results.filter(r => r.willPay).map(r => r.maxPrice).sort((a, b) => a - b);
    const optimalPrice = maxPrices.length > 0
        ? maxPrices[Math.floor(maxPrices.length / 2)]
        : parsePrice(productPrice);

    return {
        willPayPercentage: Math.round((willPayCount / people.length) * 100),
        avgMaxPrice: Math.round(avgMaxPrice),
        optimalPrice,
        priceDistribution: results,
    };
}

/**
 * Identify top barriers preventing conversion
 */
export function analyzeConversionBarriers(people: Person[]) {
    let highPriceSensitivity = 0;
    let highToolLoyalty = 0;
    let highSkepticism = 0;

    people.forEach(person => {
        if (person.biases.confirmationBias > 0.6) highPriceSensitivity++;
        if (person.biases.statusQuoBias > 0.6) highToolLoyalty++;
        if (person.biases.negativityBias > 0.6) highSkepticism++;
    });

    const barriers = [
        {
            barrier: 'Price Sensitivity',
            count: highPriceSensitivity,
            percentage: Math.round((highPriceSensitivity / people.length) * 100),
            severity: 'high' as const,
        },
        {
            barrier: 'Tool Loyalty',
            count: highToolLoyalty,
            percentage: Math.round((highToolLoyalty / people.length) * 100),
            severity: 'medium' as const,
        },
        {
            barrier: 'Skepticism',
            count: highSkepticism,
            percentage: Math.round((highSkepticism / people.length) * 100),
            severity: 'medium' as const,
        },
    ].sort((a, b) => b.percentage - a.percentage);

    return barriers;
}

/**
 * Calculate market size and revenue potential
 */
export function calculateMarketPotential(people: Person[], productPrice: string) {
    const segments = segmentByConversion(people);
    const wtpAnalysis = analyzeWillingnessToPay(people, productPrice);
    const priceValue = parsePrice(productPrice);

    // Estimate conversion rates by segment
    const highConversionRate = 0.7;  // 70% of high-intent will convert
    const mediumConversionRate = 0.3; // 30% of medium-intent will convert
    const lowConversionRate = 0.05;   // 5% of low-intent will convert

    const estimatedBuyers =
        segments.highIntent.length * highConversionRate +
        segments.mediumIntent.length * mediumConversionRate +
        segments.lowIntent.length * lowConversionRate;

    const monthlyRevenuePotential = Math.round(estimatedBuyers * priceValue);

    return {
        totalCohortSize: people.length,
        highIntentCount: segments.highIntent.length,
        mediumIntentCount: segments.mediumIntent.length,
        lowIntentCount: segments.lowIntent.length,
        estimatedBuyers: Math.round(estimatedBuyers),
        conversionRate: Math.round((estimatedBuyers / people.length) * 100),
        monthlyRevenuePotential,
        annualRevenuePotential: monthlyRevenuePotential * 12,
    };
}

/**
 * Get detailed analytics for individual persona
 */
export function getPersonaAnalytics(person: Person, productPrice: string) {
    const conversionScore = calculateConversionScore(person);
    const wtp = calculateWillingnessToPay(person, productPrice);

    // Determine segment
    let segment: 'High Intent' | 'Medium Intent' | 'Low Intent';
    if (conversionScore >= 70) segment = 'High Intent';
    else if (conversionScore >= 40) segment = 'Medium Intent';
    else segment = 'Low Intent';

    // Identify primary barrier
    const barriers = [
        { name: 'Price', value: person.biases.confirmationBias },
        { name: 'Loyalty', value: person.biases.statusQuoBias },
        { name: 'Skepticism', value: person.biases.negativityBias },
    ].sort((a, b) => b.value - a.value);

    return {
        conversionScore,
        segment,
        willPay: wtp.willPay,
        maxPrice: wtp.maxPrice,
        primaryBarrier: barriers[0].name,
        barrierSeverity: barriers[0].value,
    };
}
