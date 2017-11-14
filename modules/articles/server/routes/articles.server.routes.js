'use strict';

/**
 * Module dependencies
 */
var articles = require('../controllers/articles.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/articles')
    .get(articles.list)
    .post(articles.create);

  // Single article routes
  app.route('/api/articles/:articleId')
    .get(articles.read)
    .put(articles.update)
    .delete(articles.delete);

  // Finish by binding the article middleware
  app.param('articleId', articles.articleByID);
};
