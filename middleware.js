'use strict'

const mongoose = require('mongoose')
const NewsArticle = require('./model')

const mw = {
  formatQuery: require('warepot/format-query'),
  paginate: require('warepot/paginate')
}

function create(req, res, next) {
  NewsArticle.create(req.body, function (err, newsArticle) {
    if (err) return next(err)

    res.status(201).json(newsArticle)
  })
}

function find(req, res, next) {
  const page = Math.max(0, req.query.page) || 0
  const perPage = Math.max(0, req.query.limit) || res.locals.perPage

  const query = NewsArticle.find(_.omit(req.query, 'limit', 'sort', 'page'),
    null,
    { sort: req.query.sort || '-datePublished', lean: true })

  if (perPage)
    query.limit(perPage).skip(perPage * page)

  query.exec(function (err, newsArticles) {
    res.locals.newsArticles = newsArticles
    next(err)
  })
}

function findById(req, res, next) {
  if (req.params.id === 'new') return next()

  const query = {}

  query[mongoose.Types.ObjectId.isValid(req.params.id) ? '_id' : '_hid'] = req.params.id

  return NewsArticle.findOne(query, function (err, newsArticle) {
    if (err) return next(err)
    res.locals.newsArticle = newsArticle
    next()
  })
}

function getAll(req, res, next) {
  if (!req.user)
    return getPublished(req, res, next)

  NewsArticle.find({}).sort('-dateCreated').exec(function (err, newsArticles) {
    if (err) return next(err)

    res.locals.newsArticles = newsArticles
    next()
  })
}

function getLatest(howMany) {
  howMany = howMany || 5
  return function (req, res, next) {
    // TODO only return needed shit.
    const query = {}
    if (!req.user) {
      query.datePublished = { $exists: true }
    }

    NewsArticle.find(query).sort('-dateCreated').limit(howMany).lean().exec(function (err, newsArticles) {
      if (err) return next(err)

      res.locals.newsArticles = newsArticles
      next()
    })
  }
}

function getPublished(req, res, next) {
  NewsArticle.find({ datePublished: { $ne: null } }).sort('-datePublished').exec(function (err, faqs) {
    if (err) return next(err)

    res.locals.faqs = faqs
    next()
  })
}

function patch(req, res, next) {
  const query = {}

  query[mongoose.Types.ObjectId.isValid(req.params.id) ? '_id' : '_hid'] = req.params.id

  NewsArticle.findOne(query, function (err, newsArticle) {
    delete req.body._id
    delete req.body.__v

    _.extend(newsArticle, req.body)

    return newsArticle.save(function (err) {
      if (err) return next(err)

      return res.status(200).json(newsArticle)
    })
  })
}

function put(req, res, next) {
  const query = {}

  query[mongoose.Types.ObjectId.isValid(req.params.id) ? '_id' : '_hid'] = req.params.id

  NewsArticle.findOne(query, function (err, newsArticle) {
    _.difference(_.keys(newsArticle.toObject()), _.keys(req.body)).forEach(function (key) {
      newsArticle[key] = undefined
    })

    _.extend(newsArticle, _.omit(req.body, '_id', '__v'))

    return newsArticle.save(function (err) {
      if (err) return next(err)

      return res.status(200).json(newsArticle)
    })
  })
}

function remove(req, res, next) {
  return NewsArticle.findById(req.params.id, function (err, newsArticle) {
    if (err) return next(err)
    return newsArticle.remove(function (err) {
      if (err) return next(err)
      return res.sendStatus(204)
    })
  })
}

module.exports = {
  create,
  find,
  findById,
  formatQuery: mw.formatQuery([ 'limit', 'sort', 'page' ], {
    headline: 'regex',
    datePublished: 'exists'
  }),
  getAll,
  getLatest,
  paginate: mw.paginate(NewsArticle, 10),
  patch,
  put,
  remove
}
