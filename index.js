'use strict';

var base64 = require('base-64');
var LastCallWebpackPlugin = require('last-call-webpack-plugin');

/**
 * Uses https://github.com/NMFR/last-call-webpack-plugin to manipulate.html (or configurable) assets
 * to inline any <img> tags which have an image/svg+xml data-url as their
 *
 * Some parts were shamelessly copied from: https://github.com/NMFR/optimize-css-assets-webpack-plugin/blob/master/index.js
 */
function InlineSvgWebpackPlugin(options) {
    this.options = options || {};

    if (this.options.assetNameRegExp == undefined) {
        this.options.assetNameRegExp = /\.html$/g;
    }

    if (this.options.canPrint == undefined) {
        this.options.canPrint = true;
    }


    this.svgTagRegex = /\<svg[^\>]*>/; 
    this.svgImgTagRegex = /\<img.*src=\"data:image\/svg\+xml;base64,([^\"]+)\".*\/?\>/g;
    this.attributeRegex = /(([a-zA-Z\-]+)=\"([^\"]+)\")/g;
    this.styleAttributeRegex = /style=\"([^\"]+)\"/g


    var self = this;
    this.lastCallInstance = new LastCallWebpackPlugin({
        assetProcessors: [
            {
                regExp: this.options.assetNameRegExp,
                processor: function(assetName, asset, assets) {
                    return self.processHtml(assetName, asset, assets);
                }
            }
        ],
        canPrint: this.options.canPrint
    });
}


/**
 * Looks for <img> elements that have an image/svg-xml data-url and replaces them
 * with their actual <svg> elements. Any attributes defined on the original img
 * elements are also copied to the new svg ones
 *
 * @param {String} assetName webpack asset name
 * @param {Asset} asset a webpack thing..
 * @param {Assets} assets another webpack thing..
 *
 * @returns {Promise} resolves to the new asset source (the one with svg tags)
 */
InlineSvgWebpackPlugin.prototype.processHtml = function(assetName, asset, assets) {
    var self = this;

    var html = asset.source();
    var output = '' + html; // better not mess with whatever we get from asset

    var matches;

    while((matches = self.svgImgTagRegex.exec(html)) != null) {
        var imgElement = matches[0];
        var svgContent = base64.decode(matches[1]);
        var svgElement = self.svgTagRegex.exec(svgContent)[0];

        // collect all attributes in the svg element
        var imgElementAttributes = self.collectElementStringAttributes(imgElement).filter(function(a) { 
            return a.name != 'src';
        });

        var svgElementAttributes = self.collectElementStringAttributes(svgElement); // collect all attributes in the svg element
        var finalAttributes = imgElementAttributes.concat(svgElementAttributes); // concat all the things

        var finalSvgElement = '<svg ' + finalAttributes.map(function(attribute) {
            return attribute.name + '="' + attribute.value + '"'
        }).join(' ') + '>';

        svgContent = svgContent.replace(svgElement, finalSvgElement);

        output = output.replace(imgElement, svgContent);
    }

    return Promise.resolve(output);
};


/**
 * Collect a html element's attributes
 *
 * @param {String} elementString the html element string (must be valid html)
 * @returns {Array} array of "attribute objects" with name and value properties 
 */
InlineSvgWebpackPlugin.prototype.collectElementStringAttributes = function(elementString) {
    var self = this;

    var attributes = [];
    var attributeMatch;
    while((attributeMatch = self.attributeRegex.exec(elementString)) != undefined) {
        attributes.push({
            name: attributeMatch[2],
            value: attributeMatch[3]
        });
    } 
    return attributes;
};


InlineSvgWebpackPlugin.prototype.apply = function(compiler) {
    return this.lastCallInstance.apply(compiler);
}


module.exports = InlineSvgWebpackPlugin;
