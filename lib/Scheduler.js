/* global require: false, module: false, define: false , process: false */
if (typeof define !== "function") {
    //noinspection JSHint
    var define = require("amdefine")(module);
}

define([], function () {
    "use strict";

    var Scheduler = function(flow){
        this._flow = flow;
        this._successCallback = {};
        this._errorCallback = {};
        this._activeIds = [];
        this._buffers = {};
    };

    Scheduler.prototype._getMappingOrderOrZero = function(name, mappings){
        for (var i in mappings){
            if(mappings[i].from === name) {
                return mappings[i].order;
            }
        }
        return 0;
    };

    Scheduler.prototype._meetsCondition = function(from, to, packets, version){
        var condition = this._flow.getCondition(from, to, version);

        return condition ? condition(packets) : true;
    };

    Scheduler.prototype._nodeCallback = function(packet, nodeName,  version, id){
        var nextNodeNames = this._flow.outgoingEdges(nodeName, version);

        if (nextNodeNames.length > 0){
            for(var i=0; i<nextNodeNames.length; i++){
                var nextNodeName = nextNodeNames[i];
                var incomingEdges = this._flow.incomingEdges(nextNodeName, version);
                if(incomingEdges.length > 1){
                    var bufferName = id + "-" + nextNodeName;
                    var buffer = this._buffers[bufferName];
                    if(!buffer){
                        buffer = {};
                        this._buffers[bufferName] = buffer;
                    }

                    var existingOutput = Object.keys(buffer);

                    if(existingOutput.length === incomingEdges.length-1){
                        var mappings = this._flow.getMappings(nextNodeName, version);
                        if(!mappings){
                            mappings = {};
                        }

                        var packets = [{
                            from: nodeName,
                            packet: packet,
                            order: this._getMappingOrderOrZero(nodeName, mappings)
                        }];
                        //noinspection JSHint
                        for(var j in existingOutput){
                            packets.push({
                                from: existingOutput[j],
                                packet: buffer[existingOutput[j]],
                                order: this._getMappingOrderOrZero(existingOutput[j], mappings)
                            });
                        }

                        //noinspection JSHint
                        packets.sort(function(a,b) { return a.order - b.order; });
                        //noinspection JSHint
                        var args = packets.map(function(p){ return p.packet; });

                        delete this._buffers[bufferName];
                        this._sendPacketToNode(args, nodeName, nextNodeName, version, id);
                    } else {
                        buffer[nodeName] = packet;
                    }
                } else {
                    this._sendPacketToNode(packet, nodeName, nextNodeName, version, id);
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

    Scheduler.prototype._sendPacketToNode = function(packets, from, to, version, id){
        if(!this._meetsCondition(from, to, packets, version)){ return; }

        var scope = this;
        process.nextTick(function(){
            if (!(packets instanceof Array)){
                packets = [packets];
            }

            var outPacket = scope._flow.getNode(to, version).apply(this, packets);

            scope._nodeCallback(outPacket, to, version, id);
        });
    };

    Scheduler.prototype._createId = function(version){
        var timeComponent = (new Date()).getTime();
        var count = 0;
        var constructedId = timeComponent + "-" + version + "-" + count;
        while (constructedId in this._activeIds) {
            count++;
            constructedId = timeComponent + "-" + version + "-" + count;
        }

        return constructedId;
    };

    Scheduler.prototype.activeVersions = function(){
        var currentVersions = [];
        var version;
        //noinspection JSHint
        for(var i in this._activeIds){
            version = this._activeIds[i].split("-")[1];
            if(!(version in currentVersions)){
                currentVersions.push(version);
            }
        }
        return currentVersions;
    };

    Scheduler.prototype.sendPacket = function(packet, callback, error){
        var version = this._flow.currentVersion();
        var firstNodeName = this._flow.firstNode(version);

        if(firstNodeName === undefined){
            throw new Error("There is no first node in the graph");
        }

        var id = this._createId(version);
        this._activeIds.push(id);

        this._successCallback[id] = callback;
        this._errorCallback[id] = error;

        this._sendPacketToNode(packet, "", firstNodeName,  version, id);
    };

    return Scheduler;
});