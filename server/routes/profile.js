const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User');
const multer = require('multer');
const STATICFOLDER = 'public';
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'AKIAUQDWEJMJVEIOGBGX',
    secretAccessKey: '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'
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, STATICFOLDER)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage }).single('file')

router.get('/get', auth, async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.id).select("-password -conversation -friends")
        res.json({ profile: userProfile })
    } catch (error) {
        console.error("error in getting profile", error.message);
        res.status(500).json({ error: error.message })
    }
})

router.post('/uploadProfile', auth, async (req, res) => {
    try {
        upload(req, res, (err) => {
            if (err) {
                console.log("err", err)
                res.sendStatus(500);
            }
            const filePath = path.join(__dirname, '../' + STATICFOLDER + '/');
            const fileDestination = filePath + req.file.filename;
            console.log("fileDestination", fileDestination);
            const fileContent = fs.readFileSync(fileDestination);

            // Setting up S3 upload parameters
            const params = {
                Bucket: 'connectmeandyou',
                Key: 'hmmm.jpg', // File name you want to save as in S3
                Body: fileContent,
                ContentType: 'image/jpeg',
                ACL: 'public-read'
            };

            // Uploading files to the bucket
            s3.upload(params, function (err, data) {
                if (err) {
                    console.log('s3 upload err', err);
                }
                console.log(`File uploaded successfully. ${data.Location}`);
            });

            res.send(req.file);
        });
    } catch (error) {
        console.error('error in uploading profile', error.message)
        res.status(500).json({ error: error.message })
    }
})



module.exports = router