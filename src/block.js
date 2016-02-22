window.tileset = document.createElement("img");
tileset.src = "assets/tileset.png";
tileset.onload = function() {};

window.mapCanvas = document.getElementById("game");
window.map2d = mapCanvas.getContext("2d");

window.ROWS = 16;
window.COLS = 24;

function getBlockById(id)
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
		case 6: x = 0; y = 8*9; connects = 3; break;
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
	var tile = getBlockById(blockID);
	this.tilesetX = tile[0];
	this.tilesetY = tile[1];
	this.x = null;
	this.y = null;

	// @conects
	// 0 single - doesn't connect
	// 1 multi - connects with other of the same type
	// 2 row - connects only to left or right
	// 3 wire-like - the middle block is changed differently
	this.connects = tile[2];
}

window.map = [];
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
			map2d.drawImage(tileset, tx, ty, 16, 16, x*16-offsetX, y*16-offsetY, 16, 16);
		}
		// multi
		else if(this.connects == 1 || this.connects == 3)
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
				y3 -= 8;1
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
			map2d.drawImage(tileset, x1, y1, 8, 8, x*16-offsetX,   y*16-offsetY,   8, 8);
			map2d.drawImage(tileset, x2, y2, 8, 8, x*16+8-offsetX, y*16-offsetY,   8, 8);-
			map2d.drawImage(tileset, x3, y3, 8, 8, x*16-offsetX,   y*16+8-offsetY, 8, 8);
			map2d.drawImage(tileset, x4, y4, 8, 8, x*16+8-offsetX, y*16+8-offsetY, 8, 8);

			// Check only wire-like beyond this point
			if(map[y][x].connects != 3)
				return;
			var wireCount = 0;
			for(var sy = -1; sy <= 0; ++sy)
			{
				for(var sx = -1; sx <= 0; ++sx)
				{
					neigh = 0;
					for(var cy = 0; cy <= 1; ++cy)
					{
						for(var cx = 0; cx <= 1; ++cx)
						{
							if(y+sy+cy >= 0 && y+sy+cy < ROWS && x+sx+cx >= 0 && x+sx+cx < COLS)
							{
								if(map[y+sy+cy][x+sx+cx].blockID == map[y][x].blockID)
								{
									++neigh;
								}
							}
						}
					}
					if(neigh == 4)
					{
						map2d.drawImage(tileset, tx+8*3, ty, 16, 16, (x+sx)*16+8-offsetX, (y+sy)*16+8-offsetY, 16, 16);
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
			map2d.drawImage(tileset, x1, ty, 8, 16, x*16-offsetX,   y*16-offsetY, 8, 16);
			map2d.drawImage(tileset, x2, ty, 8, 16, x*16+8-offsetX, y*16-offsetY, 8, 16);

		}
		
	},
	changeType: function(newID)
	{
		this.blockID = newID;
		var tile = getBlockById(newID);
		this.tilesetX = tile[0];
		this.tilesetY = tile[1];
		this.connects = tile[2];
	}
};
