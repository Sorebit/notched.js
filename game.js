// random a through b
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

// Self remove
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

var tileset = document.createElement("img");
tileset.src = "assets/tileset.png";
tileset.onload = function() {};

var guiImg = document.createElement("img");
guiImg.src = "assets/gui.png";
guiImg.onload = function() {};

var mapCanvas = document.getElementById("game");
var map2d = mapCanvas.getContext("2d");

mapCanvas.addEventListener("mousedown", clickHandler, false);
document.addEventListener("keydown", keyDownHandler, false);

function getTileById(id)
{
	var x = null, y = null, connects = null;
	switch(id)
	{
		// water
		case 0: x = 0; y = 0; connects = 1; break;
		// dirt
		case 1: x = 14*8; y = 0; connects = 0; break;
		// grass
		case 2: x = 0; y = 8*3; connects = 1; break;
		// plowed dirt
		case 3: x = 12*8; y = 8*2; connects = 2; break;
		// watered dirt
		case 4: x = 12*8; y = 8*4; connects = 2; break;
		// stone
		case 5: x = 0; y = 8*6; connects = 1; break;
		// wire 
		case 6: x = 0; y = 8*9; connects = 1; break;
		// undefined
		default: x = 64; y = 24; connects = 0;
	}
	return [x, y, connects];
}

function Block(blockID)
{		
	// @blockID
	// number to be identified with
	this.blockID = blockID;

	// @tilesetX, tilesetY
	// upper left corner in tileset
	var tile = getTileById(blockID);
	this.tilesetX = tile[0];
	this.tilesetY = tile[1];
	this.x = null;
	this.y = null;

	// @conects
	// 0 single - doesn't connect
	// 1 multi - connects with other of the same type
	// 2 row - connects only to left or right
	this.connects = tile[2];
}

var ROWS = 16;
var COLS = 16;
var map = [];
for(var y = 0; y < ROWS; ++y) { map[y] = []; }


Block.prototype = {
	// Graphics
	draw: function()
	{
		var x = this.x;
		var y = this.y;
		var ty = this.tilesetY;
		var tx = this.tilesetX;
		var id = this.blockID;
		
		// single
		if(this.connects == 0)
		{
			map2d.drawImage(tileset, tx, ty, 16, 16, x*16, y*16, 16, 16);
		}
		// multi
		else if(this.connects == 1)
		{
			var x1 = tx,    y1 = ty;
			var x2 = tx+16, y2 = ty;
			var x3 = tx,    y3 = ty+16;
			var x4 = tx+16, y4 = ty+16;

			// one up
			if(y > 0 && map[y-1][x].blockID == id)
			{
				y1 += 8;
				y2 += 8;
			}
			// one down
			if(y < ROWS-1 && map[y+1][x].blockID == id)
			{
				y3 -= 8;
				y4 -= 8;
			}
			// one left
			if(x > 0 && map[y][x-1].blockID == id)
			{
				x1 += 8;
				x3 += 8;
			}
			//one right
			if(x < COLS-1 && map[y][x+1].blockID == id)
			{
				x2 -= 8;
				x4 -= 8;
			}
			// upper left
			if(y > 0 && x > 0 && map[y-1][x].blockID == id && map[y][x-1].blockID == id && map[y-1][x-1].blockID != id)
			{
				x1 = 8*4;	
				y1 = ty+8;
			}
			// upper right
			if(y > 0 && x < COLS-1 && map[y-1][x].blockID == id && map[y][x+1].blockID == id && map[y-1][x+1].blockID != id)
			{
				x2 = 8*3;
				y2 = ty+8;
			}
			// lower left
			if(y < ROWS-1 && x > 0 && x < COLS-1 && map[y+1][x].blockID == id && map[y][x-1].blockID == id && map[y+1][x-1].blockID != id)
			{
				x3 = 8*4;
				y3 = ty;
			}
			// upper right
			if(y < ROWS-1 && x < COLS-1 && map[y+1][x].blockID == id && map[y][x+1].blockID == id && map[y+1][x+1].blockID != id)
			{
				x4 = 8*3;
				y4 = ty;
			}
			map2d.drawImage(tileset, x1, y1, 8, 8, x*16,   y*16,   8, 8);
			map2d.drawImage(tileset, x2, y2, 8, 8, x*16+8, y*16,   8, 8);-
			map2d.drawImage(tileset, x3, y3, 8, 8, x*16,   y*16+8, 8, 8);
			map2d.drawImage(tileset, x4, y4, 8, 8, x*16+8, y*16+8, 8, 8);

			// Check only wires beyond this point
			if(map[y][x].blockID != 6)
				return;
			var wireCount = 0;
			for(var sy = -1; sy <= 0; ++sy)
			{
				for(var sx = -1; sx <= 0; ++sx)
				{
					wireCount = 0;
					for(var cy = 0; cy <= 1; ++cy)
					{
						for(var cx = 0; cx <= 1; ++cx)
						{
							if(y+sy+cy >= 0 && y+sy+cy < ROWS && x+sx+cx >= 0 && x+sx+cx < COLS)
							{
								if(map[y+sy+cy][x+sx+cx].blockID == 6)
								++wireCount;
							}
						}
					}
					if(wireCount == 4)
					{
						map2d.drawImage(tileset, 24, 72, 16, 16, (x+sx)*16+8, (y+sy)*16+8, 16, 16);
					}
				}
			}
		}
		// row
		else
		{
			var x1 = tx, x2 = tx+8*3;
			// left
			if(x > 0 && map[y][x-1].blockID == id)
			{
				x1 += 8*2;
			}
			// right
			if(x < COLS-1 && map[y][x+1].blockID == id)
			{
				x2 -= 8*2;
			}
			map2d.drawImage(tileset, x1, ty, 8, 16, x*16,   y*16, 8, 16);
			map2d.drawImage(tileset, x2, ty, 8, 16, x*16+8, y*16, 8, 16);

		}
		
	},
	changeType: function(newID)
	{
		this.blockID = newID;
		var tile = getTileById(newID);
		this.tilesetX = tile[0];
		this.tilesetY = tile[1];
		this.connects = tile[2];
	}
};

// Map
for(var y = 0; y < ROWS; ++y)
{
	for(var x = 0; x < COLS; ++x)
	{
		var id, type;
		if(x == 0 || y == 0 || x == COLS-1 || y == ROWS-1)
			id = 0; 
		else if(rand(0, 100) < 35)
		{
			id = [0, 1, 5][rand(0, 2)];
		}
		else
		{
			id = 2;
		}
		map[y][x] = new Block(id);
		map[y][x].x = x;
		map[y][x].y = y;
	}
}


function Cursor(x, y)
{
	this.x = x;
	this.y = y;
	this.selectedBlock = 0;
}
Cursor.prototype = {
	draw: function() { map2d.drawImage(tileset, 12*8, 0, 16, 16, this.x*16, this.y*16, 16, 16); }
};

var cursor = new Cursor(0, 0);

function drawGUI()
{
	var guiX = (mapCanvas.width - 184)/2;
	var guiY = (mapCanvas.height - 24);
	map2d.drawImage(guiImg, 0, 126, 184, 22, guiX, guiY, 184, 22);

	var x1, x2, x3, x4, y1, y2, y3, y4, ty, tx, connects;
	for(var block = 0; block < 10; ++block)
	{
		tile = getTileById(block);
		tx = tile[0];
		ty = tile[1];
		connects = tile[2];
		// single
		if(connects == 0)
		{
			map2d.drawImage(tileset, tx, ty, 16, 16, guiX+block*18+3, guiY+3, 16, 16);
		}
		// multi
		else if(connects == 1)
		{
			map2d.drawImage(tileset, tx,    ty,    8, 8, guiX+block*18+3,  guiY+3, 8, 8);
			map2d.drawImage(tileset, tx+16, ty,    8, 8, guiX+block*18+11, guiY+3, 8, 8);
			map2d.drawImage(tileset, tx,    ty+16, 8, 8, guiX+block*18+3,  guiY+11, 8, 8);
			map2d.drawImage(tileset, tx+16, ty+16, 8, 8, guiX+block*18+11, guiY+11, 8, 8);
		}
		// row
		else
		{
			map2d.drawImage(tileset, tx,     ty, 8, 16, guiX+block*18+3,  guiY+3, 8, 16);
			map2d.drawImage(tileset, tx+8*3, ty, 8, 16, guiX+block*18+11, guiY+3, 8, 16);
		}

	}
	// selected block
	map2d.drawImage(guiImg, 0, 148, 24, 24, guiX+cursor.selectedBlock*18-1, guiY-1, 24, 24);
}

function tick()
{
	map2d.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
	for(var y = 0; y < ROWS; ++y)
	{
		for(var x = 0; x < COLS; ++x)
		{
			map[y][x].draw();
		}
	}
	cursor.draw();
	drawGUI();
}

// Keyboard
function keyDownHandler(event)
{
	// 1-9
	if(event.keyCode >= 49 && event.keyCode <= 57)
	{
		cursor.selectedBlock = event.keyCode - 49;
		tick();
	}
	else if(event.keyCode == 48)
	{
		cursor.selectedBlock = 9;
		tick();
	}
}

function fillWithBlock(x, y, oldID, newID)
{
	map[y][x].changeType(newID);
	for(var dir = 0; dir < 4; ++dir)
	{
		if(x < COLS-1 && map[y][x+1].blockID == oldID)
		{
			map[y][x+1].changeType(newID);
			fillWithBlock(x+1, y, oldID, newID);
		}
		if(x > 0 && map[y][x-1].blockID == oldID)
		{
			map[y][x-1].changeType(newID);
			fillWithBlock(x-1, y, oldID, newID);
		}
		if(y < ROWS-1 && map[y+1][x].blockID == oldID)
		{
			map[y+1][x].changeType(newID);
			fillWithBlock(x, y+1, oldID, newID);
		}
		if(y > 0 && map[y-1][x].blockID == oldID)
		{
			map[y-1][x].changeType(newID);
			fillWithBlock(x, y-1, oldID, newID);
		}

	}
}

function mapClick(event)
{
	var x = event.clientX;
	var y = event.clientY;
	x -= mapCanvas.offsetLeft;
	y -= mapCanvas.offsetTop;
	nx = Math.floor(x/64);
	ny = Math.floor(y/64);
	if(event.button == 0)
	{
		// draw a rectangle with shift
		if(event.shiftKey)
		{
			var sx = nx;
			var sy = ny;
			if(sx > cursor.x)
			{
				cursor.x = [sx, sx = cursor.x][0];
			}
			if(sy > cursor.y)
			{
				cursor.y = [sy, sy = cursor.y][0];
			}
			for(var yy = sy; yy <= cursor.y && yy < ROWS; ++yy)
			{
				for(var xx = sx; xx <= cursor.x && xx < COLS; ++xx)
				{
					map[yy][xx].changeType(cursor.selectedBlock);
				}
			}
		}
		else if(event.ctrlKey)
		{
			cursor.selectedBlock = map[ny][nx].blockID;
		}
		else
		{
			if(cursor.selectedBlock <= 6)
				map[ny][nx].changeType(cursor.selectedBlock);
		}
	}
	else if(event.button == 1)
	{
			fillWithBlock(nx, ny, map[ny][nx].blockID, cursor.selectedBlock);
	}
	// update cursor
	cursor.x = nx;
	cursor.y = ny;
	tick();
}

function guiClick(event)
{
	var guiX = (mapCanvas.width - 184)/2;
	var x = event.clientX - mapCanvas.offsetLeft - guiX*4 - 4;
	newBlock = Math.min(9, Math.floor(x/72));
	if(newBlock == cursor.selectedBlock && newBlock <= 6)
		map[cursor.y][cursor.x].changeType(cursor.selectedBlock);
	else
		cursor.selectedBlock = newBlock;

	tick();
}

function clickHandler(event)
{
	var guiX = (mapCanvas.width - 184)/2;
	var guiY = (mapCanvas.height - 24);
	// if clicked on gui
	var x = (event.clientX - mapCanvas.offsetLeft) / 4;
	var y = (event.clientY - mapCanvas.offsetTop) / 4;
	if(x >= guiX && x <= guiX+184 && y >= guiY && y <= guiY+22)
	{
		guiClick(event);
	}
	else
	{
		mapClick(event);
	}
}

// export map
function getRawMap()
{
	var c = document.getElementById("data");
	c.innerHTML = "[";
	for(var y = 0; y < COLS; ++y)
	{
		c.innerHTML += "["
		for(var x = 0; x < ROWS; ++x)
		{
			c.innerHTML += map[y][x].blockID + ", ";
		}
		if(y < COLS - 1)
			c.innerHTML += "],<br />";
		else
			c.innerHTML += "]]";
	}
	// create hide button, which deletes itself on press
	var hide = document.getElementById("hide");
	if(hide == null)
	{
		hide = document.createElement("button");
		var container = document.getElementById("sidebar");
		hide.innerHTML = "Hide";
		hide.id = "hide";
		hide.onclick = function() { 
			document.getElementById("data").innerHTML = "";
			document.getElementById("hide").remove();
		};
		container.appendChild(hide);
	}
}

tick();