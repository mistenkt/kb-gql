import React, { createContext, useReducer } from 'react';

const initialState = {};

export const store = createContext(initialState);

const { Provider } = store;

export let options = {
    delay: 50,
    debug: false,
    graphqlUrl: ''
};

export const RequestProvider = ({ children, graphqlUrl, ...opts }) => {
    const [state, dispatch] = useReducer((state, action) => {
        const { type, payload } = action;

        switch (type) {
            case 'request/store':
                return { ...state, ...payload };
            case 'request/clear':
                return initialState;
            default:
                return state;
        }
    }, initialState);

    options = { ...options, ...opts, endpoint: graphqlUrl };

    return React.createElement(
        Provider,
        {
            value: {
                state,
                dispatch
            }
        },
        children
    );
};
