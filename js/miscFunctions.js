function convertHexToRGB(_colourHex) {
    if (_colourHex.startsWith('#')===true) {
        _colourHex = _colourHex.replace('#', '');
    }
    let bigint = parseInt(_colourHex, 16);
    let r = (bigint >> 16) & 255; let g = (bigint >> 8) & 255; let b = bigint & 255;

    return { red: ~~((r/255)*1000)/1000, green: ~~((g/255)*1000)/1000, blue: ~~((b/255)*1000)/1000 }; // 3dp for glsl
}

function generateRandomID(_g=false) {
    generatedID = '';
    let maxC = 8;
    if (_g!==false) { maxC = 16; }
    for (let i=0; i<maxC; i++) {
        generatedID +=~~((Math.random()*9)+1).toString();
        if ((i===2 || i===4) && _g===false) {
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