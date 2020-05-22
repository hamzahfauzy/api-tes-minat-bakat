var mongoose = require('mongoose');
// Setup schema
var examSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    participants:[{
        user:{},
        answered:[{
            question:{},
            answer:{},
            status:Boolean
        }],
        answer_random:[{
            question:{},
            answers:[]
        }]
    }],
    sequences:[{
        title:String,
        contents:[],
        order:Number,
        countdown:Number,
    }],
    create_date: {
        type: Date,
        default: Date.now
    }
});

var Exam = module.exports = mongoose.model('exams', examSchema);
module.exports.get = function (callback, limit) {
    Exam.find(callback).limit(limit);
}