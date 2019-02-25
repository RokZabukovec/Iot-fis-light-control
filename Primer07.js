var http = require("http").createServer(handler);
var firmata = require("firmata");
var io = require("socket.io").listen(http); // knjižnica za vtičnike
var fs = require("fs"); // knjižnica za delo z datotečnim sistemom ("file system fs")

var pošljiVrednostPrekoVtičnika = function(){}; // spr. za pošiljanje sporočil


function handler(req, res) { // "handler", ki je uporabljen pri require("http").createServer(handler)
    fs.readFile(__dirname + "/primer07.html", // povemo, da bomo ob zahtevi ("request") posredovali
    function (err, data) {                    // klientu datoteko primer04.html iz diska strežnika
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju html strani.");
        }
    res.writeHead(200);
    res.end(data);
    });
}
http.listen(8080);
var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Povezava na Arduino");
    console.log("Aktiviramo Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // pin13 kot izhod
    console.log("Omogočimo Pin 2 kot vhod");
    board.pinMode(2, board.MODES.INPUT);
});

var posljiVrednostPrekoVticnika = function(){}; // spr. za pošiljanje sporočil

board.on("ready", function(){
    io.sockets.on("connection", function(socket) {
    socket.emit("sporočiloKlientu", "Strežnik povezan, Arduino pripravljen.");
    }); // konec "sockets.on connection"
    posljiVrednostPrekoVticnika = function (value) {
        io.sockets.emit("sporočiloKlientu", value);
    }
    board.digitalRead(2, function(value) {
    if (value == 0) {
        console.log("LED izklopljena");
        board.digitalWrite(13, board.LOW);
        posljiVrednostPrekoVticnika("LED izklopljena");
    }
    if (value == 1) {
        console.log("LED vklopljena");
        board.digitalWrite(13, board.HIGH);
        posljiVrednostPrekoVticnika("LED vklopljena");
    }
    
}); // konec "board.digitalRead"
});
