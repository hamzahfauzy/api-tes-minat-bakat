// Import contact model
User = require('./../models/User');
// Handle index actions
exports.index = async function (req, res) {
    try 
    {
        let users = await User.find({$or:[ {isAdmin : { '$exists' : false }}, {isAdmin:false}]})
        if(users)
            res.json({
                status: "success",
                message: "users retrieved successfully",
                data: await users
            });
        else
            res.json({
                status: "error",
                message: "user not found",
            });
    }
    catch(err)
    {
        res.json({
            status: "error",
            message: err.stack,
        });
    }
    return
    
    
    // User.getParticipant(function (err, users) {
    //     if (err) {
    //         res.json({
    //             status: "error",
    //             message: err,
    //         });
    //     }
    //     res.json({
    //         status: "success",
    //         message: "users retrieved successfully",
    //         data: users
    //     });
    // }).catch(e => {
    //     res.json({
    //         status: "error",
    //         message: e,
    //     });
    // });
};

exports.login = async function (req, res) {
    if(!req.body.username || !req.body.password)
        return res.status(400).send({
            message:'Username or Password is empty'
        })
    let user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (!user) return res.status(400).send({
        message: "User not found."
    });

    if (!user.status) return res.status(400).send({
        message: "User not active."
    });

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send({
        _id: user._id,
        name: user.name,
        token: token,
    });
};

exports.register = async function (req, res) {
    var user = new User()

    user.name = "Administrator";
    user.username = "admin";
    user.password = "admin";
    user.isAdmin = true;
    user.status = true;
// save the user and check for errors
    user.save(function (err) {
        // if (err)
        //     res.json(err);
        res.json({
            message: 'Admin registered!',
            data: user
        });
    });
};

// Handle create user actions
exports.new = function (req, res) {
    var user = new User();
    user.name = req.body.name ? req.body.name : user.name;
    user.username = req.body.username;
    user.password = req.body.password;
    user.isAdmin  = false;
    user.status   = true;
// save the user and check for errors
    user.save(function (err) {
        // if (err)
        //     res.json(err);
        res.json({
            message: 'New user created!',
            data: user
        });
    });
};

// Handle view user info
exports.view = function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err)
            res.send(err);
        res.json({
            message: 'User details loading..',
            data: user
        });
    });
};

// Handle update user info
exports.update = function (req, res) {
    User.findById(req.params.user_id, function (err, user) {
        if (err)
            res.send(err);
        user.name = req.body.name ? req.body.name : user.name;
        user.username = req.body.username;
        user.password = req.body.password;
        
        // save the user and check for errors
        user.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'User Info updated',
                data: user
            });
        });
    });
};

// Handle delete contact
exports.delete = function (req, res) {
    User.remove({
        _id: req.params.user_id
    }, function (err, contact) {
        if (err)
            res.send(err);
        res.json({
            status: "success",
            message: 'User deleted'
        });
    });
};