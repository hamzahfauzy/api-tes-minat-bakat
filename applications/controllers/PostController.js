// Import contact model
var mongoose = require('mongoose');
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

exports.importPosts = async function (req, res) {
    var form = new formidable.IncomingForm();
    var oldpath = ""
    var newpath = ""
    form.parse(req, async function (err, fields, files) {
        oldpath = files.filetoupload.path;
        newpath = appDir + "/uploads/" + files.filetoupload.name
        mv(oldpath, newpath, async function (err) {
            var rows = await readXlsxFile(newpath)
            // rows.shift()
            var categories = []
            var subcategories = []
            for(i=1;i<rows.length;i++)
            {
                var val = rows[i]
                var category = await Category.findOneAndUpdate({name:val[1]},{
                    name:val[1],
                    category:val[1],
                },{new:true,upsert:true})
                // console.log('category')

                var subcategory = await Category.findOneAndUpdate({name:val[2]},{
                    name:val[2],
                    category:val[2],
                    parent:category
                },{new:true,upsert:true})
                // console.log('subcategory')

                const post = new Post({
                    title:'Soal Exam '+i,
                    description: val[0],
                    category: subcategory,
                    type_as: 'question'
                })
                let postSave = await post.save()
                // console.log('post')

                for(idx=1;idx<=4;idx++){
                    const answer = new Post({
                        title:'Jawaban '+idx+' Soal '+i,
                        description: val[2+idx],
                        parent: postSave,
                        type_as: idx == 1 ? 'correct answer' : 'answer'
                    })
                    let answerSave = await answer.save()
                    // console.log('answer')
                }
            }
            res.json({
                message: 'Post Import success',
            })
        }) 
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

exports.viewByType = function (req, res) {
    Post.find({type_as:req.params.type_as}, async function (err, posts) {
        if (err)
            res.send(err);

        var _posts = []
        // _post.question = post

        if(req.params.type_as == 'question')
        {
            for(i=0;i<posts.length;i++)
            {
                var post = posts[i]
                var answers = await Post.find({parent:post})
                _posts.push({question:post,answers:answers})
            }
        }
        else
            _posts = posts
        res.json({
            message: 'Post details loading..',
            data: _posts
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