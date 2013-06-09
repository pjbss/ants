if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([], function () {
    "use strict";

    var Scheduler = function(dagRepo, nodeRepo){
        this._dagRepo = dagRepo;
        this._nodeRepo = nodeRepo;
        this._successCallback = {};
        this._errorCallback = {};
        this._activeIds = [];
        this._buffers = {};
    };

    Scheduler.prototype._nodeCallback = function(packet, nodeName,  version, id){
        var graph = this._dagRepo.get('graph', version);
        var nextNodeNames = graph.outgoingEdges(nodeName);

        if (nextNodeNames.length > 0){
            for(var i=0; i<nextNodeNames.length; i++){
                var nextNodeName = nextNodeNames[i]
                var incomingEdges = graph.incomingEdges(nextNodeName);
                if(incomingEdges.length>1){
                    var bufferName = id + '-' + nextNodeName
                    var buffer = this._buffers[bufferName];
                    if(!buffer){
                        buffer = {}
                        this._buffers[bufferName] = buffer;
                    }

                    var existingOutput = Object.keys(buffer);

                    if(existingOutput.length == incomingEdges.length-1){
                        var packets = [];
                        for(var i=0; i< incomingEdges.length; i++){
                            if(nodeName == incomingEdges[i]){
                                packets.push(packet);
                            }else{
                                packets.push(buffer[incomingEdges[i]]);
                            }
                        }

                        delete this._buffers[bufferName];
                        this._sendPacketToNode(packets, nextNodeName, version, id);
                    } else {
                        buffer[nodeName] = packet;
                    }
                } else {
                    this._sendPacketToNode(packet, nextNodeName, version, id);
                }
            }
        }else if(this._successCallback[id] instanceof Function)
        {
            this._activeIds.splice(this._activeIds.indexOf(id),1);
            var fn = this._successCallback[id];

            delete this._successCallback[id];
            delete this._errorCallback[id];

            fn.call(this, packet);
        }
    };

    Scheduler.prototype._sendPacketToNode = function(packets, nodeName, version, id){
        var scope = this;
        process.nextTick(function(){
            if (!(packets instanceof Array)){
                var p = [packets];
                packets = p;
            }

            var outPacket = scope._nodeRepo.get(nodeName, version).apply(this, packets);


            scope._nodeCallback(outPacket, nodeName, version, id);
        });
    };

    Scheduler.prototype._createId = function(version){
        var timeComponent = (new Date()).getTime();
        var count = 0;
        var constructedId = timeComponent + '-' + version + '-' + count;
        while (constructedId in this._activeIds) {
            count++;
            constructedId = timeComponent + '-' + version + '-' + count;
        }

        return constructedId;
    };

    Scheduler.prototype.activeVersions = function(){
        var currentVersions = [];
        var version;
        for(var i in this._activeIds){
            version = this._activeIds[i].split('-')[1];
            if(!(version in currentVersions)){
                currentVersions.push(version);
            }
        }
        return currentVersions;
    };

    Scheduler.prototype.sendPacket = function(packet, version, callback, error){
        if(!(version in this._dagRepo.getVersions())){
            throw new Error('There is no graph with that version');
        }

        var graph = this._dagRepo.get('graph', version);
        var firstNodeName = graph.firstNode();

        var id = this._createId(version);
        this._activeIds.push(id);

        this._successCallback[id] = callback;
        this._errorCallback[id] = error;

        this._sendPacketToNode(packet, firstNodeName,  version, id);
    };

    return Scheduler;
});