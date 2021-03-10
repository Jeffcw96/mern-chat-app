const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User');
const multer = require('multer');
const STATICFOLDER = 'public';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const aws = require("../api/aws")
const { check, validationResult } = require('express-validator');

require('dotenv').config()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, "../", STATICFOLDER))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format are allowed!'));
        }
    }
}).single('file')

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
        //create folder if it's not exist
        if (!fs.existsSync('./' + STATICFOLDER)) {
            fs.mkdirSync('./' + STATICFOLDER);
        }
        upload(req, res, (err) => {
            if (err) {
                console.log("err", err.message)
                res.status(500).json({ error: err.message });
                return
            }
            const fileName = req.file.filename.slice(0, req.file.filename.lastIndexOf("."))
            // const filePath = path.join(__dirname, '../' + STATICFOLDER + '/');
            const filePath = path.join(__dirname, '../' + STATICFOLDER + '/');

            const originalFileDestination = filePath + req.file.filename;
            const processedFileDestination = filePath + fileName + '.webp'

            console.log("filePath", filePath, 'processedFileDestination', processedFileDestination)
            console.log('req.file', req.file)
            sharp(originalFileDestination).resize(500).rotate().withMetadata().toFile(filePath + fileName + '.webp')
                .then(data => {
                    const fileContent = fs.readFileSync(processedFileDestination);

                    aws.uploadImageToS3('connectmeandyou', fileName + '.webp', fileContent)
                        .then((data) => {
                            const fileDir = data.Location;
                            console.log(`File uploaded successfully. ${fileDir}`);
                            userProfileImg = fileDir
                            User.findByIdAndUpdate(userId, { picture: userProfileImg })
                                .then(response => { console.log("done") })
                            res.json({ location: userProfileImg });

                            // fs.unlinkSync(originalFileDestination)
                            // fs.unlinkSync(processedFileDestination)
                        })
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