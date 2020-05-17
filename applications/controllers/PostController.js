// Import contact model
Post = require('./../models/Post');
Category = require('./../models/Category');
var mv = require('mv');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var formidable = require('formidable')
const readXlsxFile = require('read-excel-file/node')

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

exports.importPosts = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = appDir + "/uploads/" + files.filetoupload.name
        mv(oldpath, newpath, function (err) {
            readXlsxFile(newpath).then((rows) => {
                // Remove Header ROW
                rows.shift();

                console.log(rows);
                var posts = []
                rows.forEach(async (val) => {
                    var category = await Category.find({name:val[2]})
                    if(!category)
                    {
                        var category = new Category()
                        category.name = val[2]
                        category.description = val[2]
                        category.save()
                    }

                    var subcategory = await Category.find({name:val[3]})
                    if(!subcategory)
                    {
                        var subcategory = new Category()
                        subcategory.name = val[3]
                        subcategory.description = val[3]
                        subcategory.parent = category
                        subcategory.save()
                    }

                    var post = new Post()
                    post.title = 'Soal Exam'
                    post.description = val[1]
                    post.category = subcategory
                    post.type_as = 'post'
                    post.save()

                    for(i=1;i<=4;i++){
                        var answer = new Post()
                        answer.title = 'Jawaban Exam'
                        answer.description = val[3+i]
                        answer.parent = post
                        answer.type_as = i == 1 ? 'answer correct' : 'answer'
                        answer.save()
                    }
                })
                res.json({
                    message: 'Exam Info updated',
                    data: exam
                });
            })
        })
    })
    
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