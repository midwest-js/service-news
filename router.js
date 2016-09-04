'use strict'

const router = new (require('express')).Router()

const mw = require('./middleware')

const { isAdmin } = require('midwest-module-membership/passport/authorization-middleware')

router.route('/')
  .get(mw.formatQuery, mw.paginate, mw.find)
  .post(isAdmin, mw.create)

router.route('/:id')
  .get(isAdmin, mw.findById)
  .patch(isAdmin, mw.patch)
  .put(isAdmin, mw.put)
  .delete(isAdmin, mw.remove)

module.exports = router
