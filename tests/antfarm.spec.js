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

    it('should add a node the the new node graph', function(){
        var farm = new AntFarm();

        var version = farm._currentVersion;
        farm.addNode('a', function(p){ return p; });
        var newVersion = farm._currentVersion;

        farm._currentVersion.should.not.equal(version);
        var fn = farm._nodeRepo.get('a', newVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');
    });

    it('should remove a node from the current graph and update the version', function(){
        var farm = new AntFarm();

        farm.addNode('a', function(p){ return p; });

        var fn = farm._nodeRepo.get('a', farm._currentVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');

        var v = farm._currentVersion;
        should.exist(farm._nodeRepo.get('a', farm._currentVersion));
        farm.removeNode('a');
        should.not.exist(farm._nodeRepo.get('a', farm._currentVersion));
        v.should.not.equal(farm._currentVersion);
    });

    it('')

});