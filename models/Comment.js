const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
const CommentSchema = new Schema({
  author: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  }
});

// This creates our model from the above schema, using mongoose's model method
const Comment = mongoose.model("Comment", CommentSchema);

// Export the Article model
module.exports = Comment;
