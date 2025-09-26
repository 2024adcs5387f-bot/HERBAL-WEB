// File: src/services/knowledgeService.js

// Mocked AI-based herbal recommendations
const mockRecommendations = [
  {
    id: "1",
    title: "Herbal Treatment for Headaches",
    description: "Peppermint and ginger teas can help alleviate mild headaches.",
    tags: ["headache", "peppermint", "ginger"],
  },
  {
    id: "2",
    title: "Boosting Immunity with Herbs",
    description: "Echinacea and turmeric help strengthen the immune system.",
    tags: ["immunity", "echinacea", "turmeric"],
  },
  {
    id: "3",
    title: "Natural Sleep Aids",
    description: "Chamomile and valerian root promote better sleep.",
    tags: ["sleep", "chamomile", "valerian"],
  },
];

// Utility to simulate network delay
const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const knowledgeService = {
  // Fetch all recommendations
  getAllRecommendations: async () => {
    await simulateDelay(500); // simulate API delay
    return mockRecommendations;
  },

  // Fetch a single recommendation by ID
  getRecommendationById: async (id) => {
    await simulateDelay(300);
    return mockRecommendations.find((r) => r.id === id) || null;
  },

  // Search recommendations by query
  searchRecommendations: async (query) => {
    await simulateDelay(400);
    return mockRecommendations.filter(
      (r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase()) ||
        r.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  },
};

export default knowledgeService;
