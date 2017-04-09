'use strict';

const TILE_SIZE = 32;
const TILESET_SIZE = 32;
const MAP_WIDTH = 12;
const MAP_HEIGHT = 12;
const TILESET = 'assets/tileset-notch-256.png';

var can = document.getElementById('result');
var ctx = can.getContext('2d');

function handleWindowSize() {	
	can.width = window.innerWidth;
	can.height = window.innerHeight;
	if(editor)
		editor.tick();
}
window.onresize = handleWindowSize;
handleWindowSize();

var editor = new Game(ctx, MAP_WIDTH, MAP_HEIGHT);

can.addEventListener('mousedown', function(e) {
	editor.mouse.down = true;
	editor.mouse.x = e.layerX;
	editor.mouse.y = e.layerY;
});

document.addEventListener('mouseup', function(e) {
	editor.mouse.down = false;
	editor.mouse.x = null;
	editor.mouse.y = null;
});

can.addEventListener('mousemove', function(e) {
	if(!editor.mouse.down) 
		return;

	var dx = e.layerX - editor.mouse.x;	
	var dy = e.layerY - editor.mouse.y;	
	editor.camera.x += dx;
	editor.camera.y += dy;
	editor.mouse.x = e.layerX;
	editor.mouse.y = e.layerY;
	editor.tick();
});

document.addEventListener('gameReady', function(e) {
	console.log('Game ready.');
	editor.tick();
});

editor.setup(TILESET);