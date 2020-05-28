// Import contact model
Media = require('./../models/Media');
var mongoose = require('mongoose');
var mv = require('mv');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var formidable = require('formidable')

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
    var form = new formidable.IncomingForm();
    var oldpath = ""
    var newpath = ""
    form.parse(req, async function (err, fields, files) {
        oldpath = files.filetoupload.path;
        for(var i=0;i<files.filetoupload.length;i++)
        {
            var _file = files.filetoupload[i]
            newpath = appDir + "/uploads/" + _file.name
            mv(oldpath, newpath, async function (err) {
                var media = new Media();
                media.name = _file.name;
                media.url = newpath;
                media.uploaded = '1';
                
                await media.save();
            }) 
        }
    });
    
};
