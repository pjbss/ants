if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([],function(){
    "use strict";
    var Repository = function(){
        this._objs = {};
        this._versionKeys = {};
    };

    Repository.prototype.add = function(key, version, val){
        this._objs[key+version] = val;

        if(!this._versionKeys[version]){
            this._versionKeys[version] = []
        }

        if(this._versionKeys[version].indexOf(key) === -1){
            this._versionKeys[version].push(key)
        }
    };

    Repository.prototype.remove = function(key, version){
        if(key+version in this._objs){
            delete this._objs[key+version];
        }

        if (!(version in this._versionKeys)) return;

        var itemIndex = this._versionKeys[version].indexOf(key);
        if (itemIndex === -1) return;
        this._versionKeys[version].splice(itemIndex, 1);
    };

    Repository.prototype.get = function(key, version){
        return this._objs[key+version];
    };

    Repository.prototype.getKeys = function(version){
        return this._versionKeys[version];
    };

    Repository.prototype.getVersions = function(){
        return Object.keys(this._versionKeys);
    };

    return Repository;
});