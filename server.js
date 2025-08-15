const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: 'sbi-results-demo-secret-v3',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 }
}));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const ads = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'ads.json')));
const candidates = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'candidates.json')));

function makeCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

function findCandidate(id, dob) {
  dob = (dob || '').trim();
  const byRoll = candidates.find(c => (c.rollNo === id || c.regNo === id) && c.dob === dob);
  return byRoll || null;
}

app.get('/', (req, res) => {
  res.render('index', { ads });
});

app.get('/login', (req, res) => {
  const captcha = makeCaptcha();
  req.session.captcha = captcha;
  const adId = req.query.ad || '';
  const ad = ads.find(a => a.id === adId) || ads[0];
  res.render('login', { captcha, ad });
});

app.post('/login', (req, res) => {
  const { id, dob, captcha } = req.body;
  if (!id || !dob || !captcha) {
    return res.status(400).render('login', { captcha: makeCaptcha(), ad: ads[0], error: 'All fields are required.' });
  }
  if (!req.session.captcha || captcha.toUpperCase() !== req.session.captcha) {
    req.session.captcha = makeCaptcha();
    return res.status(401).render('login', { captcha: req.session.captcha, ad: ads[0], error: 'Invalid captcha. Please try again.' });
  }
  const candidate = findCandidate(id.trim(), dob.trim());
  if (!candidate) {
    req.session.captcha = makeCaptcha();
    return res.status(401).render('login', { captcha: req.session.captcha, ad: ads[0], error: 'Invalid credentials. Check Roll/Reg No and DOB (dd-mm-yyyy).' });
  }
  req.session.authRoll = candidate.rollNo;
  res.redirect(`/result/${encodeURIComponent(candidate.rollNo)}`);
});

app.get('/result/:roll', (req, res) => {
  const roll = req.params.roll;
  const cand = candidates.find(c => c.rollNo === roll);
  if (!cand) return res.status(404).send('Result not found');
  if (req.session.authRoll !== roll) {
    return res.redirect('/login');
  }
  res.render('result', { cand });
});

app.get('/captcha', (req, res) => {
  const c = makeCaptcha();
  req.session.captcha = c;
  res.json({ captcha: c });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Careers app running at http://localhost:${PORT}`);
});
