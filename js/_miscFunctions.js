function generateRandomID() {
    generatedID = '';
    for (let i=0; i<8; i++) {
        generatedID +=~~((Math.random()*9)+1).toString();
        if (i===2 || i===4) {
            generatedID += '-';
        }
    }
    return generatedID;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function sortByKey(array, key, reverse=false) {
    if (Array.isArray(array)===false) { console.log('Passed in array is not actually an array. It\'s typeof is ' + (typeof array)); return false; }
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        if (reverse===true) { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); } else { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
    });
}