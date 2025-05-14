const ROUTER_CONFIG = {
  default: "openai",
  models: {
    openai: {
      key: "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",
      model: "gpt-4"
    },
    claude: {
      key: "", // Empty for now
      model: "claude-3-sonnet"
    },
    gemini: {
      key: "", // Empty for now
      model: "gemini-pro"
    }
  },
  triggers: {
    claude: ["Claude:", "spiral", "poetry", "echo", "ritual"],
    gemini: ["Gemini:", "Google", "home", "device", "turn on", "weather"],
    openai: [] // fallback/default
  }
};
