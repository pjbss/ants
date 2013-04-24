if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([], function () {
    "use strict";

    var utils = {};

    /* fprop, fluent property
     * creates a property, and if not setting returns this
     * for fluent "funness"
     */
    utils.fprop = function(){
        var v;
        if(arguments.length > 1){
            throw "You can only call with one or zero arguments";
        } else if(arguments.length === 1){
            v = arguments[0];
        }

        return function(){
            if(arguments.length > 1){
                throw "You can only call with one or zero arguments";
            } else if(arguments.length === 1){
                v = arguments[0];
                return this;
            }
            return v;
        }
    };

    return utils;
});