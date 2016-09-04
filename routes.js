var isAuthenticated = require('express-module-membership/passport/authorization-middleware').isAuthenticated

var mw = require('./middleware')

module.exports = [
  [ '/api/news-articles/', 'get', [ mw.formatQuery, mw.paginate, mw.find ]],
  [ '/api/news-articles/', 'post', [ isAuthenticated, mw.create ]],
  [ '/api/news-articles/:id', 'get', [ mw.findById ]],
  [ '/api/news-articles/:id', 'put', [ isAuthenticated, mw.put ]],
  [ '/api/news-articles/:id', 'patch', [ isAuthenticated, mw.patch ]],
  [ '/api/news-articles/:id', 'delete', [ isAuthenticated, mw.remove ]]
]
