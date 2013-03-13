Repository = function(){
    this._objs = {};
};

Repository.prototype.add = function(key, version, val){
    this._objs[key+version] = val;
};

Repository.prototype.get = function(key, version){
    return this._objs[key+version];
};

module.exports = Repository;