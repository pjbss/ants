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

});