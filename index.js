const AWS = require('aws-sdk');
const serverless = require('serverless-http');
const moment = require('moment');
const express = require('express');
const app = express();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Set the root address to a static address
app.get('/', async (req, res, next) => {
    await dynamoDb.put({ // Track link
        TableName: 'short-url-hit',
        Item: {
            slug: 'index',
            timestamp: moment().toISOString(),
            address: req.connection.remoteAddress,
            useragent: req.headers['user-agent'],
            referrer: req.header('Referer') || null
        }
    }).promise();
    res.redirect(302, 'https://example.com/'); // Use 302 Redirect so you get tracking info every click
});

app.get('/:slug', async (req, res, next) => { // The slug is passed to params. Make it whatever length you want, but I recommend starting with 2 characters.
    try {

        let link = await dynamoDb.get({ // DynamoDB get record by slug
            TableName: 'short-url-link',
            Key: { slug: req.params.slug }
        }).promise();

        if (!link.Item) return next(); // If not found, 404

        link = link.Item;

        await dynamoDb.put({ // Tracking
            TableName: 'short-url-hit',
            Item: {
                slug: link.slug,
                timestamp: moment().toISOString(),
                address: req.connection.remoteAddress,
                useragent: req.headers['user-agent'],
                referrer: req.header('Referer') || null
            }
        }).promise();

        res.redirect(302, link.url); // 302 Redirect allows tracking on every click

    } catch(err) {
        console.error(err);
        return next();
    }
});

app.use(function (req, res) { // All errors produce a 404. Assume the record doesn't exist.
    res.status(404).send('NOT FOUND');
});

module.exports = {
    handler: serverless(app), // Pass app to serverless for Lambda Routing
    app // Pass to local runner for development
};
