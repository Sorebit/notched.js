window.charset = document.createElement("img");
charset.src = "assets/char.png";
charset.onload = function() { console.log("Loaded charset.") };

window.guiImage = document.createElement("img");
guiImage.src = "assets/gui.png";
guiImage.onload = function() { console.log("Loaded gui image.") };

window.mapCanvas = document.getElementById("game");
window.map2d = mapCanvas.getContext("2d");

window.guiCanvas = document.getElementById("gui");
window.gui2d = guiCanvas.getContext("2d");


var showMinimap = false;

// Game class
function Game(){
	this.rows = 16;
	this.cols = 24;
	this.map = [];
	this.objects = [];
	this.offsetX = 0;
	this.offsetY = 0;
	this.maxOffsetX = Math.max(0, (this.cols*16)-mapCanvas.width);
	this.maxOffsetY = Math.max(0, (this.rows*16)-mapCanvas.height);

	this.cursorX = mapCanvas.width  / 2 - 8;
	this.cursorY = mapCanvas.height / 2 - 8;
	this.redrawGui = false;

	for(var y = 0; y < this.rows; ++y)
	{
		this.map[y] = [];
		this.objects[y] = [];
		for(var x = 0; x < this.cols; ++x)
		{
			this.map[y][x] = new Entity(0, 'block');
			this.map[y][x].x = x;
			this.map[y][x].y = y;
			this.objects[y][x] = new Entity(0, 'object');
//			console.log('New xy: ' + x + ', ' + y);
			this.objects[y][x].x = x;
			this.objects[y][x].y = y;
		}
	}

	this.damage_counters = [];
};

Entity.prototype = {
	// Graphics
	draw: function(arr)
	{
		var x = this.x;
		var y = this.y;
		var ty = this.tilesetY;
		var tx = this.tilesetX;
		var id = this.id;
		
		// Don't draw empty blocks or ebjects
		if(id == 0)
			return;

		// single
		if(this.connects == 0){
			map2d.drawImage(tileset, tx, ty, 16, 16, x*16-game.offsetX, y*16-game.offsetY, 16, 16);
		}
		// multi
		else if(this.connects == 1 || this.connects == 4){
			var x1 = tx,    y1 = ty;
			var x2 = tx+16, y2 = ty;
			var x3 = tx,    y3 = ty+16;
			var x4 = tx+16, y4 = ty+16;

			// one up
			if(y > 0 && arr[y-1][x].id == id){
				y1 += 8;
				y2 += 8;
			}
			// one down
			if(y < game.rows-1 && arr[y+1][x].id == id){
				y3 -= 8;1
				y4 -= 8;
			}
			// one left
			if(x > 0 && arr[y][x-1].id == id){
				x1 += 8;
				x3 += 8;
			}
			//one right
			if(x < game.cols-1 && arr[y][x+1].id == id){
				x2 -= 8;
				x4 -= 8;
			}
			// upper left
			if(y > 0 && x > 0 && arr[y-1][x].id == id && arr[y][x-1].id == id && arr[y-1][x-1].id != id){
				x1 = 8*4;	
				y1 = ty+8;
			}
			// upper right
			if(y > 0 && x < game.cols-1 && arr[y-1][x].id == id && arr[y][x+1].id == id && arr[y-1][x+1].id != id){
				x2 = 8*3;
				y2 = ty+8;
			}
			// lower left
			if(y < game.rows-1 && x > 0 && x < game.cols-1 && arr[y+1][x].id == id && arr[y][x-1].id == id && arr[y+1][x-1].id != id){
				x3 = 8*4;
				y3 = ty;
			}
			// upper right
			if(y < game.rows-1 && x < game.cols-1 && arr[y+1][x].id == id && arr[y][x+1].id == id && arr[y+1][x+1].id != id){
				x4 = 8*3;
				y4 = ty;
			}
			map2d.drawImage(tileset, x1, y1, 8, 8, x*16-game.offsetX,   y*16-game.offsetY,   8, 8);
			map2d.drawImage(tileset, x2, y2, 8, 8, x*16+8-game.offsetX, y*16-game.offsetY,   8, 8);-
			map2d.drawImage(tileset, x3, y3, 8, 8, x*16-game.offsetX,   y*16+8-game.offsetY, 8, 8);
			map2d.drawImage(tileset, x4, y4, 8, 8, x*16+8-game.offsetX, y*16+8-game.offsetY, 8, 8);

			// Check only wire-like beyond this point
			if(arr[y][x].connects != 4)
				return;
			var wireCount = 0;
			for(var sy = -1; sy <= 0; ++sy){
				for(var sx = -1; sx <= 0; ++sx){
					neigh = 0;
					for(var cy = 0; cy <= 1; ++cy){
						for(var cx = 0; cx <= 1; ++cx){
							if(y+sy+cy >= 0 && y+sy+cy < game.rows && x+sx+cx >= 0 && x+sx+cx < game.cols){
								if(arr[y+sy+cy][x+sx+cx].id == arr[y][x].id){
									++neigh;
								}
							}
						}
					}
					if(neigh == 4){
						map2d.drawImage(tileset, tx+8*3, ty, 16, 16, (x+sx)*16+8-game.offsetX, (y+sy)*16+8-game.offsetY, 16, 16);
					}
				}
			}
		} else if(this.connects == 2) {
			var x1 = tx, x2 = tx+8*3;
			// left
			if(x > 0 && arr[y][x-1].id == id){
				x1 += 8*2;
			}
			// right
			if(x < game.cols-1 && arr[y][x+1].id == id){
				x2 -= 8*2;
			}
			map2d.drawImage(tileset, x1, ty, 8, 16, x*16-game.offsetX,   y*16-game.offsetY, 8, 16);
			map2d.drawImage(tileset, x2, ty, 8, 16, x*16+8-game.offsetX, y*16-game.offsetY, 8, 16);

		} else if(this.connects == 3) {
			var y1 = ty, y2 = ty+8*3;
			top
			if(y > 0 && arr[y-1][x].id == id){
				y1 += 8*2;
			}
			// bottom
			if(y < game.rows-1 && arr[y+1][x].id == id){
				y2 -= 8*2;
			}
			map2d.drawImage(tileset, tx, y1, 16, 8, x*16-game.offsetX,   y*16-game.offsetY, 16, 8);
			map2d.drawImage(tileset, tx, y2, 16, 8, x*16-game.offsetX, y*16+8-game.offsetY, 16, 8);
		}
		
	},
	// Should be deleted f
	changeType: function(newID){
		this.id = newID;
		var tile = getBlockById(newID);
		this.tilesetX = tile.x;
		this.tilesetY = tile.y;
		this.connects = tile.connects;
		this.obstacle = tile.obstacle;
	}
};


Game.prototype.drawMap = function() {
	map2d.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
	var minX = Math.floor(game.offsetX/16);
	var minY = Math.floor(game.offsetY/16);
	var maxX = minX+Math.floor(mapCanvas.width/16)+1;
	var maxY = minY+Math.floor(mapCanvas.height/16)+1;
	for(var y = minY; y < maxY; ++y) {
		if(y < 0)
			continue;
		for(var x = minX; x < maxX; ++x) {
			if(x < 0)
				continue;
			if(x < game.cols && y < game.rows) {
				game.map[y][x].draw(game.map);
				game.objects[y][x].draw(game.objects);
			}
		}
	}
}

Game.prototype.loadLevel = function(level) {
	game.offsetX = 0, game.offsetY = 0;
	game.cols = level.cols;
	game.rows = level.rows;
	game.maxOffsetX = Math.max(0, (game.cols*16)-mapCanvas.width);
	game.maxOffsetY = Math.max(28, (game.rows*16)-mapCanvas.height+28);
	for(var y = 0; y < game.rows; ++y) {
		this.map[y] = [];
		this.objects[y] = [];
		for(var x = 0; x < game.cols; ++x) {
			var id, type;
			this.map[y][x] = new Entity(level.map[y][x], 'block');
			this.map[y][x].x = x;
			this.map[y][x].y = y;
			this.objects[y][x] = new Entity(level.objects[y][x], 'object');
			this.objects[y][x].x = x;
			this.objects[y][x].y = y;
		}
	}
	player.y = game.rows / 2 * 16;
	player.x = game.cols / 2 * 16;
};

Game.prototype.drawText = function(text, x, y, red){
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,"\'?!@_*#$%&()+-/:;<=>[]{|}~^`';
	var tx, ty, index;
	for(var i = 0; i < text.length; ++i){
		var index = chars.indexOf(text[i]);
		tx = index % 26 * 6;
		ty = 46 + Math.floor(index / 26) * 8 + 8*4*red;
		gui2d.drawImage(guiImage, tx, ty, 6, 8, x, y, 6, 8);
		// Character spacing fix
		if(' '.indexOf(text[i]) >= 0)
			x += 3;
		else if('Iil1\'!'.indexOf(text[i]) >= 0)
			x += 4;
		else if('fgjkpqrt:;'.indexOf(text[i]) >= 0)
			x += 5;
		else
			x += 6;
	}
}

// Experimental damage displaying
Game.prototype.add_damage_counter = function(amount, x, y){
	this.damage_counters.push({
		amount: amount, 
		x: x, 
		y: y
	});
}

Game.prototype.draw_damage_counters = function(){
	for(var c in this.damage_counters){
		game.drawText('c.amount', c.x, c.y);
	}
}

Game.prototype.drawCursor = function() {
	gui2d.drawImage(guiImage, 240, 240, 16, 16, this.cursorX, this.cursorY, 16, 16);
}

function Player() {
	// this.x = game.cols/2 * 16;
	// this.y = game.rows/2 * 16;
	this.x = 100;
	this.y = 100;
	this.dx = 3;
	this.dy = 3;
	this.moving_north = false;
	this.moving_east = false;
	this.moving_south = false;
	this.moving_west = false;
}

Player.prototype.collides = function(x, y) {
	
	return false;
};

var test = 0;

Player.prototype.draw = function() {
	map2d.drawImage(charset, test, 0, 16, 16, this.x - 8 - game.offsetX, this.y - 8 - game.offsetY, 16, 16);
};

Player.prototype.map_borders = function() {
	this.x = Math.max(this.x, 8);
	this.x = Math.min(this.x, game.cols*16 - 8);
	this.y = Math.max(this.y, 8);
	this.y = Math.min(this.y, game.rows*16 - 8);
}

Player.prototype.collision = function() {
	for(var oy = -1; oy <= 1; ++oy){
		for(var ox = -1; ox <= 1; ++ox) {
			// Check for intersection with surrounding blocks
			var tx = Math.floor(this.x / 16) + ox;
			var ty = Math.floor(this.y / 16) + oy;

			var isObstacle = false;
			
			if(ty < 0 || ty > game.rows - 1|| tx < 0 || tx > game.cols - 1){
				isObstacle = true;
			}
			else if(game.map[ty][tx].obstacle || game.objects[ty][tx].obstacle){
				isObstacle = true;
			}
			
			if(isObstacle){
				var dis_x = tx*16 + 8 - this.x;
				var dis_y = ty*16 + 8 - this.y;

				if(Math.abs(dis_x) < 16 && Math.abs(dis_y) < 16){

					if( (this.moving_east || this.moving_west) && (this.moving_north || this.moving_south) ){
						// Corner bug fix
						// if(Math.abs(dis_y) == 16 - this.dy && Math.abs(dis_x) == 16 - this.dx){
						// 	console.log("dis_x: " + dis_x + ", dis_y: " + dis_y);

						// 	this.x += dis_x - Math.sign(dis_x)*16;
						// 	this.y += dis_y - Math.sign(dis_y)*16;
						// 	continue;
						// }

						// If intersects, push away from block
						if(Math.abs(dis_y) < 16 - this.dy)
							this.x += dis_x - Math.sign(dis_x)*16;
						if(Math.abs(dis_x) < 16 - this.dx)
							this.y += dis_y - Math.sign(dis_y)*16;

					} else if(this.moving_east || this.moving_west)
						this.x += dis_x - Math.sign(dis_x)*16;
					else if(this.moving_north || this.moving_south)
						this.y += dis_y - Math.sign(dis_y)*16;
				}
			}
		}
	}
}

Player.prototype.update = function() {
	// north
	if(this.moving_north && !this.moving_south) {
		this.y = Math.max(this.y - this.dy, 8);
		// if(this.y - game.offsetY < 3*16 && game.offsetY > 0){
			game.offsetY -= this.dy;
		// }
	}
	// south
	if(this.moving_south && !this.moving_north) {
		this.y = Math.min(this.y + this.dy, game.rows*16 - 8);
		// if(this.y - game.offsetY > mapCanvas.height - 3*16 && game.offsetY < game.maxOffsetY){
			game.offsetY += this.dy;
		// }
	}
	// east
	if(this.moving_east && !this.moving_west) {
		this.x = Math.min(this.x + this.dx, game.cols*16 - 8);
		// if(this.x - game.offsetX > mapCanvas.width - 3*16 && game.offsetX < game.maxOffsetX){
			game.offsetX += this.dx;
		// }
	}
	// west
	if(this.moving_west && !this.moving_east) {
		this.x = Math.max(this.x - this.dx, 8);
		// if(this.x - game.offsetX < 3*16 && game.offsetX > 0){
			game.offsetX -= this.dx;
		// }
	}
	this.collision();
	this.map_borders();
};

// Keyboard and mouse

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
	// Movement
	switch(e.keyCode) {
		// w
		case 87: player.moving_north = true; break;
		// d
		case 68: player.moving_east = true; break;
		// s
		case 83: player.moving_south = true; break;
		// a
		case 65: player.moving_west = true; break;
	}
}

function keyUpHandler(e) {
	// Movement
	switch(e.keyCode) {
		// w
		case 87: player.moving_north = false; break;
		// d
		case 68: player.moving_east = false; break;
		// s
		case 83: player.moving_south = false; break;
		// a
		case 65: player.moving_west = false; break;
	}
}

// document.addEventListener("mousedown", clickHandler, false);
// document.addEventListener("mouseup", clickUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
	// console.log(e);
	game.cursorX = Math.floor(e.clientX/4) - 8;
	game.cursorY = Math.floor(e.clientY/4) - 8;
	game.redrawGui = true;
}

Game.prototype.update = function() {
	this.offsetX = player.x - Math.floor(mapCanvas.width / 2);
	this.offsetY = player.y - Math.floor(mapCanvas.height / 2);
	// if(this.cursorX < mapCanvas.width / 2)
		// this.offsetX += Math.floor((this.cursorX - player.x) / 2) ;
	// else
		// this.offsetX -= Math.floor((this.cursorX - player.x) / 2) ;
	var cursorOffsetX = player.x - this.offsetX - this.cursorX;
	var cursorOffsetY = player.y - this.offsetY - this.cursorY;
	this.offsetX -= Math.floor(cursorOffsetX / 6);
	this.offsetY -= Math.floor(cursorOffsetY / 6);
}

// Main

var game = new Game();
var player = new Player();
game.loadLevel(double);

var t = 0;

function drawLoop() {

	game.drawMap();

	player.draw();

	if(game.redrawGui)
	{
		gui2d.clearRect(0, 0, guiCanvas.width, guiCanvas.height);
		game.drawCursor();
		game.redrawGui = false;	
	}

	requestAnimationFrame(drawLoop);
}


var updateInterval = setInterval(function(){
	player.update();
	game.update();
	// some text test
	// game.draw_damage_counters();

}, 1000/60);

// Start drawing
drawLoop();
