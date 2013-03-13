var should = require("should"),
    DAG = require("../lib/directed_acyclic_graph");

describe("A Directed Acyclic Graph", function(){
    it("should be able to connect two nodes", function(){
        graph.connect("a", "b");

        graph.toString().should.equal('{"a":["b"],"b":[]}');
    });

    it("should be able to support one node with multiple edges", function(){
        graph.connect("a","b")
            .connect("a", "z");

        graph.toString().should.equal('{"a":["b","z"],"b":[],"z":[]}');
    });

    it("should be able to detect loops", function(){
        (function(){
            graph.connect("a", "b")
                .connect("b", "c")
                .connect("c", "b");
        }).should.throw();
    });

    it("should be able to return the incoming edges of a node", function(){
        graph.connect("a", "b")
            .connect("a", "d")
            .connect("b", "c")
            .connect("c", "d");

        graph.incomingEdges("d").should.include("a");
        graph.incomingEdges("d").should.include("c");
    });

    it("should be alb to remove an edge", function(){
        graph.connect("a", "b")
            .connect("a", "z")
            .disconnect("a", "b");

        graph.toString().should.equal('{"a":["z"],"z":[]}');
        graph.incomingEdges("b").length.should.equal(0);
    });

    var graph;
    beforeEach(function(){
        graph = new DAG();
    });
});
