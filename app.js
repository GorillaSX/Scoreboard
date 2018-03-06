var bodyParser = require("body-parser"),
mongoose       = require("mongoose"),
express        = require("express"),
app            = express();
require("dotenv").config();
var CSV = require('csv-string');

mongoose.connect("mongodb://mongo:27017/scoreboards",function(err){
    if(err)
        process.exit();
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//Mongoose model configure

var Student = new mongoose.Schema({
    firstName: String,
    lastName: String,
    score: Number
});

var Score = new mongoose.Schema({
    term : String,
    records : [Student]
});

var ScoreBoard = new mongoose.Schema({
    term: String,
    id : mongoose.Schema.Types.ObjectId
});

var Scores = mongoose.model("score", Score);
var ScoreBoards = mongoose.model("scoreboard", ScoreBoard);



/*ScoreBoard.create({term: "HW2", records:[]}, function(err, res){
    if(err)
    {
        console.log("create hw1 error");
    }
});

var record = {"name":"lily", "score":99};
ScoreBoard.findOneAndUpdate({term: "HW2"}, {$push: { records :record }}, function(err, req){
    if(err)
    {
        console.log("find and upate error");
    }
});*/

app.get("/",function(req, res){
    ScoreBoards.find({}, function(err, terms){
        if(err)
        {
            console.log("Find Error");
        }
        else
        {
            res.render("home", {terms : terms});
        }
    });
});

app.get("/scoreboard/new",function(req, res){
    ScoreBoards.find({}, function(err, terms){
        if(err)
            console.log("/new Error");
        else
            res.render("new",{terms: terms, error: false});
    });
});


app.post("/scoreboard/new", function(req, res){
    if(req.body.action == "discard")
        res.redirect("/");
    else
    {
        Scores.count({term: req.body.term}, function(err,count){
            if(count == 0)
            {
                Scores.create({term:req.body.term, records:[]},function(err, record){
                    if(err)
                        console.log("Create Error");
                    else
                    {
                        ScoreBoards.create({term: req.body.term, id : record._id}, function(err, term){
                            res.redirect("/scoreboard/" + record._id + "/add");
                        });
                    }
                });
            }
            else
            {
                ScoreBoards.find({}, function(err, terms){
                    if(err)
                        console.log("/new Error");
                    else
                        res.render("new",{terms: terms, error: true});
                });
            }
        });
    }
});

app.get("/scoreboard/:id", function(req, res){
    Scores.findById(req.params.id, function(err, term){
        if(err)
        {
            console.log("FindById Error at /:id/add");
        }
        ScoreBoards.find({}, function(err, terms){
            res.render("show", {terms: terms, records: term.records, id: req.params.id, error : false, display: false});
        });
    });
});

app.get("/scoreboard/:id/download", function(req, res){
    var data = []
    Scores.findById(req.params.id, function(err, term){
        if(err)
            console.log("Download error");
        else
        {
            for(var i = 0;i < term.records.length;i++)
            {
                data.push([term.records[i].firstName, term.records[i].lastName, term.records[i].score]);
            }
            res.send(CSV.stringify(data));
        }
    });
});
app.post("/scoreboard/:id",function(req, res){
    if(req.body.Yes == "true")
    {
        Scores.remove({_id: req.params.id}, function(err){
            if(err)
            {
                console.log("Remove  from Scores Error");
            }
            else
            {
                ScoreBoards.remove({id: req.params.id}, function(err){
                    if(err)
                    {
                        console.log("Remove from Scoreboards error");
                    }
                    else
                    {
                        res.redirect("/");
                    }
                });
            }
        });
    }
});

app.post("/scoreboard/:id/EditName", function(req, res){
        Scores.count({term: req.body.term}, function(err,count){
            if(count == 0)
            {
                Scores.findByIdAndUpdate(req.params.id,{$set : { term : req.body.term}},function(err, record){
                    if(err)
                        console.log("Create Error");
                    else
                    {
                        ScoreBoards.findOneAndUpdate({id : req.params.id}, {$set : {term : req.body.term}},function(err){
                            res.redirect("/scoreboard/" + record._id);
                        });
                    }
                });
            }
            else
            {
                Scores.findById(req.params.id, function(err, term){
                    if(err)
                    {
                        console.log("FindById Error at /:id/add");
                    }
                    ScoreBoards.find({}, function(err, terms){
                        res.render("show", {terms: terms, records: term.records, id: req.params.id, error : true, display: true});
                    });
                });
            }
        });
});
app.post("/scoreboard/:id/add/EditName", function(req, res){
    Scores.count({term: req.body.term}, function(err,count){
        if(count == 0)
        {
            Scores.findByIdAndUpdate(req.params.id,{$set : { term : req.body.term}},function(err, record){
                if(err)
                    console.log("Create Error");
                else
                {
                    ScoreBoards.findOneAndUpdate({id : req.params.id}, {$set : {term : req.body.term}},function(err){
                        res.redirect("/scoreboard/" + record._id + "/add");
                    });
                }
            });
        }
        else
        {
            Scores.findById(req.params.id, function(err, term){
                
                if(err)
                {
                    console.log("FindById Error at /:id/add");
                }
                ScoreBoards.find({}, function(err, terms){
                    res.render("add", {terms: terms, records: term.records, id: req.params.id, error : true, display: true});
                });
            });
        }
    });
});
app.get("/scoreboard/:id/add", function(req, res){
    Scores.findOne({_id: req.params.id}, function(err, term){
        if(err)
        {
            console.log("FindById Error");
        }
        ScoreBoards.find({}, function(err, terms){
            res.render("add", {terms: terms, records: term.records, id: req.params.id,error: false, display: false});
        });
    });
});

app.post("/scoreboard/:id/add",function(req, res){
    var record = {"firstName":req.body.student.FirstName, "lastName": req.body.student.LastName,"score":req.body.student.Score};
    Scores.findOneAndUpdate({_id: req.params.id}, {$push: { records :record }}, function(err, result){
        res.redirect("/scoreboard/" + req.params.id + "/add");
    });
 });

 app.post("/scoreboard/:termid/:studentid/edit/:choice", function(req, res){
    var set = {}
    set['records.$.' + req.params.choice] = req.body.value;
    Scores.update({_id : req.params.termid, "records._id" : req.params.studentid}, {$set: set}, function(err, doc){
    });
 });

 app.post("/scoreboard/:termid/:studentid/delete", function(req, res){
     console.log("enter");
     Scores.findById(req.params.termid, function(err, term){
         if(err)
            console.log("delete error");
         term.records.id(req.params.studentid).remove();
         term.save(function(err){
             if(err) 
                console.log("save error");
             else
                res.redirect("/scoreboard/" + req.params.termid + "/add");
         });
     });
 });

app.listen(process.env.PORT, function(){
    console.log("Server is Running at http://" + process.env.IP + ":" + process.env.PORT);
});
