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

var guiImg = document.createElement("img");
guiImg.src = "assets/gui.png";
guiImg.onload = function() { console.log("Loaded gui assets.") };

mapCanvas.addEventListener("mousedown", clickHandler, false);
document.addEventListener("mouseup", clickUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
var mouseDown = false;

var lastX = null, lastY = null;
var offsetX = 0, offsetY = 0;
var maxOffsetX = Math.max(0, (COLS*16)-mapCanvas.width), maxOffsetY = Math.max(28, (ROWS*16)-mapCanvas.height+28);
var showMinimap = false;

function loadLevel(level)
{
	lastX = null, lastY = null;
	offsetX = 0, offsetY = 0;
	COLS = level.cols;
	ROWS = level.rows;
	maxOffsetX = Math.max(0, (COLS*16)-mapCanvas.width), maxOffsetY = Math.max(28, (ROWS*16)-mapCanvas.height+28);
	for(var y = 0; y < ROWS; ++y)
	{
		for(var x = 0; x < COLS; ++x)
		{
			var id, type;
			id = level.map[y][x];
			map[y][x] = new Block(id);
			map[y][x].x = x;
			map[y][x].y = y;
		}
	}
	tick();
}

// Map
for(var y = 0; y < ROWS; ++y)
{
	for(var x = 0; x < COLS; ++x)
	{
		var id, type;
		if(x == 0 || y == 0 || x == COLS-1 || y == ROWS-1)
			id = 0;
		else
			id = 3;

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
	draw: function() { map2d.drawImage(tileset, 112, 104, 16, 16, this.x*16-offsetX, this.y*16-offsetY, 16, 16); }
};

var cursor = new Cursor(0, 0);

function drawGUI()
{
	var guiX = (mapCanvas.width - 184)/2;
	var guiY = (mapCanvas.height - 24);
	map2d.drawImage(guiImg, 0, 126, 184, 22, guiX, guiY, 184, 22);1

	var x1, x2, x3, x4, y1, y2, y3, y4, ty, tx, connects;
	for(var block = 0; block < 10; ++block)
	{
		tile = getBlockById(block);
		tx = tile.x;
		ty = tile.y;
		connects = tile.connects;
		// single
		if(connects == 0)
		{
			map2d.drawImage(tileset, tx, ty, 16, 16, guiX+block*18+3, guiY+3, 16, 16);
		}
		// multi
		else if(connects == 1 || connects == 3)
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

function minimap()
{
	if(!showMinimap)
		return;
	var mx = 384 - 2*COLS - 7;
	var my = 7;
	map2d.beginPath();
	map2d.rect(mx, my, 2*COLS+2, 2*ROWS+2);
	map2d.fillStyle = "#252825";
	map2d.fill();
	map2d.closePath();

	for(var y = 0; y < ROWS; ++y)
	{
		for(var x = 0; x < COLS; ++x)
		{
			//var block = getBlockById(map[y][x].id);
			map2d.drawImage(tileset, map[y][x].tilesetX+4, map[y][x].tilesetY+4, 2, 2, mx+x*2+1, my+y*2+1, 2, 2);
		}
	}
	map2d.beginPath();
	map2d.rect(Math.floor(mx+offsetX/8)+2, Math.floor(my+offsetY/8)+2, 384/8-2, 256/8-2);
	map2d.strokeStyle = "#ffffff";
	map2d.stroke();
	map2d.closePath();	
}

function toggleMinimap()
{
	showMinimap ^= 1;
	tick();
}

function tick()
{
	map2d.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
	var minX = Math.floor(offsetX/16);
	var minY = Math.floor(offsetY/16);
	var maxX = minX+Math.floor(mapCanvas.width/16)+1;
	var maxY = minY+Math.floor(mapCanvas.height/16)+1;
	for(var y = minY; y < maxY; ++y)
	{
		for(var x = minX; x < maxX; ++x)
		{
			if(x < COLS && y < ROWS)
			{
				map[y][x].draw();
			}
		}
	}
	cursor.draw();
	drawGUI();
	minimap();
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

function keyUpHandler(event)
{
	if(event.keyCode == 77)
	{
		toggleMinimap();
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
	var x = event.clientX - mapCanvas.offsetLeft + offsetX*4;
	var y = event.clientY - mapCanvas.offsetTop + offsetY*4;

	nx = Math.floor(x/64);
	ny = Math.floor(y/64);

	// check if we actually click on the map
	if(nx > COLS-1 || ny > ROWS-1)
		return;

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
	mouseDown = true;
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
	event.preventDefault();
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

function clickUpHandler(event)
{
	mouseDown = false;
	lastY = lastX = null;
}

function mouseMoveHandler(event)
{
	if(mouseDown)
	{
		var relativeX = Math.floor((event.clientX - mapCanvas.offsetLeft)/4);
		var relativeY = Math.floor((event.clientY - mapCanvas.offsetTop)/4);
		if(lastX == null)
		{
			lastX = relativeX;
		}
		if(lastY == null)
		{
			lastY = relativeY;
		}
		var dx = lastX - relativeX;
		var dy = lastY - relativeY;
		offsetX = Math.min(Math.max(0, offsetX+dx), maxOffsetX);
		offsetY = Math.min(Math.max(0, offsetY+dy), maxOffsetY);
		lastX = relativeX;
		lastY = relativeY;
		tick();
	}
}

// export map
function getRawMap()
{
	var c = document.getElementById("data");
	c.innerHTML = "[";
	for(var y = 0; y < ROWS; ++y)
	{
		c.innerHTML += "["
		for(var x = 0; x < COLS; ++x)
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

// loadLevel(window.platformer);
tick();