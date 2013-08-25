var should = require('should');
var AntFarm = require('../lib/AntFarm');

var sentanceInspector = function(packet){
    var splitWords = packet.split(' ');
    var wordCount = splitWords.length;

    return {
        words: splitWords,
        wordCount: wordCount
    };
};

var uniqueCounter = function(packet){
    var words = [];
    for (var i=0; i<packet.length; i++){
        if ( words.indexOf(packet[i]) > 0) continue;

        words.push(packet[i]);
    }
    return words.length;
};

var combineResults = function(wordCount, uniqueWordCount){
    return 'There were ' + wordCount + ' and ' + uniqueWordCount + ' unique words.';
};

describe('When using an AntFarm', function(){
    it('should be able to map the output from a node to different nodes', function(){
        var farm = new AntFarm();
        farm.addNode('a', sentanceInspector);
        farm.addNode('b', uniqueCounter);
        farm.addNode('c', combineResults);

        farm.connect('a', 'b', ['words'], ['packet']);
    });
});
