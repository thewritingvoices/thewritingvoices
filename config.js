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
