const Session = require('express-session');

if (!process.env.PAGE_URL) throw 'Missing env variable PAGE_URL';

const RedisStore = require('connect-redis')(Session);
const sessionStore = new RedisStore({
    host: 'redis',
    port: 6379,
});

if (!process.env.COOKIE_SECRET) throw 'Missing env variable COOKIE_SECRET';

module.exports = () =>
    Session({
        secret: process.env.COOKIE_SECRET,
        resave: true,
        saveUninitialized: false,
        rolling: true,
        store: sessionStore,
        proxy: true,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60,
            // domain: process.env.PAGE_URL,
            httpOnly: true,
            path: '/',
            sameSite: true,
        },
        name: 'sessionID',
    });
