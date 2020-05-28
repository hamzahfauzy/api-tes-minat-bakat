// Import contact model
Media = require('./../models/Media');
var mongoose = require('mongoose');

// Handle index actions
exports.index = function (req, res) {
    Media.get(function (err,  media) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "media retrieved successfully",
            data: media
        });
    });
};

// Handle create user actions
exports.new = async function (req, res) {
    var media = new Media();
    media.name = req.body.name;
    media.url = req.body.url;
    media.uploaded = '1';
    
    media.save(function (err) {
        // if (err)
        //     res.json(err);
        res.json({
            message: 'New media created!',
            data: media
        });
    });
};
