const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require("../middleware/auth")
const { check, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const aws = require("../api/aws")
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
        console.log("login")
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
                res.json({ token: token, id: user.id })
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
                    res.json({ token, id: newUser.id })
                })

            } else {
                console.log("existing google user");
                const payload = {
                    user: {
                        id: user.id
                    }
                }

                jwt.sign(payload, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 1 }, (err, token) => {
                    if (err) throw (err);
                    res.json({ token, id: user.id })
                })

            }
        }

    } catch (error) {
        res.status(400).json({ error: "Failed to verify" })
    }
})

router.get('/verifyUser', async (req, res) => {
    const authHeader = req.header("Authorization");
    const refreshToken = req.header("RefreshToken");

    if (!authHeader) {
        res.json({ msg: "login again" })
        return
    }

    const splitToken = authHeader.split("Bearer ");
    const token = splitToken[1];

    try {
        jwt.verify(token, process.env.TOKEN, function (err, decoded) {
            if (err) {
                if (err.name === 'TokenExpiredError' || err.message === 'jwt expired') {
                    if (refreshToken) {
                        jwt.verify(refreshToken, process.env.TOKEN, function (err, decoded) {
                            if (err) {
                                if (err.name === 'TokenExpiredError' || err.message === 'jwt expired') {
                                    throw 'failed to verify'

                                } else {
                                    const token = jwt.sign(decoded, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 5 })
                                    const refreshToken = jwt.sign(decoded, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 6 })
                                    res.json({ token, refreshToken, id: decoded.user.id })
                                    return
                                }
                            }
                        });
                    }
                }
            }
            res.json({ token, id: decoded.user.id })
        });

    } catch (error) {
        res.status(500).json({ error })
    }
})


router.get('/temporaryUser', async (req, res) => {
    try {
        const userDB = new User({});
        await userDB.save()

        console.log("userDB id", userDB.id)

        const payload = {
            user: {
                id: userDB.id
            }
        }


        const token = jwt.sign(payload, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 5 })
        const refreshToken = jwt.sign(payload, process.env.TOKEN, { expiresIn: 60 * 60 * 24 * 6 })
        res.json({ token, refreshToken, id: userDB.id })

    } catch (error) {
        console.error("error in temporary User endpoint", error.message)
        res.status(500).json({ error: 'failed to create temporary user' })
    }
})

router.post('/forgotPassword', [check('email', 'Please enter a valid email').isEmail()], async (req, res) => {
    try {
        const errors = await validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Please enter a valid email' })
        }
        const { email } = req.body;
        const isExist = await User.findOne({ email })

        if (!isExist) {
            return res.status(400).json({ error: 'Email not exist' })
        }

        const payload = {
            user: {
                email: email
            }
        }

        const token = jwt.sign(
            payload,
            process.env.TOKEN,
            { expiresIn: '1800s' });


        const result = await aws.sendForgotPasswordTemplateEmail(email, process.env.SESSENDER, token)
        console.log("result", result)
        res.json({ desp: "Please check your email for password reset" })

    } catch (error) {
        console.error("forgot password error", error.message);
        res.status(500).json({ error: error.message })
    }
})

router.post("/resetPassword", [[check("password", "Please enter at least 6 characters").isLength({ min: 6 })], auth], async (req, res) => {
    try {
        const error = await validationResult(req)
        if (!error.isEmpty()) {
            return res.status(400).json({ error: 'Please enter at least 6 characters' })
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        await User.findOneAndUpdate({ email: req.user.email }, { password: password })

        res.send("ok")

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: "Server error !" })
    }
})


module.exports = router;