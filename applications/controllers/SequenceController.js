// Import contact model
Sequence = require('../models/Sequence');
Post = require('../models/Post');
var mongoose = require('mongoose');

// Handle index actions
exports.index = function (req, res) {
    Sequence.get(function (err, sequences) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
            return
        }
        res.json({
            status: "success",
            message: "sequences retrieved successfully",
            data: sequences
        });
    });
};

// Handle create user actions
exports.new = async function (req, res) {
    var sequence = new Sequence();
    sequence.title = req.body.title ? req.body.title : sequence.title;
    sequence.order = req.body.order ? req.body.order : sequence.order;
    sequence.countdown = req.body.countdown ? req.body.countdown : sequence.countdown;

    var posts = []
    if(req.body.content_type == 'category')
        posts = await Post.find({'category._id':new mongoose.Types.ObjectId(req.body.contents)})
    else
        posts = await Post.findById(new mongoose.Types.ObjectId(req.body.contents))

    sequence.contents = posts;

    sequence.save(function (err) {
        if (err)
        {
            res.json(err);
            return
        }
        res.json({
            message: 'New sequence created!',
            data: sequence
        });
    });
};

// Handle view user info
exports.view = function (req, res) {
    Sequence.findById(req.params.sequence_id, function (err, sequence) {
        if (err)
        {
            res.send(err);
            return
        }
        res.json({
            message: 'sequence details loading..',
            data: sequence
        });
    });
};

// Handle update user info
exports.update = function (req, res) {
    Sequence.findById(req.params.sequence_id,  async function (err, sequence) {
        if (err)
        {
            res.send(err);
            return
        }

        sequence.title = req.body.title ? req.body.title : sequence.title;
        sequence.order = req.body.order ? req.body.order : sequence.order;
        sequence.countdown = req.body.countdown ? req.body.countdown : sequence.countdown;

        var posts = []
        if(req.body.content_type == 'category')
            posts = await Post.find({'category._id':new mongoose.Types.ObjectId(req.body.contents)})
        else
            posts = await Post.findById(new mongoose.Types.ObjectId(req.body.contents))

        sequence.contents = posts;
        
        // save the user and check for errors
        sequence.save(function (err) {
            if (err)
            {
                res.json(err);
                return
            }
            res.json({
                message: 'sequence Info updated',
                data: sequence
            });
        });
    });
};

// Handle delete contact
exports.delete = function (req, res) {
    Sequence.remove({
        _id: req.params.sequence_id
    }, function (err, contact) {
        if (err)
        {
            res.send(err);
            return
        }
        res.json({
            status: "success",
            message: 'sequence deleted'
        });
    });
};