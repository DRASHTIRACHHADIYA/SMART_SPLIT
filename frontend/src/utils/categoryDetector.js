/**
 * Smart Category Detector
 * Rule-based keyword matching for expense categorization
 */

const categoryKeywords = {
    food: [
        'lunch', 'dinner', 'breakfast', 'brunch', 'meal', 'restaurant', 'cafe', 'coffee',
        'pizza', 'burger', 'sushi', 'food', 'eat', 'snack', 'dessert', 'bakery',
        'zomato', 'swiggy', 'uber eats', 'dominos', 'mcdonalds', 'kfc', 'subway',
        'biryani', 'chai', 'tea', 'dosa', 'idli', 'thali', 'paneer', 'dal',
        'groceries', 'vegetables', 'fruits', 'milk', 'bread', 'eggs', 'blinkit', 'zepto', 'instamart'
    ],
    transport: [
        'uber', 'ola', 'taxi', 'cab', 'metro', 'bus', 'train', 'flight', 'petrol',
        'fuel', 'gas', 'parking', 'toll', 'rapido', 'auto', 'rickshaw', 'bike',
        'bluedart', 'delhivery', 'courier', 'fastag', 'railway', 'irctc'
    ],
    travel: [
        'hotel', 'airbnb', 'oyo', 'makemytrip', 'goibibo', 'booking', 'hostel',
        'trip', 'vacation', 'holiday', 'tour', 'travel', 'resort', 'villa',
        'cleartrip', 'yatra', 'ixigo', 'agoda', 'trivago'
    ],
    rent: [
        'rent', 'lease', 'apartment', 'house', 'flat', 'room', 'accommodation',
        'housing', 'landlord', 'deposit', 'pg', 'hostel rent', 'maintenance'
    ],
    utilities: [
        'electricity', 'water', 'wifi', 'internet', 'broadband', 'gas', 'cylinder',
        'phone bill', 'mobile', 'recharge', 'airtel', 'jio', 'vi', 'bsnl',
        'dth', 'tata sky', 'dish tv', 'postpaid', 'prepaid', 'lpg'
    ],
    shopping: [
        'amazon', 'flipkart', 'myntra', 'ajio', 'clothes', 'shoes', 'shopping',
        'mall', 'store', 'purchase', 'buy', 'order', 'meesho', 'nykaa',
        'decathlon', 'croma', 'reliance', 'd-mart', 'big bazaar'
    ],
    entertainment: [
        'movie', 'cinema', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube',
        'concert', 'show', 'game', 'gaming', 'ps', 'xbox', 'steam', 'theatre',
        'pvr', 'inox', 'bookmyshow', 'disney', 'zee5', 'sonyliv', 'jiocinema'
    ],
    health: [
        'doctor', 'hospital', 'clinic', 'medicine', 'pharmacy', 'medical',
        'health', 'gym', 'fitness', 'yoga', 'apollo', '1mg', 'pharmeasy',
        'netmeds', 'practo', 'cult', 'healthify', 'dentist', 'eye', 'checkup'
    ]
};

/**
 * Detect category from expense title
 * @param {string} title - Expense title
 * @returns {Object} { category: string, confidence: number }
 */
export function detectCategory(title) {
    if (!title || typeof title !== 'string') {
        return { category: 'other', confidence: 0 };
    }

    const lowerTitle = title.toLowerCase().trim();
    const matches = [];

    // Check each category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
            if (lowerTitle.includes(keyword.toLowerCase())) {
                // Calculate confidence based on keyword length and position
                const keywordLength = keyword.length;
                const titleLength = lowerTitle.length;
                const isExactMatch = lowerTitle === keyword.toLowerCase();
                const startsWithKeyword = lowerTitle.startsWith(keyword.toLowerCase());

                let confidence = (keywordLength / titleLength) * 100;

                // Boost confidence for exact or start matches
                if (isExactMatch) confidence = 100;
                else if (startsWithKeyword) confidence += 20;

                // Cap at 100
                confidence = Math.min(confidence, 100);

                matches.push({ category, confidence, keyword });
            }
        }
    }

    // Return highest confidence match
    if (matches.length > 0) {
        matches.sort((a, b) => b.confidence - a.confidence);
        return {
            category: matches[0].category,
            confidence: Math.round(matches[0].confidence),
            matchedKeyword: matches[0].keyword
        };
    }

    return { category: 'other', confidence: 0 };
}

/**
 * Get category label for display
 */
export function getCategoryLabel(category) {
    const labels = {
        food: 'Food & Dining',
        transport: 'Transport',
        travel: 'Travel & Hotels',
        entertainment: 'Entertainment',
        utilities: 'Utilities',
        rent: 'Rent',
        shopping: 'Shopping',
        health: 'Health',
        other: 'Other'
    };
    return labels[category] || 'Other';
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category) {
    const emojis = {
        food: '🍕',
        transport: '🚗',
        travel: '✈️',
        entertainment: '🎬',
        utilities: '💡',
        rent: '🏠',
        shopping: '🛍️',
        health: '⚕️',
        other: '📝'
    };
    return emojis[category] || '📝';
}
