const asyncErrCatcher = require('./asyncErrCatcher')
const jwt = require('jsonwebtoken')

module.exports = user4Auth = asyncErrCatcher(async (req, res, next) => {
  try {
    const userToken = req.cookies.user4Token

    if (!userToken) {
      return res.status(403).json('Forbidden Access')
    }

    const verified_user = jwt.verify(userToken, process.env.JWT_SECRET_PASS)

    req.user = {
      all: verified_user,
      role: verified_user.user_role,
      email: verified_user.email
    }
    next()
  } catch (err) {
    res.status(500).json(`Err Message: ${err}`)
  }
})
