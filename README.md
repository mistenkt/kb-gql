# kb-gql
A React GraphQL request hook with request-batching and data caching built on [`graphql-request`](https://github.com/prisma-labs/graphql-request)

## Why ?
The main graphql client libraries for react are huge and bloated, and most of them had problems with unions that were too tedious to fix. 

Now [`graphql-request`](https://github.com/prisma-labs/graphql-request) is an awesome lightweight graphql client, which is why this library builds upon it, but it lacks a couple of important features. 

1. Query batching. Lets say I have a Header component, a Footer component and then the Page component it self. All these components (or containers, call them what you will) require data. And I feel that the components that require the data should own the query to get their data. (Makes it easier to see what you can expect in return). Without query batching that would make 3 requests to the Graphql api just to show a single page. This somewhat defeats the awsomeness of GraphQL which is that you can query anything you need in one request. Enter query batching! If multiple queries try to hit the Provider within 50ms (default, can be adjusted) they will be merged into a single request.

2. Dont fetch the same data over and over again. If we have the data for the query you are trying to resolve we skip the request to the api. If you want to make sure you have the latest data on every navigation you can disable the cache per request as needed.

## Installation

`yarn add kb-gql`

## Usage

1. Initialize the `RequestProvider` in your `App.js` file (or whatever your entry point is named) and pass the url to your graphql endpoint.

    ```jsx harmony
   import React from 'react';
   import {RequestProvider} from 'kb-gql';
   
   const App = () => {
       return (
           <RequestProvider graphqlUrl="http://localhost:81/graphql">
               <div className="the-rest-of-your-app"/>
           </RequestProvider>
       )
   }
   
   export default App;
       
    ```
   
2. Use the `useRequest` hook inside any components that require data from your GraphQL endpoint.

    ```jsx harmony
   import React from 'react';
   import useRequest from 'kb-gql';
       
   const query = `
       page {
           title
           description
       }
   `;
   
   const Component = ({slug}) => {
       const data = useRequest(query, slug);
       
       if(!data) return null;
       
       return (
           <div>
               <h1>{data.title}</h1>
           </div>
       )
   }
    ```

## API

#### `RequestProvider` Component
* `graphqlUrl` (string) The url to your GraphQL endpoint.
* `delay` (? integer) Milliseconds to wait between request to allow for batching, defaults to `50`.
* `debug` (? bool) Enable debugging.

#### `useRequest(query, key, extractor)` hook
* `query` (string) Your graphql query.
* `key` (? string) A unique key used to store the data. Defaults to the url path. Note that if you use multiple requests on the same url, you will need to pass unique keys for each request. An example of this would be global data like header menu items, that will be run on any page, but should only be fetched once. use `_global_{name}` as key for global requests. 
* `extractor` (? string) In some cases getting to the data you care about requires a bit of nesting in graphql. To avoid dealing with this nesting after having fetched the data, you can pass a string extractor to minimize the stored data. Example:
    ```jsx harmony
    const query = `
        pageSettings {
            fields {
                header {
                    menuItems {
                        title
                        url
                    }
                }
            }
        }
    `;
    ```
    
    Here you clearly only care about the menuItems array, and there is no reason you should have to write `data.fields.header.menuItems` to access it.
    
    Pass an extractor with the value of `fields.header.menuItems` and the returned data from the `useRequest` hook will only be the `menuItems array`.
    
    ```jsx harmony
    const menuItems = useRequest(query, '_global_header_menu', 'fields.header.menuItems');
    ```

## More examples

* Variables in requests:

    ```jsx harmony
  import React from 'react';
  import useRequest from 'kb-gql';
    
  const makeQuery = vars => `
      pageBy(slug: "${vars.slug}") {
          title
          image
          content
          slug
      }    
  `
  
  const Page = ({slug}) => {
      const data = useRequest(makeQuery({slug}));
      
      if(!data) return null;
      
      return (
          <div>
              <h1>{data.title}</h1>
              <img src={data.image}/>
              <p>{data.content}</p>
          </div>
      )  
  }
    ```
  
* Component needs to query different parts of the schema
    
   Your view might need to fetch data from two different parts of the schema. Since ``useRequest`` does some magic batching behind the scenes, you need to call it twice (dont worry, only one request will be made). The following example is of an office index page, it requires offices to be fetched from the api, but it also needs to fetch content that is to be displayed on the page before the actual listing of the offices
   
   ```jsx harmony
   import React from 'react';
   import useRequest from 'kb-gql';
   
   const pageQuery = `
       officePage {
           fields {
               title
               textContent
           }
       }
   `;
   
   const officesQuery = `
       offices {
           nodes {
               title
               slug
               image
           }
       }
   `;
   
   const OfficeIndex = () => {
       // Note that we need to specify keys here as we are using multiple queries for this page
   
       const pageData = useRequest(pageQuery, 'officesPage', 'fields');
       const offices = useRequest(officesQuery, 'offices', 'nodes');
       
       if(!data) return null;
   
       return (
           <div>
               <h1>{pageData.title}</h1>
               <p>{pageData.textContent}</p>
               
               <ul>
               {!!offices && offices.map((item, key) => (
                   <li>
                       <a href={`/offices/${item.slug}`}>
                           <img src={item.image}/>
                           <h2>{item.title}</h2>
                       </a>
                   </li>
               ))}
               </ul>
           </div>
       )
   }  
   
   ```
