var phantom = require('phantom'),
    Pool = require('./lib/pool'),
    Instance = require('./lib/instance');

var shouldRender = function shouldRender (req, options) {
    if (req.query._escaped_fragment_) {
        return true;
    }
    if (options.snapshotTrigger && req.query[options.snapshotTrigger]) {
        return true;
    }
    var ua = req.headers['user-agent'];
    if (ua && options.agents && options.agents.length) {
        for ( var i = 0, agent; agent = options.agents[i++];) {
            if (ua.indexOf(agent) !== -1) {
                return true;
            }
        }
    }
    return false;
}

var makeUrl = function makeUrl(req, options) {
        //construct url that will be called by phantomjs
        var url = (options.protocol || req.protocol) + '://' + (options.host || req.get('host'));
        if (req.query._escaped_fragment_) {
            url += req.query._escaped_fragment_;
        } else {
            url += req.originalUrl;
            if (options.snapshotTrigger && url.indexOf(options.snapshotTrigger + '=') != -1) {
                url = url.replace(options.snapshotTrigger + '=', '_' + options.snapshotTrigger + '=');
            }
        }
        return url;
    }

var SETTINGS = {
    timeout: 2000, //how long to wait for page to load
    delay: 200, //how long to wait for initial javascript to settle
    snapshotTrigger: 'snapshot', //query param to trigger snapshot render on
    agents: ['Googlebot', 'Baiduspider', 'ia_archiver',
        'R6_FeedFetcher', 'NetcraftSurveyAgent', 'Sogou web spider',
        'bingbot', 'Yahoo! Slurp', 'facebookexternalhit', 'PrintfulBot',
        'msnbot', 'Twitterbot', 'UnwindFetchor', 'YandexBot', 'DuckDuckBot',
        'Ask Jeeves', 'urlresolver', 'Butterfly', 'TweetmemeBot'
    ], //user agents to trigger snapshot render on
    shouldRender: shouldRender, //function that determines wether to render snapshot\\
    makeUrl: makeUrl,
    protocol: null, // 'http' or 'https', by default same as initial request
    host: null,  //domain, by default same as initial request. this is where you can put 'localhost'
    maxInstances: 1,
    logger: console
}


var expressCrawlerSnapshots = function expressCrawlerSnapshots(options) {

    options = options || {};

    Object.keys(SETTINGS).forEach(function (key) {
        if (!options.hasOwnProperty(key)) {
            options[key] = SETTINGS[key];
        }
    });

    var pool = new Pool(options.maxInstances, options);

   return function expressCrawlerSnapshotsMiddleware(req, res, next) {
        if (options.shouldRender(req, options)) {
            pool.getInstance(function (instance, err){
                if (err) {
                    next(err);
                } else {
                    instance.renderPage(options.makeUrl(req, options), function (result, err) {
                        if (err) {
                            next(err);
                        } else {
                            res.send(result);
                        }
                    });
                }
            });
        } else {
            next();
        }
    };
};

module.exports = expressCrawlerSnapshots;