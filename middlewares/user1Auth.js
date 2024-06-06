const asyncErrCatcher = require('./asyncErrCatcher')
const jwt = require('jsonwebtoken')

module.exports = user1Auth = asyncErrCatcher(async (req, res, next) => {
  try {
    const userToken = req.cookies.access_token

    if (!userToken) {
      return res.status(403).json('Forbidden Access')
    }

    const verified_user = jwt.verify(userToken, process.env.JWT_SECRET_PASS)

    req.user = {
      all: verified_user,
      tc_name: verified_user.tc_name,
      email: verified_user.email,
      jurisdiction: verified_user.jurisdiction
    }
    next()
  } catch (err) {
    res.status(500).json(`Err Message: ${err}`)
  }
})
