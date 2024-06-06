const asyncErrCatcher = require('./asyncErrCatcher')
const jwt = require('jsonwebtoken')

module.exports = user2Auth = asyncErrCatcher(async (req, res, next) => {
  try {
    const userToken = req.cookies.user2Token

    if (!userToken) {
      return res.status(403).json('Forbidden Access')
    }

    const verified_user = jwt.verify(userToken, process.env.JWT_SECRET_PASS)

    req.user = {
      all: verified_user,
      role: verified_user.user_role,
      email: verified_user.email,
      state: verified_user.state,
      jurisdiction: verified_user.jurisdiction
    }
    next()
  } catch (err) {
    res.status(500).json(`Err Message: ${err}`)
  }
})
