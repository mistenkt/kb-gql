import { request } from 'graphql-request';
import { options } from './store';
import { objByString } from './utils';

let queries = {};
let debounce = null;

const queueRequest = (dispatch, key, query, extractor) => {
    clearTimeout(debounce);

    queries[key] = {
        query,
        extractor
    };

    debounce = setTimeout(() => requestBatch(dispatch), options.delay);
};

const requestBatch = async dispatch => {
    if (options.debug)
        console.log('-- graph-request starting request:', queries);

    const combinedQuery = Object.keys(queries)
        .map(key => {
            // Graphql doesnt like slashes in queries so lets change the keys to underscores
            const _key = key
                .split('/')
                .join('_')
                .split('-')
                .join('__');
            return `${_key}:${queries[key].query}`;
        })
        .join(',');

    if (options.debug)
        console.log('-- graph-request combined query:', combinedQuery);

    const response = await request(options.endpoint, `{${combinedQuery}}`);

    // Since we changed the keys before sending the request we need to fix them before we store the response
    const fixedKeys = {};

    Object.keys(response).map(_key => {
        const key =
            _key.indexOf('global') < 0
                ? _key
                      .split('__')
                      .join('-')
                      .split('_')
                      .join('/')
                : _key;

        // If an extractor was passed to the request we can simplify the stored data
        fixedKeys[key] = queries[key].extractor
            ? objByString(response[_key], queries[key].extractor)
            : response[_key];
    });

    if (options.debug)
        console.log('-- graphql-request stored data:', fixedKeys);

    // Store the data
    dispatch({
        type: 'request/store',
        payload: fixedKeys
    });

    // Clear queries
    queries = {};
};

export default queueRequest;
