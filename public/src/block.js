window.tileset = document.createElement("img");
tileset.src = "assets/tileset.png";
tileset.onload = function() { console.log("Loaded tileset.")};

window.bitmapCanvas = document.createElement("canvas");
bitmapCanvas.src = "assets/tileset.png";

function getBlockById(id) {
	switch(id)
	{
		// floor
		case 1:  return { x: 0, y: 0,    connects: 1, obstacle: false, bulletproof: 0 };
		// asphalt
		case 2:  return { x: 14*8, y: 0, connects: 0, obstacle: false, bulletproof: 0 };
		// brick
		case 3:  return { x: 0, y: 8*3,  connects: 1, obstacle: true,  bulletproof: 1 };
		// wall
		case 4:  return { x: 0, y: 8*6,  connects: 1, obstacle: true,  bulletproof: 1 };
		// shaded water
		case 5:  return { x: 96, y: 0,   connects: 0, obstacle: false, bulletproof: 0 };
		// undefined
		default: return { x: 96, y: 104, connects: 0, obstacle: true,  bulletproof: 0 };

	}
}


function getObjectById(id) {
	var x = null, y = null, connects = null, obstacle = null;
	switch(id)
	{
		// box
		case 1:  return { x: 8*14, y: 8*2, connects: 0, obstacle: true,  bulletproof: 2 };
		// test
		case 2:  return { x: 8*12, y: 8*2, connects: 0, obstacle: false, bulletproof: 0 };
		// glass horizontal
		case 3:  return { x: 8*8,  y: 8*0, connects: 2, obstacle: true,  bulletproof: 2 };
		// glass vertical
		case 4:  return { x: 8*10, y: 8*2, connects: 3, obstacle: true,  bulletproof: 2 };
		// undefined
		default: return { x: 96,   y: 104, connects: 0, obstacle: false, bulletproof: 0 };

	}
}

function Entity(id, type) {
	// number to be identified with
	this.id = id;

	// Block or object
	var entity;
	if(type === 'block')
		entity = getBlockById(id);
	else if(type === 'object')
		entity = getObjectById(id);

	// upper left corner in tileset	
	this.tilesetX = entity.x;
	this.tilesetY = entity.y;
	this.x = null;
	this.y = null;

	// 0 single - doesn't connect
	// 1 multi - connects with other of the same type
	// 2 row - connects only to left or right
	// 3 column - connects only to top or bottom
	// 4 wire-like - the middle block is changed differently
	this.connects = entity.connects;
	// Used for checking wall collision
	this.obstacle = entity.obstacle;
	// Used for bullet collision
	// 0 - bulelts pass
	// 1 - bullets stop
	// 2 - bullets shatter entity (todo later)
	this.bulletproof = entity.bulletproof;
}