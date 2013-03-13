var should = require("should"),
    Repository = require("../lib/repository");

describe("A Repository", function(){
    it("should be able to add an object with a key and version", function(){
        repo.add("key", 0, "test");
        repo.add(165, 0, "test");

        repo.get("key",0).should.equal("test");
        repo.get(165,0).should.equal("test");
    });

    var repo;
    beforeEach(function(){
        repo = new Repository();
    });
});