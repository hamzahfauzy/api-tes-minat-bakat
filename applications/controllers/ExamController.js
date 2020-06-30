// Import contact model
Exam = require('./../models/Exam')
User = require('./../models/User')
Post = require('./../models/Post')
School = require('./../models/School')
Sequence = require('./../models/Sequence')
var mongoose = require('mongoose');
var mv = require('mv');
var path = require('path');
var appDir = path.dirname(require.main.filename);
var formidable = require('formidable')
const readXlsxFile = require('read-excel-file/node')
var xl = require('excel4node');

// Handle index actions
exports.index = function (req, res) {
    Exam.get(async function (err, exams) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
            return
        }

        var _exams = JSON.stringify(exams)
        _exams = JSON.parse(_exams)

        for(var h=0;h<_exams.length;h++){
            var users = _exams[h].participants
            var reports = []
            for(var i=0;i<users.length;i++)
            {
                var participant = users[i]
                var user = await User.findById(users[i]._id)
                if(!user) continue
                user = JSON.stringify(user)
                user = JSON.parse(user)
                // delete user.metas.sequences
                delete user.metas.school
                // delete user.sequences
                var sequences = user.metas.sequences
                if(typeof sequences === 'undefined'){
                    user.metas.NISN = participant.nis
                    reports.push(user)
                    continue
                } 
                for (var j = 0; j < sequences.length; j++) 
                {
                    var quis = j+1
                    if(quis%2 != 0) continue;
                    var sequence = sequences[j].contents
                    var nilai = 0
                    for(var k = 0; k < sequence.length; k++)
                    {
                        var content = sequence[k]
                        // if(content.childs.length == 0) continue;
                        if(typeof content.selected === 'undefined') continue
                        var selected = content.selected
                        var post = await Post.findById(selected)
                        if(post && post.type_as == "correct answer") nilai++
                    }
                    // user.nilai.push({
                    //     title:sequences[j].title,
                    //     nilai:nilai
                    // })
                    user[""+sequences[j].title] = nilai
                }
                delete user.metas.sequences
                reports.push(user)
            }
            _exams[h].participants = reports
        }

        res.json({
            status: "success",
            message: "Exam retrieved successfully",
            data: _exams
        });
    });
};

// Handle create user actions
exports.new = async function (req, res) {
    var exam = new Exam();
    var school = await School.findById(req.body.school_id)
    exam.school_id = req.body.school_id
    // exam.participants = school.students
    exam.title = req.body.title;
    exam.start_time = req.body.start_time;
    exam.end_time = req.body.end_time;
    exam.school_id = req.body.school_id;
    var examSave = await exam.save()

    var participants = []
    for(var i=0;i<school.students.length;i++)
    {
        var val = school.students[i]
        var metas = {
            school:school,
            exam_id:examSave._id
        }
        var user = await User.findOneAndUpdate({
            _id:val._id,
        },{
            metas: metas,
        })
        participants.push({
            _id:user._id,
            nis:val.nis,
            name:val.name
        })
    }

    Exam.findById(examSave._id, function (err, exam) {
        exam.participants = participants
        exam.save(err => {
            if(err)
            {
                res.json({
                    message: 'New exam created error!',
                    data: err
                });
                return
            }
            res.json({
                message: 'New exam created!',
                data: exam
            });
        })
    })

};

// Handle create user actions
exports.duplicate = function (req, res) {
    Exam.findById(req.params.exam_id, function (err, exam) {
        if (err)
        {
            res.send(err);
            return
        }
        var newExam = new Exam(exam)
        newExam._id = mongoose.Types.ObjectId()
        newExam.isNew = true
        newExam.title = req.body.title
        newExam.participants = []
        newExam.start_time = req.body.start_time
        newExam.end_time = req.body.end_time
        newExam.save(function (err) {
            if (err)
            {
                res.json(err);
                return
            }
            res.json({
                message: 'Exam Info duplicated',
                data: newExam
            });
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
    Exam.findById(req.params.exam_id, async function (err, exam) {
        if (err)
        {
            res.send(err);
            return
        }
        var school = await School.findById(req.body.school_id)
        var participants = []
        for(var i=0;i<school.students.length;i++)
        {
            var val = school.students[i]
            var metas = {
                school:school,
                exam_id:exam._id
            }
            var user = await User.findOneAndUpdate({
                _id:val._id,
            },{
                $set:{"metas.school":school,"metas.exam_id":exam._id}
                // metas: metas,
            })
            participants.push({
                _id:user._id,
                nis:val.nis,
                name:val.name,
            })
        }
        exam.title = req.body.title
        exam.start_time = req.body.start_time;
        exam.end_time = req.body.end_time;
        exam.school_id = req.body.school_id;
        exam.participants = participants;
        exam.save(function (err) {
            if (err)
            {
                res.json(err);
                return
            }
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
                    },{
                        name: val[2],
                        username: val[1],
                        password: 123,
                        isAdmin: false,
                        status: true,
                        metas: {
                            exam_id:fields.exam_id,
                        }
                    },{new:true,upsert:true})
                    participants.push({
                            _id:user._id,
                            nis:val[1],
                            name:val[2]
                        
                    })
                }
                Exam.findById(fields.exam_id, function (err, exam) {
                    if (err)
                    {
                        res.send(err);
                        return
                    }
                    exam.participants = participants
                    exam.save(function (err) {
                        if (err)
                        {
                            res.json(err);
                            return
                        }
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
            {
                res.json(err);
                return
            }
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
            {
                res.json(err);
                return
            }
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
        {
            res.send(err);
            return
        }
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
            {
                res.json(err);
                return
            }
            res.json({
                message: 'Exam Info updated',
                data: exam
            });
        });
    });
}

exports.report = async (req,res) => {
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Sheet 1');

    ws.cell(1, 1)
      .string("No")
    ws.cell(1, 2)
      .string("NAMA")
    var header_start = 3;
    var sequences = await Sequence.find({})
    for(var i=0;i<sequences.length;i++){
        var quis = i+1
        if(quis%2 != 0) continue;
        ws.cell(1, header_start).string(sequences[i].title)
        header_start++
    }
    ws.cell(1, 11)
      .string("HASIL 1")
    ws.cell(1, 12)
      .string("HASIL 2")
    var exam = await Exam.findById(req.params.exam_id)
    var users = exam.participants
    var school = await School.findById(exam.school_id)
    users = JSON.stringify(users)
    users = JSON.parse(users)
    for(var i=0;i<users.length;i++)
    {
        var n = i+1;
        var row = i+2;
        ws.cell(row, 1).number(n)
        var participant = users[i]
        var user = await User.findById(users[i]._id)
        if(!user) continue
        user = JSON.stringify(user)
        user = JSON.parse(user)
        // delete user.metas.sequences
        delete user.metas.school
        // delete user.sequences
        ws.cell(row, 2).string(user.name)
        var sequences = user.metas.sequences
        if(typeof sequences === 'undefined'){
            ws.cell(row, 3).number(0)
            ws.cell(row, 4).number(0)
            ws.cell(row, 5).number(0)
            ws.cell(row, 6).number(0)
            ws.cell(row, 7).number(0)
            ws.cell(row, 8).number(0)
            ws.cell(row, 9).number(0)
            ws.cell(row, 10).number(0)
            ws.cell(row, 11).number(0)
            ws.cell(row, 12).number(0)
            continue
        } 
        var subtest = 3, IPS = 0, IPA = 0, BAHASA1 = 0, BAHASA2 = 0, hasil1 = "", hasil2 = ""
        for (var j = 0; j < sequences.length; j++) 
        {
            var quis = j+1
            if(quis%2 != 0) continue;
            var sequence = sequences[j].contents
            var nilai = 0
            for(var k = 0; k < sequence.length; k++)
            {
                var content = sequence[k]
                // if(content.childs.length == 0) continue;
                if(typeof content.selected === 'undefined') continue
                var selected = content.selected
                var post = await Post.findById(selected)
                if(post && post.type_as == "correct answer") nilai++
            }
            // user.nilai.push({
            //     title:sequences[j].title,
            //     nilai:nilai
            // })
            // user[""+sequences[j].title] = nilai
            if(subtest <= 4) BAHASA1+=nilai
            if(subtest == 5 || subtest == 6) BAHASA2+=nilai
            if(subtest <= 6) IPS+=nilai
            if(subtest >= 7) IPA+=nilai
            ws.cell(row, subtest).number(nilai)
            subtest++
        }
        hasil1 = IPS > IPA ? "IPS" : "IPA"
        hasil1 = IPS == IPA ? "?" : hasil1
        hasil2 = BAHASA1 < BAHASA2 ? "BAHASA" : ""
 
        ws.cell(row, 11).string(hasil1)
        ws.cell(row, 12).string(hasil2)
    }
     
    // Create a reusable style
    // var style = wb.createStyle({
    //   font: {
    //     color: '#FF0800',
    //     size: 12,
    //   },
    //   numberFormat: '$#,##0.00; ($#,##0.00); -',
    // });
     
    // // Set value of cell A1 to 100 as a number type styled with paramaters of style
    // ws.cell(2, 1)
    //   .number(100)
     
    // // Set value of cell B1 to 200 as a number type styled with paramaters of style
    // ws.cell(2, 2)
    //   .number(200)
     
    // // Set value of cell C1 to a formula styled with paramaters of style
    // ws.cell(2, 3)
    //   .formula('A1 + B1')
     
    // // Set value of cell A2 to 'string' styled with paramaters of style
    // ws.cell(3, 1)
    //   .string('string')
     
    // // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
    // ws.cell(4, 1)
    //   .bool(true)
     
    wb.write('uploads/'+school.name+'.xlsx');

    res.json({file:'uploads/'+school.name+'.xlsx'});
}

exports.getParticipantsActive = async (req, res) => {
    var users = await User.find({'metas.school._id':req.params.school_id})
    users = JSON.stringify(users)
    users = JSON.parse(users)
    var reports = []
    for(var i=0;i<users.length;i++)
    {
        var participant = users[i]
        var user = await User.findById(users[i]._id)
        if(!user) continue
        user = JSON.stringify(user)
        user = JSON.parse(user)
        // delete user.metas.sequences
        delete user.metas.school
        // delete user.sequences
        var sequences = user.metas.sequences
        if(typeof sequences === 'undefined'){
            user.metas.NISN = participant.nis
            reports.push(user)
            continue
        } 
        for (var j = 0; j < sequences.length; j++) 
        {
            var quis = j+1
            if(quis%2 != 0) continue;
            var sequence = sequences[j].contents
            var nilai = 0
            for(var k = 0; k < sequence.length; k++)
            {
                var content = sequence[k]
                // if(content.childs.length == 0) continue;
                if(typeof content.selected === 'undefined') continue
                var selected = content.selected
                var post = await Post.findById(selected)
                if(post && post.type_as == "correct answer") nilai++
            }
            // user.nilai.push({
            //     title:sequences[j].title,
            //     nilai:nilai
            // })
            user[""+sequences[j].title] = nilai
        }
        delete user.metas.sequences
        reports.push(user)
    }
    res.json(reports)
}

exports.delete = function (req, res) {
    Exam.remove({
        _id: req.params.exam_id
    }, function (err, contact) {
        if (err)
        {
            res.send(err);
            return
        }
        res.json({
            status: "success",
            message: 'Exam deleted'
        });
    });
};

exports.startExam = async (req, res) => {
    var user = await User.findById(req.user._id)
    var metas = JSON.stringify(user.metas)
    metas = JSON.parse(metas)
    var req_metas = Object.keys(req.body)

    req_metas.forEach(val => {
        metas[""+val] = req.body[val]
    })

    
    
    // var exam = await Exam.findById(req.body.exam_id).populate('participants')
    var _sequences = await Sequence.find({})
    var sequences = []
    for(var i=0;i<_sequences.length;i++)
    {
        var sequence = _sequences[i]
        sequence = JSON.stringify(sequence)
        sequence = JSON.parse(sequence)
        var contents = []
        for(var j=0;j<sequence.contents.length;j++)
        {
            var content = JSON.stringify(sequence.contents[j])
            content = JSON.parse(content)
            delete content.category
            var sub_contents = content.type_as == "question" ? await Post.find({'parent._id':new mongoose.Types.ObjectId(content._id)}).select('-type_as -parent') : {}
            sub_contents = sub_contents.length ? sub_contents.sort(() => Math.random() - 0.5) : {};
            contents.push({
                parent:content,
                childs:sub_contents
            })
        }
        sequence.contents = contents
        sequences.push(sequence)
    }
    sequences = sequences.sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0))
    metas.sequences = sequences
    metas.seqActive = 0
    var userUpdate = await User.findOneAndUpdate({
        _id: req.user._id,
    },{
        metas: metas
    })
    res.json({
        status: "success",
        message: 'Exam start',
        user:userUpdate,
        data:sequences
    });
}

exports.sendUserSequence = async (req, res) => {
    var user = await User.findById(req.user._id)
    var metas = JSON.stringify(user.metas)
    metas = JSON.parse(metas)
    metas.sequences = req.body.sequences
    metas.seqActive = req.body.seqActive
    var userUpdate = await User.findOneAndUpdate({
        _id: req.user._id,
    },{
        metas: metas
    })
    res.json({
        status: "success",
        message: 'Sequence Saved',
        user:userUpdate,
    });
}

exports.finishExam = async (req, res) => {
    var user = await User.findById(req.user._id)
    var metas = JSON.stringify(user.metas)
    metas = JSON.parse(metas)
    metas.exam_finished = true
    var userUpdate = await User.findOneAndUpdate({
        _id: req.user._id,
    },{
        metas: metas
    })
    res.json({
        status: "success",
        message: 'Exam Finished',
        user:userUpdate,
    });
}