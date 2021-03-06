var Express = require('express');
var MediaProxy = require('./libs/media-proxy');
var Timeline = require('./libs/timeline');

var app = Express();
var port = 8585;

/**
* @brief Returns true if query is authorized
*/
function queryAuthorized (req) {
  return (req.params.pass == "1645328")
}

/**
 * @brief Twitter timeline
 * @return Twitter timeline content in JSON
 */
app.get('/:pass/tweets', function (req, res) {
  if ( !queryAuthorized(req))
  {
    res.end();
    return;
  }

  var params = {
    maxTweetsPerUser: 2,
    removeRetweets: false,
    maxTweets: 20,
    shuffleTweets: true
  }
  Timeline.getTimeline(params, function(error, timeline) {
    if (timeline == undefined) {
      res.send('');
    }

    res.json(timeline);
  });
})

/**
 * @brief Twitter image proxy
 * @return Twitter target image through nodeJS
 */
app.get('/tweetImage/*', function (req, res) {
   MediaProxy.serveImage(req, res);
})

Timeline.assertEnvironmentSet();

if ( ! process.env.SERVER_NAME.endsWith('/'))
  process.env.SERVER_NAME = process.env.SERVER_NAME + '/';

var localMediaPath = 'video';
process.env.LOCAL_MEDIA_URL = process.env.SERVER_NAME + localMediaPath + '/';

// Serve videos as Gif
app.use('/'+localMediaPath, Express.static(MediaProxy.mediaCache.path));

// Run the server
app.listen(port, function () {
    console.log('Twitter proxy running on ' + port + ' !')
})
