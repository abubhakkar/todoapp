const bcrypt = require('bcryptjs')
const config = require('config')
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const router = express.Router()

// @route   POST /user
// @desc    Create new User
// @access  Public
router.post('/', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) { return res.status(400).json({ msg: 'Please enter all fields' }) }

  // Check for existing user
  User.findOne({ email })
    .then(user => {
      if (user) return res.status(400).json({ msg: 'User already exists' })
      const newUser = new User({ name, email, password });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => {
              jwt.sign(
                { id: user.id },
                config.get('jwtSecret'),
                { expiresIn: 3600 },
                (err, token) => {
                  if (err) throw err;
                  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
                }
              )
            });
        })
      })
    })
})

module.exports = router;