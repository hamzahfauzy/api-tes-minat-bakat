// Initialize express router
let router = require('express').Router();
let admin = require("./../applications/middlewares/admin");
let auth = require("./../applications/middlewares/auth");
// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'API Its Working',
        message: 'Welcome to Minat Bakat API!'
    });
});

var userController = require('./../applications/controllers/UserController');
var categoryController = require('./../applications/controllers/CategoryController');
var postController = require('./../applications/controllers/PostController');
var examController = require('./../applications/controllers/ExamController');

router.post('/login', userController.login)
router.post('/register-admin', userController.register)

router.use(admin)

router.route('/users')
    .get(userController.index)
    .post(userController.new);
router.route('/users/:user_id')
    .get(userController.view)
    .patch(userController.update)
    .put(userController.update)
    .delete(userController.delete);

router.route('/categories')
    .get(categoryController.index)
    .post(categoryController.new);
router.route('/categories/parent/:category_id')
    .get(categoryController.viewParent)
router.route('/categories/:category_id')
    .get(categoryController.view)
    .patch(categoryController.update)
    .put(categoryController.update)
    .delete(categoryController.delete);

router.route('/posts')
    .get(postController.index)
    .post(postController.new);
router.route('/posts/:post_id')
    .get(postController.view)
    .patch(postController.update)
    .put(postController.update)
    .delete(postController.delete);

router.route('/exams')
    .get(postController.index)
    .post(postController.new);
router.route('/exams/:post_id')
    .get(postController.view)
    .patch(postController.update)
    .put(postController.update)
    .delete(postController.delete);
	
// Export API routes
module.exports = router;