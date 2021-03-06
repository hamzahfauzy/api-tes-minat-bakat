// Import express
let express = require('express')

var cors = require('cors')
// Initialize the app
let app = express();

app.use(cors())

const config = require("config");

if (!config.get("myprivatekey")) {
  console.error("FATAL ERROR: myprivatekey is not defined.");
  process.exit(1);
}

// Import routes
let apiRoutes = require("./routes/api-routes")

// Import Body parser
let bodyParser = require('body-parser');

// Configure bodyparser to handle post requests
// app.use(bodyParser.urlencoded({
//    extended: true
// }));
// app.use(bodyParser.json());

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

// Use Api routes in the App
app.use('/api', apiRoutes)

// Import Mongoose
let mongoose = require('mongoose');

// Connect to Mongoose and set connection variable
mongoose.connect('mongodb://localhost/minatbakat', { useNewUrlParser: true});
var db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

// Setup server port
var port = process.env.PORT || 9000;

// Send message for default URL
app.get('/', (req, res) => res.send('Hello World with Express'));

// Launch app to listen to specified port
app.listen(port, '0.0.0.0', function () {
     console.log("Running Minat Bakat API on port " + port);
});

var d = new Date()

// var utc_offset = d.getTimezoneOffset()

// d.setMinutes(d.getMinutes() + utc_offset)
console.log("UTC : "+d)