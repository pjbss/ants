/* global require: false, describe: false, it: false, process: false, beforeEach: false */
/* jshint strict: false */
//noinspection JSHint
var should = require("should");
var DataFlow = require("../../lib/DataFlow");
var Scheduler = require("../../lib/Scheduler");

describe("A Scheduler", function(){

    it("should throw error when there is no graph for the specified version", function(){
        //noinspection JSHint
        (function(){
            scheduler.sendPacket("message", {}, {});
        }).should.throw();
    });

    it("should throw an error when there are no nodes in the graph", function(){
        var result = "";
        var node = function(packet){
            result = packet;
            return packet;
        };

        flow.addNode("b", node);

        //noinspection JSHint
        (function(){
            scheduler.sendPacket("message", {}, {});
        }).should.throw();
    });

    it("should call the second node in a two node graph", function(done){
        var result = "";
        var first = function(packet){
            return packet;
        };
        var node = function(packet){
            result = packet;
            return packet;
        };

        flow.addNode("a", first);
        flow.addNode("b", node);
        flow.connect("a", "b");

        scheduler.sendPacket("test", function(){
            result.should.equal("test");
            done();
        }, {});
    });

    it("should wait to call a node until all inputs are ready", function(done){
        var fastNode = function(packet){
            return packet;
        };
        var slowNode = function()
        {
            var loop = 1000000;
            var val = 0;
            for(var i=0; i<loop; i++){
                val += 1;
            }

            return val;
        };
        var lastNode = function(one, two){
            return one + " " + two;
        };

        flow.connect("a", "b");
        flow.connect("a", "c");
        flow.connect("c", "x");
        flow.connect("b", "x");

        flow.addNode("a", fastNode);
        flow.addNode("b", fastNode);
        flow.addNode("c", slowNode);
        flow.addNode("x", lastNode);

        scheduler.sendPacket("test", function(packet){
            packet.should.equal("1000000 test");
            done();
        }, {});
    });

    it("should be able to get the active versions", function(done){
        var killIt = false;
        var fastNode = function(packet){
            return packet;
        };
        var increment = function(){
            if(killIt) { return; }

            process.nextTick(increment);
        };
        var slowNode = function(){
            increment();
        };
        var lastNode = function(one, two){
            return one + " " + two;
        };

        flow.connect("a", "b");
        flow.connect("a", "c");
        flow.connect("c", "x");
        flow.connect("b", "x");

        flow.addNode("a", fastNode);
        flow.addNode("b", fastNode);
        flow.addNode("c", slowNode);
        flow.addNode("x", lastNode);

        scheduler.sendPacket("test", function(){}, {});

        flow.addNode("a", fastNode);

        scheduler.sendPacket("test", function(){
            done();
        }, {});

        scheduler.activeVersions().length.should.equal(2);

        killIt = true;
    });

    it("should be able to order the inputs", function(done){
        var fastNode = function(packet){
            return packet;
        };
        var slowNode = function(){
            var loop = 1000000;
            var val = 0;
            for(var i=0; i<loop; i++){
                val += 1;
            }

            return val;
        };
        var lastNode = function(one, two){
            return one + " " + two;
        };

        flow.connect("a", "b");
        flow.connect("a", "c");
        flow.connect("c", "x").order(2);
        flow.connect("b", "x").order(1);

        flow.addNode("a", fastNode);
        flow.addNode("b", fastNode);
        flow.addNode("c", slowNode);
        flow.addNode("x", lastNode);

        scheduler.sendPacket("test", function(packet){
            packet.should.equal("test 1000000");
            done();
        }, {});
    });

    it("should be able to use conditionals", function(done){
        var double = function(p){
            return p*2;
        };
        var passThrough = function(p){
            return p;
        };
        var addTen = function(p){
            return p + 10;
        };

        flow.connect("a", "b").if(function(p) { return p <= 5;});
        flow.connect("a", "c").if(function(p) { return p > 5;});

        flow.addNode("a", passThrough);
        flow.addNode("b", double);
        flow.addNode("c", addTen);

        scheduler.sendPacket(6, function(packet){
            packet.should.equal(16);
            done();
        }, {});
    });

    var flow;
    var scheduler;
    beforeEach(function(){
        flow = new DataFlow();
        scheduler = new Scheduler(flow);
    });
});