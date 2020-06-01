// Import contact model
Exam = require('./../models/Exam')
User = require('./../models/User')
Post = require('./../models/Post')
var mongoose = require('mongoose');
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
            readXlsxFile(newpath).then(async (rows) => {
                // Remove Header ROW
                // rows.shift();

                var participants = []
                for(var i=1;i<rows.length;i++)
                {
                    var val = rows[i]
                    var user = await User.findOneAndUpdate({
                        name: val[2],
                        username:val[1],
                        password: val[3],
                    },{
                        name: val[2],
                        username: val[1],
                        password: val[3],
                        isAdmin: false,
                        status: true,
                        metas: {
                            exam_id:fields.exam_id,
                            gender:val[4]
                        }
                    },{new:true,upsert:true})
                    participants.push({
                        user:{
                            _id:user._id,
                            nis:val[1],
                            name:val[2],
                            birthdate:val[3],
                            gender:val[4]
                        },
                    })
                }
                Exam.findById(fields.exam_id, function (err, exam) {
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

exports.updateOrder = (req,res) => {
    Exam.findOne({'sequences._id':req.params.sequence_id.toString()}, (err, exam) => {
        var sequences = JSON.stringify(exam.sequences)
        sequences = JSON.parse(sequences)
        sequences.forEach(val => {
            if(val._id == req.params.sequence_id.toString())
                val.order = req.body.order
        })
        exam.sequences = sequences
        exam.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Exam Info updated',
                data: exam
            });
        });
    });
    // Exam.find({'sequences._id':req.params.sequence_id, async function (err, exam) {
    //     if (err)
    //         res.send(err);
    //     exam.sequence.order = req.body.order
    //     exam.save(function (err) {
    //         if (err)
    //             res.json(err);
    //         res.json({
    //             message: 'Exam Info updated',
    //             data: exam
    //         });
    //     });
    // });
}
exports.updateCountdown = (req,res) => {
    Exam.findOne({'sequences._id':req.params.sequence_id.toString()}, (err, exam) => {
        var sequences = JSON.stringify(exam.sequences)
        sequences = JSON.parse(sequences)
        sequences.forEach(val => {
            if(val._id == req.params.sequence_id.toString())
                val.countdown = req.body.countdown
        })
        exam.sequences = sequences
        exam.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Exam Info updated',
                data: exam
            });
        });
    });
}

exports.addSequence = async (req,res) => { 
    Exam.findById(req.params.exam_id, async function (err, exam) {
        if (err)
            res.send(err);
        var sequences = req.body
        var posts = []
        if(sequences.content_type == 'category')
            posts = await Post.find({'category._id':new mongoose.Types.ObjectId(sequences.content)})
        else
            posts = await Post.findById(new mongoose.Types.ObjectId(sequences.content))
        var sequence = {
            title:sequences.title,
            contents:posts,
            order:sequences.order,
            countdown:sequences.timeout,
        }
        exam.sequences.push(sequence)
        exam.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Exam Info updated',
                data: exam
            });
        });
    });
}

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

exports.startExam = async (req, res) => {
    var user = await User.findById(req.user._id)
    var metas = user.metas
    var req_metas = Object.keys(req.body)

    req_metas.forEach(val => {
        if(val != 'exam_id')
            metas[val] = req.body[val].value
    })
    
    var userUpdate = await user.save({
        metas:metas
    })
    var exam = await Exam.findById(req.body.exam_id).populate('participants')
    var sequences = []
    for(var i=0;i<exam.sequences.length;i++)
    {
        var sequence = exam.sequences[i]
        sequence = JSON.stringify(sequence)
        sequence = JSON.parse(sequence)
        var contents = []
        for(var j=0;j<sequence.contents.length;j++)
        {
            var content = sequence.contents[j]
            var sub_contents = content.type_as == "question" ? await Post.find({'parent._id':new mongoose.Types.ObjectId(content._id)}).select('-type_as') : {}
            contents.push({
                parent:content,
                childs:sub_contents
            })
        }
        sequence.contents = contents
        sequences.push(sequence)
    }
    seqeunces = sequences.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0))
    res.json({
        status: "success",
        message: 'Exam start',
        user:userUpdate,
        data:sequences
    });
}

exports.sendAnswer = (req, res) => {
    res.json({
        status: "success",
        message: 'Answer Save'
    });
}

exports.finishExam = (req, res) => {
    res.json({
        status: "success",
        message: 'Exam Finished'
    });
}