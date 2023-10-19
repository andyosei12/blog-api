const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  state: { type: String, default: 'draft', enum: ['draft', 'published'] },
  read_count: { type: Number, default: 0 },
  reading_time: { type: Number },
  tags: { type: [] },
  body: { type: String, required: true },
  user_id: { type: Schema.ObjectId, required: true },
  created_at: { type: Date, default: new Date() },
});

// before save
BlogSchema.pre('save', async function (next) {
  const blog = this;
  const time = 5000;

  this.reading_time = time;
  next();
});

const BlogModel = mongoose.model('blogs', BlogSchema);

module.exports = BlogModel;
