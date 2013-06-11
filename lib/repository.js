if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([],function(){
    "use strict";
    var Repository = function(){
        this._objs = {};
        this._versionKeys = {};
    };

    var Pointer = function(key, version){
        this.key = key;
        this.version = version;
    }

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
        // update items that point to this one
        var versions = this.getVersions();
        var itemToDelete = this._objs[key+version];
        for(var i=0; i<versions.length; i++){
            var v = versions[i];
            var item = this._objs[key+v];
            if(item instanceof Pointer && item.version == version){
                this.add(key, v, itemToDelete)
            }
        }

        // delete the item
        if(key+version in this._objs){
            delete this._objs[key+version];
        }

        // clean up the version keys
        if (!(version in this._versionKeys)) return;

        var itemIndex = this._versionKeys[version].indexOf(key);
        if (itemIndex === -1) return;
        this._versionKeys[version].splice(itemIndex, 1);

        if(this._versionKeys[version].length === 0){
            delete this._versionKeys[version];
        }
    };

    Repository.prototype.get = function(key, version){
        var item = this._objs[key+version];
        if (item instanceof Pointer){
            return this.get(item.key, item.version);
        } else {
            return item;
        }
    };

    Repository.prototype.getKeys = function(version){
        return this._versionKeys[version];
    };

    Repository.prototype.getVersions = function(){
        return Object.keys(this._versionKeys);
    };

    Repository.prototype.cloneVersionToVersion = function(fromVersion, toVersion){
        if(!this._versionKeys[fromVersion]){ return; }

        var fromKeys = this._versionKeys[fromVersion];
        for(var i=0; i< fromKeys.length; i++){
            var key = fromKeys[i];
            this.add(key, toVersion, new Pointer(key, fromVersion));
        }
    };

    Repository.prototype.removeVersion = function(version){
        if(!this._versionKeys[version]){ return; }

        var keys = this._versionKeys[version].slice(0);
        for(var i=0; i< keys.length; i++){
            this.remove(keys[i], version);
        }
    }

    return Repository;
});