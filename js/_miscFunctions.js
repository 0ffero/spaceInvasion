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