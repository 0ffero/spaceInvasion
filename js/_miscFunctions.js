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