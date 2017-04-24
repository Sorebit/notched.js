'use strict';

const TILE_SIZE = 32;
const TILESET_SIZE = 32;
const MAP_WIDTH = 16;
const MAP_HEIGHT = 16;
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

editor.selectedType = 0;

function handleKeyDown(e) {
	// Change tile type
	if(e.keyCode >= 48 && e.keyCode <= 57) {
		editor.selectedType = e.keyCode - 48;
	}
};

function handleMouseDown(e) {
	editor.mouse.down = e.button;
	editor.mouse.x = e.layerX;
	editor.mouse.y = e.layerY;
	var sx = editor.mouse.x - editor.camera.x;
	var sy = editor.mouse.y - editor.camera.y;
	editor.cursor.x = Math.floor(sx / TILE_SIZE);
	editor.cursor.y = Math.floor(sy / TILE_SIZE);

	if(editor.mouse.down === 0) {
		editor.changeType(editor.cursor.x, editor.cursor.y, editor.selectedType);
	}

	editor.tick();
};

function handleMouseUp(e) {
	editor.mouse.down = false;
	editor.mouse.x = null;
	editor.mouse.y = null;
};

function handleMouseMove(e) {
	if(editor.mouse.down === 2) {
		editor.camera.x += e.layerX - editor.mouse.x;
		editor.camera.y += e.layerY - editor.mouse.y;
		editor.mouse.x = e.layerX;
		editor.mouse.y = e.layerY;
		editor.tick();
	} else if(editor.mouse.down === 0) {
		handleMouseDown(e);
	}
}

// Setup keyboard and mouse
can.addEventListener('mousedown', handleMouseDown);
can.addEventListener('mouseup', handleMouseUp);
can.addEventListener('mousemove', handleMouseMove);
document.addEventListener('keydown', handleKeyDown);

// Start editor when ready
document.addEventListener('gameReady', function(e) {
	console.log('Game ready.');
	editor.tick();
});

// Setup using custom generation function
editor.setup(TILESET, function() {
	editor.forEachTile(function(tile) {
		if((tile.x & (tile.y ^ tile.x)) === 0) {
			tile.type = 3;
		}
		else if((tile.y & (tile.y ^ tile.x)) === 0) {
			tile.type = 1;
		} else {
			tile.type = 2;
		}
	})
});