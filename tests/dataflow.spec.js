var should = require('should');
var DataFlow = require('../lib/DataFlow');

describe('When using a DataFlow', function(){

    it('should update version number when adding a node', function(){
        var flow = new DataFlow();

        var version = flow._currentVersion;
        flow.addNode('a', function(p){ return p; });
        var newVersion = flow._currentVersion;
        newVersion.should.not.equal(version);
        flow.addNode('a', function(p){ return 'a' + p});

        flow._currentVersion.should.not.equal(version);
        flow._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when connecting nodes', function(){
        var flow = new DataFlow();

        var version = flow._currentVersion;
        flow.connect('a','b');
        var newVersion = flow._currentVersion;
        flow.connect('b', 'c');
        newVersion.should.not.equal(version);

        flow._currentVersion.should.not.equal(version);
        flow._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when adding a node to the new nodes', function(){
        var flow = new DataFlow();

        var version = flow._currentVersion;
        flow.addNode('a', function(p){ return p; });
        var newVersion = flow._currentVersion;

        flow._currentVersion.should.not.equal(version);
        var fn = flow._nodeRepo.get('a', newVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');
    });

    it('should update version number when removing a node from the new nodes', function(){
        var flow = new DataFlow();

        var version = flow._currentVersion;
        flow.addNode('a', function(p){ return p; });
        var newVersion = flow._currentVersion;

        flow._currentVersion.should.not.equal(version);

        flow.removeNode('a');

        flow._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when removing a connection from the new dag', function(){
        var flow = new DataFlow();

        var version = flow._currentVersion;
        flow.connect('a', 'b');
        var newVersion = flow._currentVersion;
        flow._currentVersion.should.not.equal(version);

        flow.disconnect('a', 'b');

        flow._currentVersion.should.not.equal(newVersion);
    });

    it('should update version number when removing a node from the nodes and update the version', function(){
        var flow = new DataFlow();

        flow.addNode('a', function(p){ return p; });
        flow.connect('a', 'b');

        var fn = flow._nodeRepo.get('a', flow._currentVersion);
        var result = fn.call(this, 'test');

        result.should.equal('test');

        flow.addNode('b', function(p,c){return p*c;})
        flow.connect('b', 'c');

        var nodeVersions = flow._nodeRepo.getVersions();
        nodeVersions.length.should.equal(4);
        nodeVersions.should.include('4');

        flow.removeOldVersions();

        var dagVersions = flow._dagRepo.getVersions();
        dagVersions.length.should.equal(1);
        dagVersions.should.include('4');
    });

    it('should have the correct current version of nodes and dag', function(){
        var flow = new DataFlow();

        flow.addNode('a', function(p){ return p; });
        flow.connect('a', 'b');
        flow.addNode('b', function(p,c){return p*c;})
        flow.connect('b', 'c');

        var a = flow._nodeRepo.get('a', flow._currentVersion);
        var aResult = a.call(this, 'test');
        var b = flow._nodeRepo.get('b', flow._currentVersion);
        var bResult = b.call(this, 2,4);

        var dag = flow._dagRepo.get('dag', flow._currentVersion);
        var dagKeys = Object.keys(dag._edges);
        dagKeys.should.include('a');
        dagKeys.should.include('b');
        dagKeys.should.include('c');

        var dagParents = Object.keys(dag._parents);
        dagParents.should.include('b');
        dagParents.should.include('c');
    });
});
