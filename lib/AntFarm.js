if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
    '../lib/Scheduler',
    '../lib/Repository'
], function (
    Scheduler,
    Repository
){
    "use strict";
    var AntFarm = function(){
        this._currentVersion = 0;
        this._dagRepo = new Repository();
        this._nodeRepo = new Repository();
        this._scheduler = new Scheduler(this._dagRepo, this._nodeRepo);
    };

    AntFarm.prototype._revTheFarm = function(){
        var oldVersion = this._currentVersion
        this._currentVersion++;
        this._nodeRepo.cloneVersionToVersion(oldVersion, this._currentVersion);
    };

    AntFarm.prototype._cleanTheFarm = function(){

    };

    AntFarm.prototype.addNode = function(key, fn){
        this._revTheFarm()
        this._cleanTheFarm()

        this._nodeRepo.add(key, this._currentVersion, fn);
        return this;
    };

    AntFarm.prototype.removeNode = function(key){
        this._revTheFarm()
        this._cleanTheFarm()

        this._nodeRepo.remove(key, this._currentVersion);
        return this;
    };

    AntFarm.prototype.connect = function(){

    };

    AntFarm.prototype.message = function(){

    };

    return AntFarm;
});