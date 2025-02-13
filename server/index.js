const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
 

//middleware
app.use(cors());
app.use(bodyParser.json());

app.use('/',require('./routes/UserRoutes.js'));




mongoose.connect(process.env.MONGO_URI,{useNewUrlParser : true, useUnifiedTopology: true})
.then(()=> console.log('MongoDB Connected'))
.catch((err)=> console.error(err));





app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}` );});



