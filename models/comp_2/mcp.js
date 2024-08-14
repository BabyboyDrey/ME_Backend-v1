const mongoose = require("mongoose");

const mcpSchema = new mongoose.Schema({
  mcps: [
    {
      first_name: {
        type: String,
      },
      last_name: {
        type: String,
      },
      email: {
        type: String,
      },
      address: {
        type: String,
      },
      name_of_business: {
        type: String,
      },
      certification: {
        type: [String],
      },
      lga: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      state_of_service: {
        type: String,
      },
      service_provider: {
        type: String,
      },
    },
  ],
});

mcpSchema.index({
  "mcps.name_of_business": 1,
});

module.exports = MCP = mongoose.model("MCP", mcpSchema);
