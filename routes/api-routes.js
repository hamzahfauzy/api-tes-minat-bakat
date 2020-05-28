// Initialize express router
let router = require('express').Router();
let admin = require("./../applications/middlewares/admin");
let auth = require("./../applications/middlewares/auth");
let participant = require("./../applications/middlewares/participant");
// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'API Its Working',
        message: 'Welcome to Minat Bakat API!'
    });
});

var userController = require('./../applications/controllers/UserController');
var categoryController = require('./../applications/controllers/CategoryController');
var mediaController = require('./../applications/controllers/MediaController');
var postController = require('./../applications/controllers/PostController');
var examController = require('./../applications/controllers/ExamController');

router.post('/login', userController.login)
router.post('/register-admin', userController.register)

// router.use(auth)
router.get('/auth-detail', auth, userController.detail)

// router.use(participant)
router.post('/participant/exam/start',participant, examController.startExam)
router.post('/participant/exam/send-answer',participant, examController.sendAnswer) // exam_id, question_id, answer_id, user_token
router.post('/participant/exam/finish',participant, examController.finishExam)

router.use(admin)

router.route('/users')
    .get(userController.index)
    .post(userController.new);
router.route('/users/:user_id')
    .get(userController.view)
    // .patch(userController.update)
    .put(userController.update)
    .delete(userController.delete);

router.route('/categories')
    .get(categoryController.index)
    .post(categoryController.new);
router.route('/categories/parent/:category_id')
    .get(categoryController.viewParent)
router.route('/categories/:category_id')
    .get(categoryController.view)
    // .patch(categoryController.update)
    .put(categoryController.update)
    .delete(categoryController.delete);

router.route('/media')
    .get(mediaController.index)
    .post(mediaController.new);

router.route('/posts')
    .get(postController.index)
    .post(postController.new);
router.post('/posts/import',postController.importPosts)
router.get('/posts/type/:type_as',postController.viewByType)
router.route('/posts/parent/:post_id')
    .get(postController.viewParent)
router.route('/posts/:post_id')
    .get(postController.view) 
    // .patch(postController.update)
    .put(postController.update)
    .delete(postController.delete);

router.route('/exams')
    .get(examController.index)
    .post(examController.new);
router.post('/exams/:exam_id/add-sequence',examController.addSequence)
router.post('/exams/:sequence_id/update-order',examController.updateOrder)
router.post('/exams/:sequence_id/update-countdown',examController.updateCountdown)
router.route('/exams/:exam_id')
    .get(examController.view)
    .post(examController.importParticipants)
    // .patch(examController.update)
    .put(examController.update)
    .delete(examController.delete);

// Export API routes
module.exports = router;