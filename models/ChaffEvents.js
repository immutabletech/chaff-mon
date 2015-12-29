var mongoose = require('mongoose');

var ChaffStatsSchema = new mongoose.Schema({
  start: {
    type: Date,
    default: Date.now,
    required: false 
  },
  end: {
    type: Date,
    default: Date.now,
    required: false 
  },
  sites: {
    type: Number,
    required: true
  }
});

// Export the model schema.
module.exports = mongoose.model('ChaffStats', ChaffStatsSchema);
