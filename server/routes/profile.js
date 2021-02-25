const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User');
const multer = require('multer');
const STATICFOLDER = 'public';
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
require('dotenv').config()


const s3 = new AWS.S3({
    accessKeyId: process.env.S3ACCESSKEY,
    secretAccessKey: process.env.S3SECRET
});

const S3ProfileDir = 'user/'

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
    const userId = req.user.id
    let userProfileImg = ""
    try {
        upload(req, res, (err) => {
            if (err) {
                console.log("err", err)
                res.sendStatus(500);
            }
            const fileName = req.file.filename.slice(0, req.file.filename.lastIndexOf("."))
            const filePath = path.join(__dirname, '../' + STATICFOLDER + '/');
            const originalFileDestination = filePath + req.file.filename;
            const processedFileDestination = filePath + fileName + '.webp'

            console.log('req.file', req.file)
            sharp(originalFileDestination).resize(500).toFile(filePath + fileName + '.webp')
                .then(data => {
                    console.log("webp data", data)
                    const fileContent = fs.readFileSync(processedFileDestination);
                    const params = {
                        Bucket: 'connectmeandyou',
                        Key: S3ProfileDir + fileName + '.webp', // File name you want to save as in S3
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
                        userProfileImg = data.Location
                        User.findByIdAndUpdate(userId, { picture: userProfileImg })
                            .then(response => { console.log("done") })
                        res.json({ location: userProfileImg });
                    });

                    fs.unlinkSync(originalFileDestination)
                    fs.unlinkSync(processedFileDestination)
                })
                .catch(err => { console.log("webp err", err) })
        });


    } catch (error) {
        console.error('error in uploading profile', error.message)
        res.status(500).json({ error: error.message })
    }
})

router.post("/updateInfo", auth, async (req, res) => {
    try {
        const email = req.body.email;
        console.log("email", email)
        if (email !== undefined && email !== null && email !== "") {
            const isEmailExisted = await User.findOne({ email: req.body.email })
            console.log("isEmailExisted", isEmailExisted)
            if (isEmailExisted) {
                res.status(400).json({ error: "Email is existed" })
                return
            }
        }
        const updatedProfile = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select("-password")
        res.json({ user: updatedProfile })
    } catch (error) {
        console.error("error updateInfo", error.message)
        res.status(500).json({ error: "server error" })
    }
})


router.post("/updatePassword", [[
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })], auth], async (req, res) => {
        try {
            const userRole = req.header("UserRole");
            const salt = await bcrypt.genSalt(10);
            const user = await User.findById(req.user.id).select("password");

            if (userRole !== "tempUser") {
                const isMatch = await bcrypt.compare(req.body.password, user.password);
                if (!isMatch) {
                    res.status(400).json({ error: 'Invalid Credential' })
                    return
                }
            }

            const updatedProfile = {}
            updatedProfile.password = await bcrypt.hash(req.body.newPassword, salt);
            await User.findByIdAndUpdate(req.user.id, updatedProfile);
            res.send("ok")

        } catch (error) {
            console.error("error update password", error.message)
            res.status(500).json({ error: error.message })
        }
    })

router.post("/friendsProfile", auth, async (req, res) => {
    try {
        const { contacts } = req.body
        let updatedFriendList = []
        for (let contact of contacts) {
            const user = await User.findById(contact.id, { new: true }).select("picture bio");
            console.log("friend picture", user.picture)
            if (user.picture !== undefined) {
                const contactJson = { ...contact, avatar: user.picture, bio: user.bio }
                updatedFriendList.push(contactJson)
            } else {
                updatedFriendList.push(contact)
            }

        }

        res.json({ contacts: updatedFriendList })


    } catch (error) {
        console.error("error", error.message)
        res.status(500).json({ error: error.message })
    }
})

router.get('/friendDetails', auth, async (req, res) => {
    try {
        const friendDetail = await User.findById(req.query.id)
        res.json({ friend: friendDetail })
    } catch (error) {
        console.error("error", error.message)
        res.status(500).json({ error: error.message })
    }
})

module.exports = router