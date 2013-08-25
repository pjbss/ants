if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
    '../lib/Repository',
    '../lib/DirectedAcyclicGraph'
], function (
    Repository,
    DirectedAcyclicGraph
){
    "use strict";
    var DataFlow = function(){
        this._dagKey = 'dag';
        this._currentVersion = 0;
        this._dagRepo = new Repository();
        this._dagRepo.add(this._dagKey, this._currentVersion, new DirectedAcyclicGraph())
        this._nodeRepo = new Repository();
    };

    DataFlow.prototype._revTheVersion = function(){
        var oldVersion = this._currentVersion
        this._currentVersion++;
        this._nodeRepo.cloneVersionToVersion(oldVersion, this._currentVersion);
        this._dagRepo.cloneVersionToVersion(oldVersion, this._currentVersion);
    };

    DataFlow.prototype.removeOldVersions = function(activeVersions){
        // munge the argument into an array
        var versionsToKeep = [];
        if (activeVersions instanceof Array){
            for (var i in activeVersions){
                versionsToKeep.push(activeVersions[i].toString());
            }
        } else if(activeVersions) {
            versionsToKeep.push(activeVersions.toString());
        }

        // clean up the node repo
        var nodeVersions = this._nodeRepo.getVersions();
        for(var i=0; i<nodeVersions.length; i++){
            if (versionsToKeep.indexOf(nodeVersions[i]) > -1 || nodeVersions[i] == this._currentVersion){ continue; }

            this._nodeRepo.removeVersion(nodeVersions[i]);
        }

        // clean up the DAG repo
        var dagVersions = this._dagRepo.getVersions();
        for(var i=0; i<dagVersions.length; i++){
            if (versionsToKeep.indexOf(dagVersions[i]) > -1 || dagVersions[i] == this._currentVersion){ continue; }

            this._dagRepo.removeVersion(dagVersions[i]);
        }
    };

    DataFlow.prototype._prepareForUpdate = function(){
        this._revTheVersion()
    }

    DataFlow.prototype.addNode = function(key, fn){
        this._prepareForUpdate();

        this._nodeRepo.add(key, this._currentVersion, fn);
        return this;
    };

    DataFlow.prototype.removeNode = function(key){
        this._prepareForUpdate();

        this._nodeRepo.remove(key, this._currentVersion);
        return this;
    };

    DataFlow.prototype.connect = function(from, to){
        this._prepareForUpdate();

        var dag = this._dagRepo.get(this._dagKey, this._currentVersion);
        dag.connect(from, to);
    };

    DataFlow.prototype.disconnect = function(from, to){
        this._prepareForUpdate();

        var dag = this._dagRepo.get(this._dagKey, this._currentVersion);
        dag.disconnect(from, to);
    };

    DataFlow.prototype.firstNode = function(version){
        if(this._dagRepo.getVersions().indexOf(String(version)) === -1){
            throw new Error('There is no graph with that version');
        }
        return this._dagRepo.get(this._dagKey, version).firstNode();
    }

    DataFlow.prototype.getNode = function(name, version){
        return this._nodeRepo.get(name, version);
    }

    DataFlow.prototype.currentVersion = function(){
        return this._currentVersion;
    };

    DataFlow.prototype.outgoingEdges = function(name, version){
        return this._dagRepo.get(this._dagKey, version).outgoingEdges(name);
    };

    DataFlow.prototype.incomingEdges = function(name, version){
        return this._dagRepo.get(this._dagKey, version).incomingEdges(name);
    }

    return DataFlow;
});
