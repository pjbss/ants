var should = require('should');
var Repository = require('../lib/Repository');

describe('A Repository', function(){
    it('should be able to add an object with a key and version', function(){
        repo.add('key', 0, 'test');
        repo.add(165, 0, 'test');

        repo.get('key',0).should.equal('test');
        repo.get(165,0).should.equal('test');
    });

    it('should be able to add the same key with multiple versions', function(){
        repo.add('key', 0, 'test');
        repo.add('key', 1, 'test one');

        repo.get('key',0).should.equal('test');
        repo.get('key',1).should.equal('test one');
    });

    it('should be able to get all keys for a version', function(){
        repo.add('key', 0, 'test');
        repo.add(165, 0, 'test');
        repo.add('key', 1, 'test one');
        repo.add('brass monkey', 1, 'test one');

        var keys = repo.getKeys(0);

        keys.should.include('key');
        keys.should.include(165);
    });

    it('should be able to remove an object', function(){
        repo.add('key', 0, 'test');
        repo.add(165, 0, 'test');

        repo.remove('key', 0);
        var keys = repo.getKeys(0);
        keys.length.should.equal(1);
        keys.should.include(165);
    });

    it('should be able to get all versions in repo', function(){
        repo.add('key', 0, 'test');
        repo.add(165, 0, 'test');
        repo.add('key', 1, 'test one');
        repo.add('brass monkey', 1, 'test one');

        var versions = repo.getVersions();

        versions.should.include('0');
        versions.should.include('1');
    });

    var repo;
    beforeEach(function(){
        repo = new Repository();
    });
});