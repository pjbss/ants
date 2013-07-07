var should = require('should');
var AntFarm = require('../lib/AntFarm');

describe('When using an AntFarm', function(){

    it('should update version number when adding a node', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.addNode('a', function(p){ return p; });
        var newVersion = farm._currentVersion;
        newVersion.should.not.equal(version);
        farm.addNode('a', function(p){ return 'a' + p});

        farm._currentVersion.should.not.equal(version);
        farm._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when connecting nodes', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.connect('a','b');
        var newVersion = farm._currentVersion;
        farm.connect('b', 'c');
        newVersion.should.not.equal(version);

        farm._currentVersion.should.not.equal(version);
        farm._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when adding a node to the new nodes', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.addNode('a', function(p){ return p; });
        var newVersion = farm._currentVersion;

        farm._currentVersion.should.not.equal(version);
        var fn = farm._nodeRepo.get('a', newVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');
    });

    it('should update version number when removing a node from the new nodes', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.addNode('a', function(p){ return p; });
        var newVersion = farm._currentVersion;

        farm._currentVersion.should.not.equal(version);

        farm.removeNode('a');

        farm._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when removing a connection from the new dag', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.connect('a', 'b');
        var newVersion = farm._currentVersion;

        farm._currentVersion.should.not.equal(version);

        farm.disconnect('a', 'b');

        farm._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when removing a node from the nodes and update the version', function(){
        var farm = new AntFarm();

        farm.addNode('a', function(p){ return p; });
        farm.connect('a', 'b');

        var fn = farm._nodeRepo.get('a', farm._currentVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');

        farm.addNode('b', function(p,c){return p*c;})
        farm.connect('b', 'c');

        var nodeVersions = farm._nodeRepo.getVersions();
        nodeVersions.length.should.equal(1);
        nodeVersions.should.include('4');

        var dagVersions = farm._dagRepo.getVersions();
        dagVersions.length.should.equal(1);
        dagVersions.should.include('4');
    });

    it('should have the correct current version of nodes and dag', function(){
        var farm = new AntFarm();

        farm.addNode('a', function(p){ return p; });
        farm.connect('a', 'b');
        farm.addNode('b', function(p,c){return p*c;})
        farm.connect('b', 'c');

        var a = farm._nodeRepo.get('a', farm._currentVersion);
        var aResult = a.call(this, 'test');
        var b = farm._nodeRepo.get('b', farm._currentVersion);
        var bResult = b.call(this, 2,4);

        var dag = farm._dagRepo.get('dag', farm._currentVersion);
        var dagKeys = Object.keys(dag._edges);
        dagKeys.should.include('a');
        dagKeys.should.include('b');
        dagKeys.should.include('c');

        var dagParents = Object.keys(dag._parents);
        dagParents.should.include('b');
        dagParents.should.include('c');
    });

    it('should call the second node in a two node graph', function(done){
        var farm = new AntFarm();

        var result = '';
        var first = function(packet){
            return packet;
        };
        var node = function(packet){
            result = packet;
            return packet + 'FTW';
        };

        farm.connect('a', 'b');
        farm.addNode('a', first);
        farm.addNode('b', node);

        farm.message('test', function(x){
            result.should.equal('test');
            x.should.equal('testFTW');
            done();
        }, {});
    });
});