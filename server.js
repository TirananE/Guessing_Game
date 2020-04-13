'use strict';
const express = require('express');
const path = require('path')

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

// Constants
const PORT = 8000;
const HOST = '127.0.0.1';
// App
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))


app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

const mongoose = require('mongoose');
const mongo_uri = 'mongodb://localhost/GuessingGame';
mongoose.Promise = global.Promise;
mongoose.connect(mongo_uri, { useNewUrlParser: true }).then(
  () => {
    console.log("[success] task 2 : connected to the database ");

    const statisticSchema = mongoose.Schema({
      stage: {type : String},
      question: {type : Array},
      guessing: {type : Array},
      fail: Number,
      step: Number
    });
    
      
    const Stat = mongoose.model("Stats", statisticSchema);
    
    const games = new Stat({
      stage: 'home',
      question: ['A', 'B', 'C', 'D'],
      guessing: ["_", "_", "_", "_"],
      fail: 0,
      step: 0
      });
    games.save();

app.get('/', function (req, res) {
  Stat.findOne().sort({_id: -1}).limit(1).exec((err, data) => {
    res.render('home', data);
  })
});


app.post('/start', (req,res)=>{
  Stat.findOne().sort({_id: -1}).limit(1).exec((err, data) => {
    let alphabet = ['A','B','C','D'];
    if (err) {console.log(err);}
    let x1 = Math.floor((Math.random() * alphabet.length));
    let x2 = Math.floor((Math.random() * alphabet.length));
    let x3 = Math.floor((Math.random() * alphabet.length));
    let x4 = Math.floor((Math.random() * alphabet.length));
    data.question = [alphabet[x1],alphabet[x2],alphabet[x3],alphabet[x4]];
    data.stage = 'game';
    data.save();
    res.redirect('/');
  })
});

app.post('/guess',(req,res)=>{
  const ch = req.body.alphabet;
  Stat.findOne().sort({_id: -1}).limit(1).exec((err, data) => {
    if (err) {
        console.log(err);
    }
    data.guessing.push(ch);
    data.guessing.shift();
    if(data.guessing == data.question){
      data.stage = 'result';
      data.save();
      res.redirect('/');
    }

    let status = false;
    for(let i = 0; i < 4; i++) {
      if (data.guessing[i] !== data.question[i]) {
        status = true;
      }
    }
    if ( $.inArray("_", data.guessing) == -1 && status ){
      data.fail += 1;
      data.save();
      res.redirect('/complete');
    } else {
      data.save();
      res.redirect('/');
    }
  })
});

app.get('/complete', (req, res) => {
  Stat.findOne().sort({_id: -1}).limit(1).exec((err, data) => {
    data.guessing = ["_", "_", "_", "_"];
    data.step = 0;
    data.save();
    res.redirect('/');
  })
})

app.post('/finish', (req,res)=>{
  Stat.findOne().sort({_id: -1}).limit(1).exec((err, data) => {
    data.stage = 'result';
    data.save();
    res.redirect('/');
  })
});

app.post('/home', (req,res)=>{
  Stat.findOne().sort({_id: -1}).limit(1).exec((err, data) => {
    data.stage = 'home';
    data.guessing = ["_", "_", "_", "_"];
    data.step = 0;
    data.save();
    res.redirect('/');
  })
});
  },
  error => {
    console.log("[failed] task 2 " + error);
    process.exit();
  }
);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
