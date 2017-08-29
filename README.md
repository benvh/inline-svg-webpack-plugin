# Inline Svg Webpack Plugin

A webpack plugin to replace &lt;img&gt; elements that have an image/svg+xml data url, with their actual svg tags in the emitted assets of your choice. 


Combine this with other loaders (the ones that can emit files) to make it useful. Check [html-loader's readme](https://github.com/webpack-contrib/html-loader#export-into-html-files) for more on that.

## Dependencies
* [NMF last-call-webpack-plugin](https://github.com/NMFR/last-call-webpack-plugin)
* [base-64](https://github.com/mathiasbynens/base64)

## How to use it

webpack should already be set up for your project. Check the [webpack guides](https://webpack.js.org/guides/) first if you need to.


#### Install plugin + dependencies
Install the plugin. You probably also want to get url-loader and html-loader.
```bash
$ npm install --save-dev inline-svg-webpack-plugin url-loader 
```

#### update your webpack&#46;config&#46;js
You can use url-loader to inline your svg files as data-urls so the plugin can pick up on them.
Make sure you set url-loader's limit option high enough so that all svg images get inlined as data-urls (i guess this is optional).

And don't forget to add the plugin!
 
 ```js
'use strict'

var InlineSvgPlugin = require('inline-svg-webpack-plugin');

module.exports {
    // ...
    module: {
        // ...
        rules: [
           // ...
           {
                test: /\.html$/,
                loader: 'html-loader'
           }
           {
                test: /\.svg$/,
                loader: 'url-loader',
                options: {
                    limit: 10485760,
                    mimetype: 'image/svg+xml'
                }
           }
        ]
    },
    plugins: [
        // ...
        new InlineSvgPlugin({
            test: /\.html$/ // an asset filter regex. Assets matching this filter get modified.     
        })
    ]
}
 ```

You dont have to pass  the options object to the plugin constructor. If you don't it will default to:
```js
{
    test: /\.html$/
}
```



