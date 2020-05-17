// Import contact model
Post = require('./../models/Post');
// Handle index actions
exports.index = function (req, res) {
    Post.get(function (err, posts) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "posts retrieved successfully",
            data: posts
        });
    });
};

// Handle create user actions
exports.new = function (req, res) {
    var post = new Post();
    post.title = req.body.name ? req.body.name : post.name;
    post.description = req.body.description;
    post.parent = req.body.parent ? req.body.parent : '';
    post.category = req.body.category;
    post.type_as = req.body.type_as;
    post.save(function (err) {
        // if (err)
        //     res.json(err);
		res.json({
            message: 'New post created!',
            data: post
        });
    });
};

// Handle view user info
exports.view = function (req, res) {
    Post.findById(req.params.post_id, function (err, post) {
        if (err)
            res.send(err);
        res.json({
            message: 'Post details loading..',
            data: post
        });
    });
};

// Handle update user info
exports.update = function (req, res) {
    Post.findById(req.params.post_id, function (err, post) {
        if (err)
            res.send(err);
		post.title = req.body.name ? req.body.name : post.name;
        post.description = req.body.description;
        post.parent = req.body.parent ? req.body.parent : '';
        post.category = req.body.category;
        post.type_as = req.body.type_as;
		
		// save the user and check for errors
        post.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Post Info updated',
                data: post
            });
        });
    });
};

// Handle delete contact
exports.delete = function (req, res) {
    Post.remove({
        _id: req.params.post_id
    }, function (err, contact) {
        if (err)
            res.send(err);
		res.json({
            status: "success",
            message: 'Pot deleted'
        });
    });
};