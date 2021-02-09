const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
require('dotenv').config()

router.post('/register', [check('email', 'Please enter a valid email').isEmail(),
check('password', 'Please enter at least 6 characters').isLength({ min: 6 })],
    async (req, res) => {
        const errors = await validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() })
        }

        const user = {}
        const { email, password } = req.body
        const isExist = await User.findOne({ email })
        if (isExist) {
            res.status(400).json({ error: [{ msg: 'User Existed', param: 'cPassword' }] })
            return
        }
        try {
            const salt = await bcrypt.genSalt(10);
            user.email = email;
            user.password = await bcrypt.hash(password, salt);

            const userDB = new User(user);
            await userDB.save()

            res.json({ status: 'Registration Successful' });
        } catch (error) {
            console.error(error.message);
            res.status(400).json({ error: [{ msg: 'DB error', param: 'cPassword' }] })
        }
    })

router.post('/login', [check('email', 'Please enter a valid email').isEmail(),
check('password', 'Please enter at least 6 characters').isLength({ min: 6 })],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: errors.array() })
        }

        try {
            const { email, password } = req.body;
            let user = await User.findOne({ email })

            if (!user) {
                res.status(400).json({ error: [{ msg: "Invalid Credentials", param: 'password' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                res.status(400).json({ error: [{ msg: "Invalid Credentials", param: 'password' }] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 1 }, (err, token) => {
                if (err) throw (err);
                res.json({ token: token })
            })

        } catch (error) {
            console.error(error.message);
            res.status(400).json({ error: [{ msg: "DB error", param: 'password' }] })
        }
    })

router.post('/googleLogin', async (req, res) => {
    console.log("google login")
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT)
    const { id_token } = req.body

    try {
        const googleVerification = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT });
        const googlePayload = googleVerification.payload;
        const { email, name, email_verified } = googlePayload;

        if (email_verified) {
            let user = await User.findOne({ email })
            console.log("user");
            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const googleAccPwd = email + id_token;
                const password = await bcrypt.hash(googleAccPwd, salt);
                const user = { name, email, password };

                const newUser = new User(user);
                await newUser.save();

                const payload = {
                    user: {
                        id: newUser.id
                    }
                }

                jwt.sign(payload, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 1 }, (err, token) => {
                    if (err) throw (err);
                    res.json({ token })
                })

                res.json({ id: newUser.id })
            } else {
                console.log("existing google user");
                const payload = {
                    user: {
                        id: user.id
                    }
                }

                jwt.sign(payload, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 1 }, (err, token) => {
                    if (err) throw (err);
                    res.json({ token })
                })

                res.json({ id: user.id })
            }
        }

    } catch (error) {
        res.status(400).json({ error: "Failed to verify" })
    }

})


module.exports = router;