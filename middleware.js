'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');

const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');
const rest = require('midwest/factories/rest');

const NewsArticle = require('./model');

function findById(req, res, next) {
  if (req.params.id === 'new') return next();

  const query = {};

  query[mongoose.Types.ObjectId.isValid(req.params.id) ? '_id' : '_hid'] = req.params.id;

  return NewsArticle.findOne(query, (err, newsArticle) => {
    if (err) return next(err);
    res.locals.newsArticle = newsArticle;
    next();
  });
}

function getAll(req, res, next) {
  if (!req.user) {
    return getPublished(req, res, next);
  }

  NewsArticle.find({}).sort('-dateCreated').exec((err, newsArticles) => {
    if (err) return next(err);

    res.locals.newsArticles = newsArticles;
    next();
  });
}

function getLatest(howMany = 5) {
  return (req, res, next) => {
    // TODO only return needed shit.
    const query = {};

    if (!req.user) {
      query.datePublished = { $exists: true };
    }

    NewsArticle.find(query).sort('-dateCreated').limit(howMany).lean()
      .exec((err, newsArticles) => {
        if (err) return next(err);

        res.locals.newsArticles = newsArticles;
        next();
      });
  };
}

function getPublished(req, res, next) {
  NewsArticle.find({ datePublished: { $ne: null } }).sort('-datePublished').lean().exec((err, newsArticles) => {
    if (err) return next(err);

    res.locals.newsArticles = newsArticles;

    next();
  });
}

function query(req, res, next) {
  const page = Math.max(0, req.query.page) || 0;
  const perPage = Math.max(0, req.query.limit) || res.locals.perPage;

  const query = NewsArticle.find(_.omit(req.query, 'limit', 'sort', 'page'),
    null,
    { sort: req.query.sort || '-datePublished', lean: true });

  if (perPage) {
    query.limit(perPage).skip(perPage * page);
  }

  query.exec((err, newsArticles) => {
    res.locals.newsArticles = newsArticles;
    next(err);
  });
}


module.exports = Object.assign(rest(NewsArticle), {
  findById,
  formatQuery: formatQuery(['limit', 'sort', 'page'], {
    headline: 'regex',
    datePublished: 'exists',
  }),
  getAll,
  getLatest,
  paginate: paginate(NewsArticle, 10),
  query,
});
