/* global require: false, describe: false, it: false */
/* jshint strict: false */
//noinspection JSHint
var should = require("should");
var AntFarm = require("../../lib/AntFarm");

describe("When using an AntFarm", function(){

    it("should call the second node in a two node graph", function(done){
        var farm = new AntFarm();

        var result = "";
        var first = function(packet){
            return packet;
        };
        var node = function(packet){
            result = packet;
            return packet + "FTW";
        };

        farm.connect("a", "b");
        farm.addNode("a", first);
        farm.addNode("b", node);

        farm.message("test", function(x){
            result.should.equal("test");
            x.should.equal("testFTW");
            done();
        }, {});
    });
});
