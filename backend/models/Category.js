const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title:{
    type: String,
    required: [true, 'Category title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceeds more than 100 characters']
  },
  questions:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
},{timestamps: true});

module.exports = mongoose.model('Category', categorySchema);