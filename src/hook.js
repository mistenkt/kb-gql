import React, { useEffect, useContext } from 'react';
import { store, options } from './store';
import queueRequest from './fetcher';

/**
 * useRequest
 * @param query
 * @param key
 * @param extractor
 * @returns {*}
 */
const useRequest = (query, key, extractor) => {
    const { dispatch, state } = useContext(store);

    key = key || window.location.pathname;

    useEffect(() => {
        if (!state[key]) queueRequest(dispatch, key, query, extractor);
        if (state[key] && options.debug)
            console.log(`-- graphql-request ${key} found in cache!`);
    }, []);

    return state[key];
};

export default useRequest;
