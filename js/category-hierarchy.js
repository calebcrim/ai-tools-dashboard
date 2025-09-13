// Category Hierarchy Configuration
// Organizes 52 categories into 8 meta-categories for progressive disclosure

const categoryHierarchy = {
    'Marketing & Sales': {
        icon: '📈',
        color: '#4a9eff',
        categories: [
            'Advertising Tech',
            'CRM & Sales',
            'Marketing Automation',
            'Social Media Management',
            'Social Analytics',
            'Media Intelligence'
        ]
    },

    'Development & Technical': {
        icon: '💻',
        color: '#00d4aa',
        categories: [
            'AI Development',
            'API & Documentation',
            'Development Tools',
            'developer-tools',
            'code-development',
            'Web Development',
            'DevOps Tools',
            'Computer Vision',
            'Language Processing'
        ]
    },

    'Content & Creative': {
        icon: '🎨',
        color: '#ff6b6b',
        categories: [
            'Content Creation',
            'content-creation',
            'Content Research',
            'Audio/Video Processing',
            'Media Production',
            'Publishing Tools',
            'Document Processing'
        ]
    },

    'Business Operations': {
        icon: '💼',
        color: '#ffd93d',
        categories: [
            'Project Management',
            'Productivity Tools',
            'productivity',
            'Workflow Automation',
            'Collaboration Tools',
            'Finance',
            'Supply Chain',
            'Compliance Tools'
        ]
    },

    'Data & Analytics': {
        icon: '📊',
        color: '#a78bfa',
        categories: [
            'Data Analytics',
            'analytics',
            'Web Analytics',
            'Specialized Analytics',
            'Research Tools',
            'research'
        ]
    },

    'Customer & Support': {
        icon: '🤝',
        color: '#fb923c',
        categories: [
            'Customer Service',
            'customer-service',
            'Communication Tools',
            'IT Support',
            'HR & Employee Tools'
        ]
    },

    'AI & Automation': {
        icon: '🤖',
        color: '#06b6d4',
        categories: [
            'AI Assistants',
            'ai-assistant',
            'ai-tools',
            'General Tools',
            'Consumer Apps',
            'Resource Directory'
        ]
    },

    'Industry Specific': {
        icon: '🏢',
        color: '#ec4899',
        categories: [
            'Legal Tech',
            'Real Estate Tech',
            'Cybersecurity',
            'Data Protection',
            'Hardware Integration',
            'IoT Solutions'
        ]
    }
};

// Helper function to get meta-category for a given category
function getMetaCategory(category) {
    for (const [metaCategory, data] of Object.entries(categoryHierarchy)) {
        if (data.categories.includes(category)) {
            return metaCategory;
        }
    }
    return 'Other';
}

// Helper function to get all categories flat
function getAllCategories() {
    const categories = [];
    for (const data of Object.values(categoryHierarchy)) {
        categories.push(...data.categories);
    }
    return [...new Set(categories)].sort();
}

// Helper function to get category counts from tools data
function getCategoryCounts(toolsData) {
    const counts = {};
    toolsData.forEach(tool => {
        counts[tool.category] = (counts[tool.category] || 0) + 1;
    });
    return counts;
}

// Helper function to get meta-category counts
function getMetaCategoryCounts(toolsData) {
    const categoryCounts = getCategoryCounts(toolsData);
    const metaCounts = {};

    for (const [metaCategory, data] of Object.entries(categoryHierarchy)) {
        metaCounts[metaCategory] = 0;
        data.categories.forEach(category => {
            metaCounts[metaCategory] += categoryCounts[category] || 0;
        });
    }

    return metaCounts;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        categoryHierarchy,
        getMetaCategory,
        getAllCategories,
        getCategoryCounts,
        getMetaCategoryCounts
    };
}