window.charset = document.createElement("img");
charset.src = "assets/char.png";
charset.onload = function() { console.log("Loaded charset.") };

window.guiImage = document.createElement("img");
guiImage.src = "assets/gui.png";
guiImage.onload = function() { console.log("Loaded gui image.") };

window.particlesImage = document.createElement("img");
particlesImage.src = "assets/particles.png";
particlesImage.onload = function() { console.log("Loaded particles image.") };

window.mapCanvas = document.getElementById("game");
window.map2d = mapCanvas.getContext("2d");

window.guiCanvas = document.getElementById("gui");
window.gui2d = guiCanvas.getContext("2d");

var contextScale = 2;
var debug = true;

// Check for line intersection with a quad
// x1, y1, x1, y2 - line segment
// x3, y3, x4, y4 - upper left and lower right corners of box
function lineIntersectBox(x1, y1, x2, y2, x3, y3, x4, y4) {
	var top    = linesIntersect(x1, y1, x2, y2, x3, y3, x4, y3);
	var right  = linesIntersect(x1, y1, x2, y2, x4, y3, x4, y4);
	var bottom = linesIntersect(x1, y1, x2, y2, x3, y4, x4, y4);
	var left   = linesIntersect(x1, y1, x2, y2, x3, y3, x3, y4);
	var points = [];
	if(top.onLine1 && top.onLine2){
		if(debug) {
			gui2d.beginPath();	
			gui2d.moveTo(x3 - game.offsetX, y3 - game.offsetY);
			gui2d.lineTo(x4 - game.offsetX, y3 - game.offsetY);
			gui2d.strokeStyle = "#ff0000";
			gui2d.stroke();
		}
		points.push({x: top.x, y: top.y});
	}
	if(right.onLine1 && right.onLine2){
		if(debug) {
			gui2d.beginPath();
			gui2d.moveTo(x4 - game.offsetX, y3 - game.offsetY);
			gui2d.lineTo(x4 - game.offsetX, y4 - game.offsetY);
			gui2d.strokeStyle = "#00ff00";
			gui2d.stroke();
		}
		points.push({x: right.x, y: right.y});
	}
	if(bottom.onLine1 && bottom.onLine2){
		if(debug) {
			gui2d.beginPath();
			gui2d.moveTo(x3 - game.offsetX, y4 - game.offsetY);
			gui2d.lineTo(x4 - game.offsetX, y4 - game.offsetY);
			gui2d.strokeStyle = "#0000ff";
			gui2d.stroke();
		}
		points.push({x: bottom.x, y: bottom.y});
	}
	if(left.onLine1 && left.onLine2){
		if(debug) {			
			gui2d.beginPath();
			gui2d.moveTo(x3 - game.offsetX, y3 - game.offsetY);
			gui2d.lineTo(x3 - game.offsetX, y4 - game.offsetY);
			gui2d.strokeStyle = "#ffff00";
			gui2d.stroke();
		}
		points.push({x: left.x, y: left.y});
	}
	var minDist = null;
	var minX = null, minY = null;
	for(var i = 0; i < points.length; ++i) {
		// console.log(points[i]);
		var dist = Math.abs(x1 - points.x) + Math.abs(y1 - points.y);
		if(minDist > dist || minDist == null) {
			minDist = dist;
			minX = points[i].x;
			minY = points[i].y;
		}
	}
	if(minX != null && minY != null){
		if(debug){		
			gui2d.beginPath();
			gui2d.rect(Math.round(minX - 2 - game.offsetX), Math.round(minY - 2 - game.offsetY), 3, 3);
			gui2d.fillStyle = "#00ffff";
			gui2d.fill();
			gui2d.closePath();
		}
	}
	return {x: minX, y: minY};
}


// Game class
function Game() {
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

	for(var y = 0; y < this.rows; ++y) {
		this.map[y] = [];
		this.objects[y] = [];
		for(var x = 0; x < this.cols; ++x) {
			this.map[y][x] = new Entity(0, 'block');
			this.map[y][x].x = x;
			this.map[y][x].y = y;
			this.objects[y][x] = new Entity(0, 'object');
			this.objects[y][x].x = x;
			this.objects[y][x].y = y;
		}
	}

	this.bulletPoolSize = 1200;
	this.bulletCount = 0;
	this.bullets = [];
	for(var i = 0; i < this.bulletPoolSize; ++i) {
		this.bullets[i] = new Bullet();
	}

};

Entity.prototype = {
	// Graphics
	draw: function(arr) {
		var x = this.x;
		var y = this.y;
		var ty = this.tilesetY;
		var tx = this.tilesetX;
		var id = this.id;
		var roundOffsetX = Math.round(game.offsetX);
		var roundOffsetY = Math.round(game.offsetY);
		
		// Don't draw empty blocks or ebjects
		if(id == 0) {
			return;
		}

		// single
		if(this.connects == 0) {
			map2d.drawImage(tileset, tx, ty, 16, 16, x*16-roundOffsetX, y*16-roundOffsetY, 16, 16);
		}
		// multi
		else if(this.connects == 1 || this.connects == 4) {
			var x1 = tx,    y1 = ty;
			var x2 = tx+16, y2 = ty;
			var x3 = tx,    y3 = ty+16;
			var x4 = tx+16, y4 = ty+16;

			// one up
			if(y > 0 && arr[y-1][x].id == id) {
				y1 += 8;
				y2 += 8;
			}
			// one down
			if(y < game.rows-1 && arr[y+1][x].id == id) {
				y3 -= 8;1
				y4 -= 8;
			}
			// one left
			if(x > 0 && arr[y][x-1].id == id) {
				x1 += 8;
				x3 += 8;
			}
			//one right
			if(x < game.cols-1 && arr[y][x+1].id == id) {
				x2 -= 8;
				x4 -= 8;
			}
			// upper left
			if(y > 0 && x > 0 && arr[y-1][x].id == id && arr[y][x-1].id == id && arr[y-1][x-1].id != id) {
				x1 = 8*4;	
				y1 = ty+8;
			}
			// upper right
			if(y > 0 && x < game.cols-1 && arr[y-1][x].id == id && arr[y][x+1].id == id && arr[y-1][x+1].id != id) {
				x2 = 8*3;
				y2 = ty+8;
			}
			// lower left
			if(y < game.rows-1 && x > 0 && x < game.cols-1 && arr[y+1][x].id == id && arr[y][x-1].id == id && arr[y+1][x-1].id != id) {
				x3 = 8*4;
				y3 = ty;
			}
			// upper right
			if(y < game.rows-1 && x < game.cols-1 && arr[y+1][x].id == id && arr[y][x+1].id == id && arr[y+1][x+1].id != id) {
				x4 = 8*3;
				y4 = ty;
			}

			map2d.drawImage(tileset, x1, y1, 8, 8, x*16-roundOffsetX,   y*16-roundOffsetY,   8, 8);
			map2d.drawImage(tileset, x2, y2, 8, 8, x*16+8-roundOffsetX, y*16-roundOffsetY,   8, 8);
			map2d.drawImage(tileset, x3, y3, 8, 8, x*16-roundOffsetX,   y*16+8-roundOffsetY, 8, 8);
			map2d.drawImage(tileset, x4, y4, 8, 8, x*16+8-roundOffsetX, y*16+8-roundOffsetY, 8, 8);

			// Check only wire-like beyond this point
			if(arr[y][x].connects != 4)
				return;
			var wireCount = 0;
			for(var sy = -1; sy <= 0; ++sy) {
				for(var sx = -1; sx <= 0; ++sx) {
					neigh = 0;
					for(var cy = 0; cy <= 1; ++cy) {
						for(var cx = 0; cx <= 1; ++cx) {
							if(y+sy+cy >= 0 && y+sy+cy < game.rows && x+sx+cx >= 0 && x+sx+cx < game.cols) {
								if(arr[y+sy+cy][x+sx+cx].id == arr[y][x].id) {
									++neigh;
								}
							}
						}
					}
					if(neigh == 4) {
						map2d.drawImage(tileset, tx+8*3, ty, 16, 16, (x+sx)*16+8-roundOffsetX, (y+sy)*16+8-roundOffsetY, 16, 16);
					}
				}
			}
		} else if(this.connects == 2) {
			var x1 = tx, x2 = tx+8*3;
			// left
			if(x > 0 && arr[y][x-1].id == id) {
				x1 += 8*2;
			}
			// right
			if(x < game.cols-1 && arr[y][x+1].id == id) {
				x2 -= 8*2;
			}
			map2d.drawImage(tileset, x1, ty, 8, 16, x*16-roundOffsetX,   y*16-roundOffsetY, 8, 16);
			map2d.drawImage(tileset, x2, ty, 8, 16, x*16+8-roundOffsetX, y*16-roundOffsetY, 8, 16);

		} else if(this.connects == 3) {
			var y1 = ty, y2 = ty+8*3;
			top
			if(y > 0 && arr[y-1][x].id == id) {
				y1 += 8*2;
			}
			// bottom
			if(y < game.rows-1 && arr[y+1][x].id == id) {
				y2 -= 8*2;
			}
			map2d.drawImage(tileset, tx, y1, 16, 8, x*16-roundOffsetX,   y*16-roundOffsetY, 16, 8);
			map2d.drawImage(tileset, tx, y2, 16, 8, x*16-roundOffsetX, y*16+8-roundOffsetY, 16, 8);
		}
		
	},
	// Should be deleted f
	changeType: function(newID) {
		this.id = newID;
		var tile = getBlockById(newID);
		this.tilesetX = tile.x;
		this.tilesetY = tile.y;
		this.connects = tile.connects;
		this.obstacle = tile.obstacle;
	}
};


Game.prototype.drawMap = function() {
	// Clear canvas
	map2d.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
	// Draw only visible tiles
	var minX = Math.floor(this.offsetX/16);
	var minY = Math.floor(this.offsetY/16);
	var maxX = minX + Math.floor(mapCanvas.width/16)+1;
	var maxY = minY + Math.floor(mapCanvas.height/16)+1;
	for(var y = minY; y < maxY; ++y) {
		if(y < 0)
			continue;
		for(var x = minX; x < maxX; ++x) {
			if(x < 0)
				continue;
			if(x < this.cols && y < this.rows) {
				this.map[y][x].draw(this.map);
				this.objects[y][x].draw(this.objects);
			}
		}
	}
}

Game.prototype.loadLevel = function(level) {
	this.offsetX = 0, this.offsetY = 0;
	this.cols = level.cols;
	this.rows = level.rows;
	this.maxOffsetX = Math.max(0, (this.cols*16)-mapCanvas.width);
	this.maxOffsetY = Math.max(28, (this.rows*16)-mapCanvas.height+28);
	for(var y = 0; y < this.rows; ++y) {
		this.map[y] = [];
		this.objects[y] = [];
		for(var x = 0; x < this.cols; ++x) {
			var id, type;
			this.map[y][x] = new Entity(level.map[y][x], 'block');
			this.map[y][x].x = x;
			this.map[y][x].y = y;
			this.objects[y][x] = new Entity(level.objects[y][x], 'object');
			this.objects[y][x].x = x;
			this.objects[y][x].y = y;
		}
	}
	player.y = this.rows / 2 * 16;
	player.x = this.cols / 2 * 16;
};

Game.prototype.drawText = function(text, x, y, red) {
	text = text.toString();
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,"\'?!@_*#$%&()+-/:;<=>[]{|}~^`';
	var tx, ty, index;
	for(var i = 0; i < text.length; ++i) {
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

Game.prototype.drawCursor = function() {
	gui2d.drawImage(guiImage, 240, 240, 16, 16, this.cursorX, this.cursorY, 16, 16);
}

Game.prototype.updateBullets = function(dt) {
	// console.log(dt);
	for(var i = 0; i < this.bulletCount; ++i) {
		var b = this.bullets[i];
		var paw = player.activeWeapon;
		
		// since high speed can overpass it easily it's kind of more random
		// kind of
		// so I might leave it, saying higher speed is higher inaccurracy
		if(b.distanceX*b.distanceX + b.distanceY*b.distanceY > paw.range*paw.range) {
			this.bullets[i].shouldRemove = true;
		}
		// Delta x, y
		var d = {x: b.dx, y: b.dy};
		normalize(d);
		var dx = d.x * b.speed * dt;
		var dy = d.y * b.speed * dt;
		// Calculate new x, y
		var nx = this.bullets[i].x + dx;
		var ny = this.bullets[i].y + dy;
		if(debug) {	
			gui2d.beginPath();
			gui2d.moveTo(this.bullets[i].x - this.offsetX, this.bullets[i].y - this.offsetY);
			gui2d.lineTo(nx - this.offsetX, ny - this.offsetY);
			gui2d.strokeStyle = "#ff0000";
			// gui2d.stroke();
			gui2d.closePath();
		}

		var tx = Math.floor(b.x / 16);
		var ty = Math.floor(b.y / 16);
		// Out of bounds
		if(tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) {
			this.bullets[i].shouldRemove = true;
			continue;
		}

		// Check for intersection
		min_x = Math.floor(Math.min(b.x, nx) / 16); 
		min_y = Math.floor(Math.min(b.y, ny) / 16);
		max_x = Math.floor(Math.max(b.x, nx) / 16); 
		max_y = Math.floor(Math.max(b.y, ny) / 16);
		for(var iy = min_y; iy <= max_y; ++iy) {
			for(var jx = min_x; jx <= max_x; ++jx) {
				// Don't check out of bounds
				if(iy < 0 || iy >= this.rows || jx < 0 || jx >= this.cols) {
					continue;
				}
				// Don't check blocks bullets can pass through
				if(!this.map[iy][jx].bulletproof && !this.objects[iy][jx].bulletproof) {
					continue;
				}
				// Check for intersection with each side
				// stop at closest one
				// later i'll use it for particles
				var interPoint = lineIntersectBox(b.x, b.y, nx, ny, 
												  jx*16, iy*16, jx*16 + 16, iy*16 + 16);
				if(debug){
					console.log(interPoint);
				}
				if(interPoint.x != null && interPoint.y != null) {
					this.bullets[i].shouldRemove = true;
					break;
				}
			}
		}

		// Inside of a block
		if(this.map[ty][tx].obstacle || this.objects[ty][tx].obstacle) {
			this.bullets[i].shouldRemove = true;
		}

		// If should remove, remove it
		if(this.bullets[i].shouldRemove == true) {
			this.bullets[i].alive = false;
			this.bullets[i] = this.bullets[this.bulletCount - 1];
			this.bulletCount--;
			continue;
		}

		// Change x, y to new
		this.bullets[i].x = nx;
		this.bullets[i].y = ny;
		// Add distance
		this.bullets[i].distanceX += dx;
		this.bullets[i].distanceY += dy;

	}
}

Game.prototype.drawBullets = function() {
	var ix = 2;
	var iy = 2;
	for(var b = 0; b < this.bulletCount; ++b) {
		var x = Math.round(this.bullets[b].x - this.offsetX - 2);
		var y = Math.round(this.bullets[b].y - this.offsetY - 2);
		map2d.drawImage(particlesImage, ix, iy, 3, 3, x, y, 3, 3);
	}
}

function Player() {
	this.x = 100;
	this.y = 100;
	this.speed = 200;
	// this.accel = 50;
	this.dir = { x: 0, y: 0, };
	this.moving_north = false;
	this.moving_east = false;
	this.moving_south = false;
	this.moving_west = false;
	
	this.activeWeapon = new Weapon(null);
	this.shooting = false;
}

Player.prototype.draw = function() {
	var tx = 0, ty = 0;
	map2d.drawImage(charset, tx, ty, 16, 16, this.x - 8 - game.offsetX, this.y - 8 - game.offsetY, 16, 16);
};

Player.prototype.collision = function() {
	min_x = Math.floor(Math.min(this.x - 8, this.nx - 8) / 16); 
	min_y = Math.floor(Math.min(this.y - 8, this.ny - 8) / 16);
	max_x = Math.floor(Math.max(this.x + 8, this.nx + 8) / 16); 
	max_y = Math.floor(Math.max(this.y + 8, this.ny + 8) / 16);
	for(var y = min_y; y <= max_y; ++y) {
		if(y < 0 || y >= game.rows) {
			continue;
		}
		for(var x = min_x; x <= max_x; ++x) {
			if(x < 0 || x >= game.cols) {
				continue;
			}
			// Don't check tiles that are not obstacles
			if(!game.map[y][x].obstacle && !game.objects[y][x].obstacle) {
				continue;
			}
			// Check if proposed x and y are okay. If so update them
			// if(lineIntersectBox(this.x, this.y, this.nx, this.ny, x*16, y*16, x*16 + 15, y*16 + 15)) {
				// console.log("xy");
				// this.nx = this.x;
				// this.ny = this.y;
			//} else 
			if(lineIntersectBox(this.x, this.y, this.nx, this.y, x*16, y*16, x*16 + 16, y*16 + 16)) {
				//console.log("x");
				this.nx = this.x;
			}
			if(lineIntersectBox(this.x, this.y, this.x, this.ny, x*16, y*16, x*16 + 16, y*16 + 16)) {
				gui2d.beginPath();
				gui2d.moveTo(this.x - game.offsetX, this.y - game.offsetY);
				gui2d.lineTo(this.nx  - game.offsetX, this.ny - game.offsetY);
				gui2d.strokeStyle = "#ff00ff";
				gui2d.stroke();
				//console.log("y");
				this.ny = this.y;
			// } else {
				// console.log("what do");
				// this.x = this.nx;
				// this.y = this.ny;
			}
		}
	}

}

Player.prototype.update = function(dt) {
	this.dir = {x: 0, y: 0};

	// north
	if(this.moving_north) {
		this.dir = addVectors(this.dir, {x: 0, y: -1});
	}
	// south
	if(this.moving_south) {
		this.dir = addVectors(this.dir, {x: 0, y: 1});
	}
	// east
	if(this.moving_east) {
		this.dir = addVectors(this.dir, {x: 1, y: 0});
	}
	// west
	if(this.moving_west) {
		this.dir = addVectors(this.dir, {x: -1, y: 0});
	}

	normalize(this.dir);

	this.nx = this.x + this.dir.x * this.speed * dt;
	this.ny = this.y + this.dir.y * this.speed * dt;

	this.collision();

	this.x = this.nx;
	this.y = this.ny;

	this.x = clamp(this.x, 8, game.cols*16 - 8);
	this.y = clamp(this.y, 8, game.rows*16 - 8);
};

Player.prototype.shoot = function(v) {
	// multishoot weapons should just randomly differ multiple shots
	for(var i = 0; i < player.activeWeapon.bulletCount; ++i) {
		rv = randomVector(Math.atan2(v.x, v.y) - Math.PI/2, player.activeWeapon.angleVar);
		if(game.bulletCount < game.bulletPoolSize) {
			game.bullets[game.bulletCount++] = new Bullet(player.activeWeapon.bulletType, player.x, player.y, rv.x, rv.y);
		}
	}
	player.shooting = false;
}

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

document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
	game.cursorX = Math.floor(e.clientX/4) - 8;
	game.cursorY = Math.floor(e.clientY/4) - 8;
	game.redrawGui = true;
}

function mouseDownHandler(e) {
	// Coordinates 
	var bx = player.x - game.offsetX;
	var by = player.y - game.offsetY;
	var ex = Math.floor(e.clientX / 4);
	var ey = Math.floor(e.clientY / 4);
	var dx = ex - bx;
	var dy = ey - by;

	var v = {x: dx, y: dy};
	normalize(v);
	player.shoot(v);

	// Debug click register
	if(debug) {		
		gui2d.beginPath();
		gui2d.rect(ex - 2, ey - 2, 3, 3);
		gui2d.fillStyle = "#00ff00";
		gui2d.fill();
	}
}

function mouseUpHandler(e) {
	player.shooting = false;
}


Game.prototype.updateCamera = function() {
	this.offsetX = player.x - Math.floor(mapCanvas.width / 2);
	this.offsetY = player.y - Math.floor(mapCanvas.height / 2);

	// Make camera move a little bit to the cursor so it's less stiff
	var cursorOffsetX = player.x - this.offsetX - this.cursorX;
	var cursorOffsetY = player.y - this.offsetY - this.cursorY;
	this.offsetX -= Math.floor(cursorOffsetX / 6);
	this.offsetY -= Math.floor(cursorOffsetY / 6);
}

Game.prototype.update = function(dt) {
	this.updateCamera();
	this.updateBullets(dt);
}

// Main

var game = new Game();
var player = new Player();
player.activeWeapon = new Weapon(1);
game.loadLevel(double);
player.x -= 60;

// Main
var lastUpdate = Date.now();
var lastfps = 0;
(function tick() {
	// Calculate time from last frame
	var now = Date.now();
	var delta = (now - lastUpdate) / 1000;
	lastUpdate = now;

	// Update
	player.update(delta);
	game.update(delta);

	// Draw map and entities
	game.drawMap();
	game.drawBullets();
	player.draw();

	player.collision();

	// Draw GUI
	if(game.redrawGui)
	{
		gui2d.clearRect(0, 0, guiCanvas.width, guiCanvas.height);
		game.drawCursor();
		game.redrawGui = false;	
	}

	// Show fps
	var fps = Math.round(1/delta * 0.1)*10;
	gui2d.clearRect(0, 0, 60, 30);
	game.drawText(fps, 0, 0, true);

	requestAnimationFrame(tick);
})();