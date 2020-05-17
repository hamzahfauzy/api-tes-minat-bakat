// Import contact model
Exam = require('./../models/Exam');
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
            message: 'User exam loading..',
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