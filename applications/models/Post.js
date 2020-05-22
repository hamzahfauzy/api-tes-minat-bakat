var mongoose = require('mongoose');
// Setup schema
var postSchema = mongoose.Schema({
    parent:Object,
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:Object,
    type_as:String,
    create_date: {
        type: Date,
        default: Date.now
    },
});

// Export User model
var Post = module.exports = mongoose.model('posts', postSchema);
module.exports.get = function (callback, limit) {
    Post.find(callback).limit(limit);
}