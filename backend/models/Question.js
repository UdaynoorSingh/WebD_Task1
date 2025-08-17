const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceeds more than 200 characters']
  },
  url: {
    type: String,
    required: [true, 'Question URL is required'],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
