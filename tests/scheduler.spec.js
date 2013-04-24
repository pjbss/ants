var should = require('should');
var Repo = require('../lib/Repository');
var DAG = require('../lib/DirectedAcyclicGraph')
var Scheduler = require('../lib/Scheduler')

describe('A Scheduler', function(){

    it('should throw error when there is no graph for the specified version', function(){
        (function(){
            scheduler.sendPacket('message', 0, {}, {});
        }).should.throw();
    });

    it('should call the second node in a two node graph', function(done){
        var result = '';
        var first = function(packet){
            return packet;
        };
        var node = function(packet){
            result = packet;
            return packet;
        };

        var graph = new DAG();
        graph.connect('a', 'b');
        dagRepo.add('graph', 0, graph);

        nodeRepo.add('a', 0, first);
        nodeRepo.add('b', 0, node);

        scheduler.sendPacket('test', 0, function(){
            result.should.equal('test');
            done();
        }, {});
    });

    it('should wait to call a node until all inputs are ready', function(done){
        var result = '';
        var fastNode = function(packet){
            return packet;
        };
        var slowNode = function(packet){
            var loop = 1000000;
            var val = 0;
            for(var i=0; i<loop; i++){
                val += 1;
            }

            return val;
        };
        var lastNode = function(one, two){
            result = one + ' ' + two;
            return result;
        };

        var graph = new DAG();
        graph.connect('a', 'b');
        graph.connect('a', 'c');
        graph.connect('c', 'x');
        graph.connect('b', 'x');
        dagRepo.add('graph', 0, graph);

        nodeRepo.add('a', 0, fastNode);
        nodeRepo.add('b', 0, fastNode);
        nodeRepo.add('c', 0, slowNode);
        nodeRepo.add('x', 0, lastNode);

        scheduler.sendPacket('test', 0, function(){
            result.should.equal('1000000 test');
            done();
        }, {});
    });


    var nodeRepo;
    var dagRepo;
    var scheduler;
    beforeEach(function(){
        dagRepo = new Repo();
        nodeRepo = new Repo();
        scheduler = new Scheduler(dagRepo,nodeRepo);
    });
});