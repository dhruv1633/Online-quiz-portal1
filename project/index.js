var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var path    = require("path");
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/myproject');

var userSchema = mongoose.Schema({
   email: String,
   password: String,
});

var qSchema = mongoose.Schema({
   tname: String,
   q: String,
   op1: String,
   op2: String,
   op3: String,
   op4: String,
   ans: String,
});

var regSchema = mongoose.Schema({
    email:String, 
    tname:String,
});

var users = mongoose.model("users", userSchema);
var csquestions = mongoose.model("csquestions", qSchema);
var registers5 = mongoose.model("registers5", regSchema);
app.set('view engine', 'ejs');



app.get('/ques', function(req, res){
     res.render('generatetest');
});

app.get('/reg/:id', function(req, res){
     res.render('student_register',{test:req.params.id});
});


app.get('/people', function(req, res){
   users.find(function(err,response){
      res.json(response);
   });
});

app.get('/question', function(req, res){
   csquestions.find(function(err,response){
      res.json(response);
   });
});

app.get('/register', function(req, res){
   registers5.find(function(err,response){
      res.json(response);
   });
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({secret:'zxcy'}));

app.use(cookieParser());
app.use(session({ secret: 'zxcv' }));
app.use(flash()); 


app.get('/signup', function(req, res){
    req.flash('success','Welcome');
      res.redirect('/');
});


app.get('/login', function(req, res){
     req.flash('success','Welcome');
      res.redirect(301, '/l');
});



app.post('/data', function(req, res){
    var userInfo = req.body;
   
   if(!userInfo.email || !userInfo.password){
      //res.redirect('/signup');
     req.flash('success','please fill credentials');
      res.redirect(301, '/');
	
   } 
      else{
      users.findOne({email:userInfo.email},function(err,response){
      if(err)
      res.send("error");
      else
      if(response)
      {	
      //res.send('<script>alert("User already exists! login or use other emailID")</script>');
      req.flash('success','User already exists! login or use other emailID');
      res.redirect(301, '/');
      }
      else {
      var newuser = new users({
         email: userInfo.email,
         password: userInfo.password,
      });
		
      newuser.save(function(err, users){
         if(err)
            res.send('<script>alert("Database error")</script>');
         else
          //res.send('<script>alert("Successful submission")</script>');
            req.flash('success','successful submission');
           res.redirect(301, '/');
      });
   }
      });

}
});

app.get('/', function(req, res ) {
  res.render('signup', {expressFlash: req.flash('success') });
});



app.post('/login',function(req,res){
var userInfo=req.body;
users.findOne({email:userInfo.email},function(err,response){
      if(err)
      res.send("error");
      if(!response)
      {
      //res.send('<script>alert("not signed in")</script>');
      req.flash('success','not signed in');
           res.redirect(301, '/l');
      }
      else
      if(response.password === userInfo.password)
       {
       req.session.email=req.body.email;
      req.session.password=req.body.password;
//for admin panel      
users.findOne({ "email" : { $regex: /ayush@gmail.com/, $options: 'i' } },
          function (err, response) {
                 if (err) return handleError(err);
                 if(response.email === userInfo.email)
                 res.render('admin');
                 else
            //for teacher panel
                 users.findOne({ "email" : { $regex: /chitkarauniversity/, $options: 'i' } },
          function (err, response) {
                 if (err) return handleError(err);
                 if(response.email == userInfo.email)
                 res.render('teacher');
                 else
                //for student panel
                    res.render('student', {semail: userInfo.email});    
               });
               
          });
        }
      else
      {
      //res.send('<script>alert("Invalid credentials")</script>');
      req.flash('success','Invalid credentials');
           res.redirect(301, '/l');
      }
     
});

});

app.get('/l', function(req, res ) {
  res.render('login', {expressFlash: req.flash('success') });
});



 

function checkAuth(req, res, next){
if(!req.session.email) {
res.redirect('login');
}
else {
next();
}
}

function checkadmin(req, res ,next){
if(req.session.email!='ayush@gmail.com') {
console.log('unauthorized');
}
else {
next();
}
}

function checkteacher(req, res ,next){
users.findOne({ "email" : { $regex: /chitkarauniversity/, $options: 'i' } },
          function (err, response) {
                 if (err) return handleError(err);
                 if(response.email == req.session.email)
                 next();
                 else
                 console.log('unauthorized');   
               });
               
         
}

function checkstudent(req, res ,next){
users.findOne({ "email" : { $regex: /chitkarauniversity/, $options: 'i' } },
          function (err, response) {
                 if (err) return handleError(err);
                 else if(response.email == req.session.email)
                  console.log('unauthorized');
                 else
                   { 
                   if(req.session.email!='ayush@gmail.com')
                   next();
                   else
                  console.log('unauthorized'); 
             }
               
             });
              
         
}




app.get('/admin_student',checkAuth,checkadmin, function(req, res){
users.find({"email": { $not: /chitkarauniversity/}}
,function(err, docs){
		if(err) res.json(err);
		else    res.render('slist', {users: docs});
	});
});

app.get('/admin_teacher',checkAuth,checkadmin, function(req, res){
users.find({ "email" : { $regex: /chitkarauniversity/, $options: 'i' } }, function(err, docs){
		if(err) res.json(err);
		else    res.render('tlist', {users: docs});
	});
});



app.get('/attempted/:id', function(req, res){
registers5.find({tname:req.params.id}
,function(err, docs){
		if(err) res.json(err);
		else    res.render('attempted tests', {att: docs});
	});
});



app.get('/admin',checkAuth,checkadmin, function(req,res){
res.render('admin');
});

app.get('/teacher',checkteacher, function(req,res){
res.render('teacher');
});


app.get('/edit', function(req, res){
  res.render("user/edit", {user: req.user, csrfToken: req.csrfToken()});
});

app.post('/user/:email/delete', function(req, res){
  users.remove({email: req.params.email},function(err){
    if(err){
    res.json(err);
    }
    else{
    res.render('admin');
     }
   });
});


app.get('/cq',checkteacher, function(req, res){
 var quesInfo = req.body;
   
   if(!quesInfo.tname || !quesInfo.q || !quesInfo.op1 || !quesInfo.op2 || !quesInfo.op3 || !quesInfo.op4 || !quesInfo.ans){
      res.render('test');	
   } 
      else {
      var newques = new csquestions({
         tname: quesInfo.tname,
         q: quesInfo.q,
         op1: quesInfo.op1,
         op2: quesInfo.op2,
         op3: quesInfo.op3,
         op4: quesInfo.op4,
         ans: quesInfo.ans,
      });
		
      newques.save(function(err, csquestions){
         if(err)
            res.send('<script>alert("Database error")</script>');
         else
           res.render('generate test');
           
      });
   }
       
});

app.get('/onlinequiz/tests', function(req, res){
  res.render('student_register');
});

app.post('/onlinequiz', function(req, res){
  users.findOne({email:req.body.email}
,function(err, response){
		if(err) res.json(err);
                else if(!response)
                res.send('<script>alert("Not signed in")</script>');
                else 
                if(response.email === req.body.email)
                {
                  var regInfo = req.body; 
                 var reg = new registers5({
                 tname: regInfo.tname,
                 email: regInfo.email,
                });
		
                reg.save(function(err, csquestions){
                if(err)
                res.send('<script>alert("Database error")</script>');
                else
                res.render('start_test', {test: req.body.tname});
           
               });
   
           }
                
	});
});





app.get('/onlinequiz/:email/:lang',function(req, res){
                 var reg = new registers5({
                 tname: req.params.lang,
                 email: req.params.email,
                });
		
                reg.save(function(err, csquestions){
                if(err)
                res.send('<script>alert("Database error")</script>');
                else
                 res.render('start_test', {test: req.params.lang});
           
               });
 
});

app.get('/onlinequiz/:test',checkstudent, function(req, res){
csquestions.find({tname:req.params.test}
,function(err, docs){
		if(err) res.json(err);
		else    res.render('cprog', {cq: docs});
	});
});

app.get('/logout',function(req,res){
req.session.destroy(function(err){
if(err)
console.log(err);
else{
res.redirect('login');
}
});
});


app.listen(3000);