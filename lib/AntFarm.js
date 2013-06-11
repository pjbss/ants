if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
    '../lib/Scheduler',
    '../lib/Repository',
    '../lib/DirectedAcyclicGraph'
], function (
    Scheduler,
    Repository,
    DirectedAcyclicGraph
){
    "use strict";
    var AntFarm = function(){
        this._dagKey = 'dag';
        this._currentVersion = 0;
        this._dagRepo = new Repository();
        this._dagRepo.add(this._dagKey, this._currentVersion, new DirectedAcyclicGraph())
        this._nodeRepo = new Repository();
        this._scheduler = new Scheduler(this._dagRepo, this._nodeRepo);
    };

    AntFarm.prototype._revTheFarm = function(){
        var oldVersion = this._currentVersion
        this._currentVersion++;
        this._nodeRepo.cloneVersionToVersion(oldVersion, this._currentVersion);
        this._dagRepo.cloneVersionToVersion(oldVersion, this._currentVersion);
    };

    AntFarm.prototype._cleanTheFarm = function(){
        var activeVersions = this._scheduler.activeVersions();

        var nodeVersions = this._nodeRepo.getVersions();
        for(var i=0; i<nodeVersions.length; i++){
            if (nodeVersions[i] in activeVersions || nodeVersions[i] == this._currentVersion){ continue; }

            this._nodeRepo.removeVersion(nodeVersions[i]);
        }

        var dagVersions = this._dagRepo.getVersions();
        for(var i=0; i<dagVersions.length; i++){
            if (dagVersions[i] in activeVersions || dagVersions[i] == this._currentVersion){ continue; }

            this._dagRepo.removeVersion(dagVersions[i]);
        }

    };

    AntFarm.prototype._prepareForUpdate = function(){
        this._revTheFarm()
        this._cleanTheFarm()
    }

    AntFarm.prototype.addNode = function(key, fn){
        this._prepareForUpdate();

        this._nodeRepo.add(key, this._currentVersion, fn);
        return this;
    };

    AntFarm.prototype.removeNode = function(key){
        this._prepareForUpdate();

        this._nodeRepo.remove(key, this._currentVersion);
        return this;
    };

    AntFarm.prototype.connect = function(from, to){
        this._prepareForUpdate();

        var dag = this._dagRepo.get(this._dagKey, this._currentVersion);
        dag.connect(from, to);
    };

    AntFarm.prototype.disconnect = function(from, to){
        this._prepareForUpdate();

        var dag = this._dagRepo.get(this._dagKey, this._currentVersion);
        dag.disconnect(from, to);
    };

    AntFarm.prototype.message = function(){

    };

    return AntFarm;
});