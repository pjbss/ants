/* global require: false, module: false, define: false */
if (typeof define !== "function") {
    //noinspection JSHint
    var define = require("amdefine")(module);
}

define([
    "../lib/Scheduler",
    "../lib/DataFlow"
], function (
    Scheduler,
    DataFlow
){
    "use strict";
    var AntFarm = function(){
        this._dataFlow = new DataFlow();
        this._scheduler = new Scheduler(this._dataFlow);
    };

    AntFarm.prototype._cleanTheFarm = function(){
        this._dataFlow.removeOldVersions(this._scheduler.activeVersions());
    };

    AntFarm.prototype.addNode = function(key, fn){
        this._dataFlow.addNode(key, fn);
        this._cleanTheFarm();
        return this;
    };

    AntFarm.prototype.removeNode = function(key){
        this._dataFlow.removeNode(key);
        this._cleanTheFarm();
        return this;
    };

    AntFarm.prototype.connect = function(from, to){
        this._dataFlow.connect(from, to);
        this._cleanTheFarm();
        return this;
    };

    AntFarm.prototype.order = function(order){
        this._dataFlow.order(order);
        this._cleanTheFarm();
        return this;
    };

    //noinspection ReservedWordAsName
    AntFarm.prototype.if = function(condition){
        this._dataFlow.if(condition);
        this._cleanTheFarm();
        return this;
    };

    AntFarm.prototype.disconnect = function(from, to){
        this._dataFlow.connect(from, to);
        this._cleanTheFarm();
        return this;
    };

    AntFarm.prototype.message = function(packet, callback, error){
        this._scheduler.sendPacket(packet, callback, error);
        return this;
    };

    return AntFarm;
});
