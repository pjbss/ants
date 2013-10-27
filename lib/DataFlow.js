/* global require: false, module: false, define: false */
if (typeof define !== "function") {
    //noinspection JSHint
    var define = require("amdefine")(module);
}

define([
    "node_utility_belt"
], function (
    utilityBelt
){
    "use strict";
    var DataFlow = function(){
        this._dagKey = "dag";
        this._mappingKey = "map";
        this._conditionalKey = "conditional";
        this._currentVersion = 0;
        this._dagRepo = new utilityBelt.Repository();
        this._dagRepo.add(this._dagKey, this._currentVersion, new utilityBelt.DirectedAcyclicGraph());
        this._dagRepo.add(this._mappingKey, this._currentVersion, {});
        this._dagRepo.add(this._conditionalKey, this._currentVersion, {});
        this._nodeRepo = new utilityBelt.Repository();
        this._lastConnected = null;
    };

    DataFlow.prototype._revTheVersion = function(){
        var oldVersion = this._currentVersion;
        this._currentVersion++;
        this._nodeRepo.cloneVersionToVersion(oldVersion, this._currentVersion);
        this._dagRepo.cloneVersionToVersion(oldVersion, this._currentVersion);
    };

    DataFlow.prototype.removeOldVersions = function(activeVersions){
        // munge the argument into an array
        var versionsToKeep = [];
        if (activeVersions instanceof Array){
            activeVersions.forEach(function (v) {
                versionsToKeep.push(v.toString());
            });
        } else if(activeVersions) {
            versionsToKeep.push(activeVersions.toString());
        }

        // clean up the node repo
        var nodeVersions = this._nodeRepo.getVersions();
        for(var i=0; i<nodeVersions.length; i++){
            if (versionsToKeep.indexOf(nodeVersions[i]) > -1 || nodeVersions[i] === String(this._currentVersion)){ continue; }

            this._nodeRepo.removeVersion(nodeVersions[i]);
        }

        // clean up the DAG repo
        var dagVersions = this._dagRepo.getVersions();
        for(var j=0; j<dagVersions.length; j++){
            if (versionsToKeep.indexOf(dagVersions[j]) > -1 || dagVersions[j] === String(this._currentVersion)){ continue; }

            this._dagRepo.removeVersion(dagVersions[j]);
        }
    };

    DataFlow.prototype._prepareForUpdate = function(){
        this._revTheVersion();
    };

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

        this._lastConnected = {
            "from"  :   from,
            "to"    :   to
        };

        return this;
    };

    DataFlow.prototype.order = function(order){
        if(!this._lastConnected){
            throw "You must connect something to order it.";
        }
        this._prepareForUpdate();

        var mapping = this._dagRepo.get(this._mappingKey, this._currentVersion);
        var newMapping = [{from:this._lastConnected.from, order:order}];
        if(mapping[this._lastConnected.to]){
            for(var i in mapping[this._lastConnected.to]){
                if(mapping[this._lastConnected.to][i].from !== this._lastConnected.from){
                    newMapping.push(mapping[this._lastConnected.to][i]);
                }
            }
        }

        mapping[this._lastConnected.to] = newMapping;
        return this;
    };

    //noinspection ReservedWordAsName
    DataFlow.prototype.if = function(condition){
        if(!this._lastConnected){
            throw "You must connect something to add a condition to it.";
        }
        this._prepareForUpdate();

        var conditions = this._dagRepo.get(this._conditionalKey, this._currentVersion);
        var newConditions = [{ "to": this._lastConnected.to, "condition": condition}];
        if(conditions[this._lastConnected.from]){
            for(var i in conditions[this._lastConnected.from]){
                if(conditions[this._lastConnected.from][i].to !== this._lastConnected.to){
                    newConditions.push(conditions[this._lastConnected.from][i]);
                }
            }
        }

        conditions[this._lastConnected.from] = newConditions;
        return this;
    };

    DataFlow.prototype.getMappings = function(nodeName, version){
        return this._dagRepo.get(this._mappingKey, version)[nodeName];
    };

    DataFlow.prototype.getCondition = function(from, to, version) {
        var conditions = this._dagRepo.get(this._conditionalKey, version);
        if (!conditions[from]){
            return false;
        }

        var condition = false;
        for(var i in conditions[from]){
            if(conditions[from][i].to === to){
                condition = conditions[from][i].condition;
            }
        }

        return condition;
    };

    DataFlow.prototype.disconnect = function(from, to){
        this._prepareForUpdate();

        var dag = this._dagRepo.get(this._dagKey, this._currentVersion);
        dag.disconnect(from, to);

        var conditions = this._dagRepo.get(this._conditionalKey, this._currentVersion);
        if(conditions[from]){
            var newConditions = [];
            for(var i in conditions[from]){
                if(conditions[i].to !== to){
                    newConditions.push(conditions[from][i]);
                }
            }
            conditions[from] = newConditions;
        }

        var mapping = this._dagRepo.get(this._mappingKey, this._currentVersion);
        if(mapping[to]){
            var newMapping = [];
            for(var j in mapping[to]){
                if(mapping[to][j].from !== from){
                    newMapping.push(mapping[to][j]);
                }
            }
            mapping[to] = newMapping;
        }

    };

    DataFlow.prototype.firstNode = function(version){
        if(this._dagRepo.getVersions().indexOf(String(version)) === -1){
            throw new Error("There is no graph with that version");
        }
        return this._dagRepo.get(this._dagKey, version).firstNode();
    };

    DataFlow.prototype.getNode = function(name, version){
        return this._nodeRepo.get(name, version);
    };

    DataFlow.prototype.currentVersion = function(){
        return this._currentVersion;
    };

    DataFlow.prototype.outgoingEdges = function(name, version){
        return this._dagRepo.get(this._dagKey, version).outgoingEdges(name);
    };

    DataFlow.prototype.incomingEdges = function(name, version){
        return this._dagRepo.get(this._dagKey, version).incomingEdges(name);
    };

    return DataFlow;
});
