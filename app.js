let list=[];
i=0;
require("dotenv").config()
let path = require('path')
const express = require('express')

const app = express();

const PORT= process.env.PORT || 3000

app.set('view engine','ejs');
app.set("views",path.join(__dirname, "./templates/views"))

const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3');


aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,

});
const BUCKET = process.env.BUCKET
const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET,
        key: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
})

app.get("/",(req,res) => {
    if(i==0){
        i=1;
        res.redirect("/list");
    }
    else{
        res.render('index',{list:list});
    }
})

app.post('/upload', upload.single('file'), async function (req, res, next) {
    res.redirect("/list");
})

app.get("/list", async (req, res) => {

    let r = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    let x = r.Contents.map(item => item.Key);
    list=x;
    res.redirect("/")
})


app.get("/download/:filename", async (req, res) => {
    const filename = req.params.filename
    let x = await s3.getObject({ Bucket: BUCKET, Key: filename }).promise();
    res.send(x.Body)
})

app.get("/delete/:filename", async (req, res) => {
    const filename = req.params.filename
    await s3.deleteObject({ Bucket: BUCKET, Key: filename }).promise();
    res.redirect("/list");

})

app.get("*",(req,res) => {
    res.send("error hai bhaya");
})



app.listen(PORT, () => {
    console.log("Server is running at lolz"+PORT);
})