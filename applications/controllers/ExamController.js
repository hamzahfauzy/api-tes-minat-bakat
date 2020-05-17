// Import contact model
Exam = require('./../models/Exam')
User = require('./../models/User')
var mv = require('mv');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var formidable = require('formidable')
const readXlsxFile = require('read-excel-file/node')

// Handle index actions
exports.index = function (req, res) {
    Exam.get(function (err, exams) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Exam retrieved successfully",
            data: exams
        });
    });
};

// Handle create user actions
exports.new = function (req, res) {
    var exam = new Exam();
    exam.title = req.body.title;
    exam.save(function (err) {
        // if (err)
        //     res.json(err);
		res.json({
            message: 'New exam created!',
            data: exam
        });
    });
};

// Handle view user info
exports.view = function (req, res) {
    Exam.findById(req.params.exam_id, function (err, exam) {
        if (err)
            res.send(err);
        res.json({
            message: 'Exam detail loading..',
            data: exam
        });
    });
};

exports.update = function (req, res) {
    Exam.findById(req.params.exam_id, function (err, exam) {
        if (err)
            res.send(err);
		exam.title = req.body.title
        exam.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Exam Info updated',
                data: exam
            });
        });
    });
};

exports.importParticipants = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = appDir + "/uploads/" + files.filetoupload.name
        mv(oldpath, newpath, function (err) {
            readXlsxFile(newpath).then((rows) => {
                // Remove Header ROW
                rows.shift();

                console.log(rows);
                var participants = []
                rows.forEach(async (val) => {
                    participants.push({
                        user:{
                            nis:val[1],
                            name:val[2],
                            birthdate:val[3]
                        },
                    })
                    var user = await User.find({username:val[1]})
                    if(!user)
                    {
                        var user = new User()
                        user.name = val[2]
                        user.username = val[1]
                        user.password = val[3]
                        user.metas = {
                            exam_id:req.params.exam_id,
                            gender:val[4]
                        }
                        user.save()
                    }
                })
                Exam.findById(req.params.exam_id, function (err, exam) {
                    if (err)
                        res.send(err);
                    exam.participants = participants
                    exam.save(function (err) {
                        if (err)
                            res.json(err);
                        res.json({
                            message: 'Exam Info updated',
                            data: exam
                        });
                    });
                });
            })
        })
    })
    
};

exports.delete = function (req, res) {
    Exam.remove({
        _id: req.params.exam_id
    }, function (err, contact) {
        if (err)
            res.send(err);
		res.json({
            status: "success",
            message: 'Exam deleted'
        });
    });
};