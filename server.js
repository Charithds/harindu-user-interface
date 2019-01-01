// server.js

const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser')
const app = express();
const router = express.Router();

const DIR = './uploads';
app.use(express.static(path.join(__dirname, 'public')))

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
});
let upload = multer({storage: storage});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

 
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
 
app.get('/api', function (req, res) {
  res.end('file upload example');
});

app.get('/api/files', function(req, res) {
  fs.readdir(DIR, function(err, files) {
    res.setHeader('Content-Type', 'application/json');
    video_files = [];

    var j = 0;
    for (var i=0; i<files.length; i++){
      var file_name = files[i];
      if(file_name.endsWith(".mp4") || file_name.endsWith(".webm")){
        var sub_file = DIR+"/"+file_name.substr(0, file_name.lastIndexOf(".")) + ".srt";
        var content = "";
        if(fs.existsSync(sub_file)){
          content = fs.readFileSync(DIR+"/"+file_name.substr(0, file_name.lastIndexOf(".")) + ".srt", "utf8");
        }
        video_files.push({'id':j++, 'name': files[i], 'content':content});
      }
    }
    console.log(video_files);
      res.send(JSON.stringify(video_files));
    });
  
})
 
app.post('/api/upload',upload.single('video-file'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
          success: false
        });
    
      } else {
        console.log('file received');
        return res.send({
          success: true
        })
        //TODO: runs the video process
      }
});
 
const PORT = process.env.PORT || 8000;
 
app.listen(PORT, function () {
  console.log('Node.js server is running on port ' + PORT);
});

// video get
app.get('/video', function(req, res) {
  const path = 'assets/Family.Guy.S15E01.The.Boys.in.the.Band.720p.WEB-DL.x264.AAC.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})