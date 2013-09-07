var should = require('should');
var DataFlow = require('../lib/DataFlow');
var Scheduler = require('../lib/Scheduler')

describe('A Scheduler', function(){

    it('should throw error when there is no graph for the specified version', function(){
        (function(){
            scheduler.sendPacket('message', {}, {});
        }).should.throw();
    });

    it('should throw an error when there are no nodes in the graph', function(){
        var result = '';
        var node = function(packet){
            result = packet;
            return packet;
        };

        flow.addNode('b', node);

        (function(){
            scheduler.sendPacket('message', {}, {});
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

        flow.addNode('a', first);
        flow.addNode('b', node);
        flow.connect('a', 'b');

        scheduler.sendPacket('test', function(){
            result.should.equal('test');
            done();
        }, {});
    });

    it('should wait to call a node until all inputs are ready', function(done){
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
            var result = one + ' ' + two;
            return result;
        };

        flow.connect('a', 'b');
        flow.connect('a', 'c');
        flow.connect('c', 'x');
        flow.connect('b', 'x');

        flow.addNode('a', fastNode);
        flow.addNode('b', fastNode);
        flow.addNode('c', slowNode);
        flow.addNode('x', lastNode);

        scheduler.sendPacket('test', function(packet){
            packet.should.equal('1000000 test');
            done();
        }, {});
    });

    it('should be able to get the active versions', function(done){
        var killIt = false;
        var fastNode = function(packet){
            return packet;
        };
        var increment = function(){
            if(killIt) return;

            process.nextTick(increment);
        };
        var slowNode = function(packet){
            increment();
        };
        var lastNode = function(one, two){
            var result = one + ' ' + two;
            return result;
        };

        flow.connect('a', 'b');
        flow.connect('a', 'c');
        flow.connect('c', 'x');
        flow.connect('b', 'x');

        flow.addNode('a', fastNode);
        flow.addNode('b', fastNode);
        flow.addNode('c', slowNode);
        flow.addNode('x', lastNode);

        scheduler.sendPacket('test', function(result){
            return;
        }, {});

        flow.addNode('a', fastNode);

        scheduler.sendPacket('test', function(result){
            done();
        }, {});

        scheduler.activeVersions().length.should.equal(2);

        killIt = true;
    });

    it('should be able to order the inputs', function(done){
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
            var result = one + ' ' + two;
            return result;
        };

        flow.connect('a', 'b');
        flow.connect('a', 'c');
        flow.connect('c', 'x', 2);
        flow.connect('b', 'x', 1);

        flow.addNode('a', fastNode);
        flow.addNode('b', fastNode);
        flow.addNode('c', slowNode);
        flow.addNode('x', lastNode);

        scheduler.sendPacket('test', function(packet){
            packet.should.equal('test 1000000');
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