let express = require('express');
let bodyParser = require('body-parser');
//Get a refernce to MongoDB module ref
let mongodb = require('mongodb');
//From ref, get the client
let mongoClient = mongodb.MongoClient;

let app = express();

app.use(express.static(__dirname + '/public'));
let path2public = __dirname + '/public/';

//Configure Express to handle the engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//Required to parse url encoded data into req.body
app.use(bodyParser.urlencoded({
    extended: false
}))

//Required to use the body as a json
app.use(bodyParser.json());

let db = [];
let col = null;
let url = "mongodb://localhost:27017";

//Connect to MongoDB server
mongoClient.connect(url, {useNewUrlParser: true}, function(err, client){

    db = client.db("Wk06Lab");
    col = db.collection("tasks");

});

app.get('/', function (req, res) {
    res.sendFile(path2public + '/index.html');
})

app.get('/newTask', function (req, res) {
    res.render(path2public + 'newTask.html');
})

app.post('/newTask', function (req, res) {
    
    let task = {
        taskName: req.body.taskName,
        taskDue: req.body.taskDue,
        taskDesc: req.body.taskDesc
    }
    db.push(task);

    res.render(path2public + 'listTasks.html', {db: db});
})

app.get('/listTasks', function (req, res) {
    //res.sendfile(__dirname + '/listTasks.html');  
    res.render(path2public + 'listTasks.html', {db: db});
})


app.listen(8080, () => {
    console.log('server started...');
})