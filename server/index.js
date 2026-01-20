require('dotenv').config();
const express = require('express');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello from Express backend!');
});

const pexelsRouter = require('./routes/pexels');
const boardFetchRouter = require('./routes/boardFetch');
const boardDownloader = require('./routes/downloadZip');


app.use(pexelsRouter);
app.use(boardFetchRouter);
app.use(boardDownloader);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
