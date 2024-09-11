const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

// GLB 파일 저장을 위한 Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일명 중복 방지
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (path.extname(file.originalname) !== '.glb') {
      return cb(new Error('Only GLB files are allowed'));
    }
    cb(null, true);
  }
});

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('glbFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('File uploaded successfully');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 새로운 라우트: 파일 목록 페이지
app.get('/list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'file-list.html'));
});

// 새로운 라우트: 파일 목록 JSON
app.get('/files', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    res.json(files);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});