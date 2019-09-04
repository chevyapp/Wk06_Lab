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

//Insert new task page
app.get('/newTask', function (req, res) {
    res.render(path2public + 'newTask.html');
})

//Post request for new task page
app.post('/newTask', function (req, res) {
    let date = new Date(req.body.taskDue);
    
    let newTask = {taskName: req.body.taskName, assignTo: req.body.assignTo, dueDate: date, taskStatus: req.body.taskStatus, taskDesc: req.body.taskDesc};
    col.insertOne(newTask);
    res.redirect('listTasks');
})

//Get all tasks page
app.get('/listTasks', function (req, res) {
    col.find({}).toArray(function(err, data){
        res.render(path2public + 'listTasks.html', {db: data});
    });
})

//Delete Task
app.get('/deleteTask', function(req, res){
    res.sendFile(path2public + 'deleteTask.html');
});

app.post('/deleteTask', function(req, res){
    //ID is an object, hence must change to object - cannot use string directly
    let query = { _id: new mongodb.ObjectID(req.body._id)};
    
    col.deleteOne(query, function(err, obj){
        console.log('Error...' + err); 
    });
    res.redirect('listTasks');
});

//Delete all completed tasks
app.get('/deleteCompleted', function(req, res){
    res.sendFile(path2public + 'deleteCompleted.html');
});

//Post request for Delete all completed
app.post('/deleteCompleted', function(req, res){
    let query = {taskStatus: 'complete'};
    col.deleteMany(query);
    res.redirect('listTasks')
});

//Update Task Status
app.get('/updateStatus', function(req, res){
    res.sendFile(path2public + 'updateStatus.html');
});

app.post('/updateStatus', function(req, res){
    let query = { _id: new mongodb.ObjectID(req.body._id)};    
    let status = { taskStatus: req.body.taskStatus};
    col.updateOne(query, {$set: status}, {upsert: true}, function(err, result){
        console.log('Error...' + err);
    });
    res.redirect('listTasks');
});

app.listen(8080, () => {
    console.log('server started...');
});