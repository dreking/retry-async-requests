const app = require('express')();
const { default: axios } = require('axios');
const { retry } = require('async');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3030;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/normal-async', async function (req, res) {
    try {
        const { data } = await axios.get(
            'https://next.json-generator.com/api/json/get/4kmvRxuJ5'
        );

        return res.status(200).json({
            status: true,
            message: 'Got data',
            data: data,
        });
    } catch (error) {
        console.error(error);

        return res.status(400).json({
            status: false,
            message: 'Something went wrong. Please try again later',
            error: error,
        });
    }
});

let count = 0;
const makeRequest = async function (uri, callback) {
    try {
        const response = await axios.get(uri);
        console.log('Success on: ', ++count, ' request');
        return callback(null, response.data);
    } catch (err) {
        console.log('Failed on: ', ++count, ' request');
        return callback(err);
    }
};

app.use('/retry-request', function (req, res) {
    // interval is in milliseconds
    retry(
        { times: 5, interval: 2000 },
        function (callback) {
            // 'https://next.json-generator.com/api/json/get/4kmvRxuJ5',
            // Added invalid the link to fail all requests
            return makeRequest(
                'https://nextjson-generator.com/api/json/get/4kmvRxuJ5',
                callback
            );
        },
        (error, data) => {
            if (error) {
                return res.status(400).json({
                    status: false,
                    message: 'Something went wrong. Please try again later',
                    error: error,
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Got data',
                data: data,
            });
        }
    );
});

app.use(function (error, req, res, next) {
    return res.status(500).json({ status: false, message: 'Something went wrong' });
});

app.listen(PORT, function () {
    console.log(`Listening on ${PORT}`);
});
