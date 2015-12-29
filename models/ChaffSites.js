var mongoose = require('mongoose');

// Create the MovieSchema.
var ChaffSitesSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  datetime: {
    type: Date,
    default: Date.now,
    required: false 
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// Export the model schema.
module.exports = mongoose.model('Chaff', ChaffSitesSchema);
