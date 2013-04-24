if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([],function(){
    "use strict";

    var DirectedAcyclicGraph = function(){
        this._edges = {};
        this._parents = {};
    };

    DirectedAcyclicGraph.prototype.connect = function(from, to){
        // Add the edge, and then check if it is valid
        if(!this._edges[from]) {
            this._edges[from] = [];
        }
        this._edges[from].push(to);

        if(!this._isValid()){
            // if it is not valid remove the edge
            var index = this._edges[from].indexOf(to);
            this._edges[from].splice(index,1);
            throw new Error('cannot add edge, because it will break the graph.');
        }

        // it is valid, so update other properties
        if(!this._edges[to]) {
            this._edges[to] = [];
        }
        if(!this._parents[to]){
            this._parents[to] = [];
        }
        this._parents[to].push(from);

        return this;
    };

    DirectedAcyclicGraph.prototype.disconnect = function(from, to){
        // update the edges
        var index = this._edges[from].indexOf(to);
        this._edges[from].splice(index,1);

        var keys = Object.keys(this._edges);
        var exists = false;
        for(var i=0; i< keys.length; i++){
            if(to in this._edges[keys[i]]){
                exists = true;
                break;
            }
        }

        if(!exists){
            delete this._edges[to];
        }

        // update the parents
        index = this._parents[to].indexOf(from);
        this._parents[to].splice(index, 1);

        if(this._parents[to].length === 0){
            delete this._parents[to];
        }

        return this;
    };

    DirectedAcyclicGraph.prototype.incomingEdges = function(node){
        if(this._parents[node]){
            return this._parents[node];
        }else{
            return [];
        }
    };

    DirectedAcyclicGraph.prototype.outgoingEdges = function(node){
        if(this._edges[node]){
            return this._edges[node];
        }else{
            return [];
        }
    };

    DirectedAcyclicGraph.prototype.firstNode = function(){
        var nodes = Object.keys(this._edges);
        var notFirstNodes = Object.keys(this._parents);

        var firstNode = nodes.filter(function(i) {
            return !(notFirstNodes.indexOf(i) > -1);
        });

        return firstNode[0];
    };

    DirectedAcyclicGraph.prototype.toString = function(){
        return JSON.stringify(this._edges);
    };

    DirectedAcyclicGraph.prototype._isValid = function(){
        var leftNodes = Object.keys(this._edges);

        for(var i=0; i < leftNodes.length; i++){
            if(this._depthFirstLoopCheck(leftNodes[i], [])){
                return false;
            }
        }

        return true;
    };

    DirectedAcyclicGraph.prototype._depthFirstLoopCheck = function(n, traversedNodes){
        if(!this._edges[n]){
            return false;
        }

        for(var i=0; i< this._edges[n].length; i++){
            if(this._edges[n][i] in traversedNodes){
                return true;
            }

            traversedNodes.push(this._edges[n][i]);

            if(this._depthFirstLoopCheck(this._edges[n][i], traversedNodes)){
                return true;
            }
        }

        return false;
    };

    return DirectedAcyclicGraph;
});