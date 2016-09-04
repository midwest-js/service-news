'use strict'

const mongoose = require('mongoose')
const _ = require('lodash')

const schemaOptions = {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

const config = require('./config')

const schema = _.merge({
  _hid: {
    type: String,
    unique: true
  },
  //"@context": { type: String, default: "http://schema.org" },
  //"@type": { type: String, default: "NewsArticle" },
}, require('mongopot/schemas/article'))

if (config.languages) {
  const headline = schema.headline
  const articleBody = schema.articleBody
  schema.headline = {}
  schema.articleBody = {}
  _.forEach(config.languages, (value) => {
    schema.headline[value.iso] = headline
    schema.articleBody[value.iso] = articleBody
  })
}

const NewsArticleSchema = new mongoose.Schema(schema, schemaOptions)

NewsArticleSchema.plugin(require('mongopot/plugins/base'))

NewsArticleSchema.virtual('summary').get(function () {
  const summaryLength = 255
  if (this.articleBody && this.articleBody.length > summaryLength)
    return this.articleBody.substring(0, summaryLength).trim() + '...'

  return this.articleBody
})

NewsArticleSchema.pre('save', function (next) {
  const that = this

  if (this.isNew || this.isModified('headline')) {
    const newId = _.kebabCase(this.headline).split(/åä/).join('a').split('ö').join('o')

    (function findUniqueId(index) {
      const hid = newId + (index ? '-' + index : '')

      that.model('NewsArticle').findOne({ _hid: hid }, function (err, newsArticle) {
        if (err) return next(err)

        if (newsArticle) return findUniqueId(++index || 1)

        that._hid = hid
        next()
      })
    }())
  } else {
    next()
  }
})

module.exports = mongoose.model('NewsArticle', NewsArticleSchema)
