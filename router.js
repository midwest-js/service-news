'use strict';

const router = new (require('express')).Router();

const mw = require('./middleware');

const { isAdmin } = require('midwest-module-membership/passport/authorization-middleware');

router.route('/')
  .get(mw.formatQuery, mw.paginate, mw.query)
  .post(isAdmin, mw.create);

router.route('/:id')
  .get(mw.findById)
  .patch(isAdmin, mw.update)
  .put(isAdmin, mw.replace)
  .delete(isAdmin, mw.remove);

module.exports = router;
