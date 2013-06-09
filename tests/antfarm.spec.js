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

    it('should add a node to the new node graph', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.addNode('a', function(p){ return p; });
        var newVersion = farm._currentVersion;

        farm._currentVersion.should.not.equal(version);
        var fn = farm._nodeRepo.get('a', newVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');
    });

    it('should remove a node from the new node graph', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.addNode('a', function(p){ return p; });
        var newVersion = farm._currentVersion;

        farm._currentVersion.should.not.equal(version);

        farm.removeNode('a');

        farm._currentVersion.should.not.equal(newVersion);
    });

    it('should remove a node from the current graph and update the version', function(){
        var farm = new AntFarm();

        farm.addNode('a', function(p){ return p; });

        var fn = farm._nodeRepo.get('a', farm._currentVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');

        farm.addNode('b', function(p,c){return p*c;})

        var versions = farm._nodeRepo.getVersions();
        versions.length.should.equal(1);
        versions.should.include('2');
    });

});