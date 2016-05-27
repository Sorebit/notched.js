window.tileset = document.createElement("img");
tileset.src = "assets/tileset.png";
tileset.onload = function() { console.log("Loaded tileset.")};

window.bitmapCanvas = document.createElement("canvas");
bitmapCanvas.src = "assets/tileset.png";

function getBlockById(id) {
	var x = null, y = null, connects = null, obstacle = null;
	switch(id)
	{
		// floor
		case 1: x = 0; y = 0; connects = 1; obstacle = false; break;
		// asphalt
		case 2: x = 14*8; y = 0; connects = 0; obstacle = false; break;
		// brick
		case 3: x = 0; y = 8*3; connects = 1; obstacle = true; break;
		// wall
		case 4: x = 0; y = 8*6; connects = 1; obstacle = true; break;
		// shaded water
		case 5: x = 96; y = 0; connects = 0; obstacle = false; break;
		// undefined
		default: x = 96; y = 104; connects = 0; obstacle = true;

	}
	return {x: x, y: y, connects: connects, obstacle: obstacle};
}


function getObjectById(id) {
	var x = null, y = null, connects = null, obstacle = null;
	switch(id)
	{
		// box
		case 1: x = 8*14; y = 8*2; connects = 0; obstacle = true; break;
		// test
		case 2: x = 8*12; y = 8*2; connects = 0; obstacle = false; break;
		// glass horizontal
		case 3: x = 8*8; y = 8*0; connects = 2; obstacle = true; break;
		// glass vertical
		case 4: x = 8*10; y = 8*2; connects = 3; obstacle = true; break;
		// undefined
		default: x = 96; y = 104; connects = 0; obstacle = false;

	}
	return {
		x: x, 
		y: y, 
		connects: connects,
		obstacle: obstacle,
	};
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
}