'use strict';

var Tile = function() {
	// [uu, rr, dd, ll, ul, ur, dr, dl] - in dir
	// [dl, dr, ur, ul, ll, dd, rr, uu] - in binary
	var dir = [[-1, 0], [0, 1], [1, 0], [0, -1], [-1, -1], [-1, 1], [1, 1], [1, -1]];

	function Tile(game, x, y, type) {
		this.x = x;
		this.y = y;
		this.neighbours = 0;
		this.type = type;
		this.game = game;
	}

	Tile.prototype.setNeighbour = function(n) {
		this.neighbours |= (1 << n);
	};

	Tile.prototype.updateNeighbours = function() {
		for(var off = 0; off < dir.length; off++) {
			var y = this.y + dir[off][0];
			var x = this.x + dir[off][1];

			if(x < 0 || x >= this.game.map[0].length || y < 0 || y >= this.game.map.length)
				continue;
			if(this.game.map[y][x].type === 0 || this.game.map[y][x].type !== this.type)
				continue;

			this.setNeighbour(off);
		}		
	};

	Tile.prototype.draw = function() {
		const ts = TILESET_SIZE / 2;
		const th = this.game.tileSize / 2;
		var x = this.x * this.game.tileSize + this.game.camera.x;
		var y = this.y * this.game.tileSize + this.game.camera.y;
		var sx = 0, sy = 0;

		if(x + this.game.tileSize < 8 || x > this.game.ctx.canvas.width)
			return;
		if(y + this.game.tileSize < 8 || y > this.game.ctx.canvas.height)
			return;

		// dirt
		if(this.type === 0) {
			this.game.ctx.drawImage(this.game.tileset, 224, 0, 2 * ts, 2 * ts, x, y, 2 * th, 2 * th);
			return;
		}

		// Connecting
		if(this.type === 1) {
			// water
			sy = 0;
		} else if(this.type === 2) {
			// grass
			sy = ts * 3;
		} else if(this.type === 3) {
			// stone
			sy = ts * 6;
		} 

		var x1 = 0, y1 = 0;
		var x2 = 2, y2 = 0;
		var x3 = 0, y3 = 2;
		var x4 = 2, y4 = 2;
		var ngh = this.neighbours;

		// one up
		if(ngh & (1 << 0)) {
			y1++; y2++;
			//  right
			if(ngh & (1 << 1) && ~ngh & (1 << 5)) {
				x2 = 4; y2 = 1;
			}
			// left
			if( ngh & (1 << 3) && ~ngh & (1 << 4)) {
				x1 = 3; y1 = 1;
			}
		}
		// //one right
		if(ngh & (1 << 1)) {
			x2--; x4--;
		}
		// one down
		if(ngh & (1 << 2)) {
			y3--; y4--;
			// lower right
			if(ngh & (1 << 1) && ~ngh & (1 << 6) ) {
				x4 = 3; y4 = 0;
			}
			// lower left
			if(ngh & (1 << 3) && ~ngh & (1 << 7) ) {
				x3 = 3; y3 = 0;
			}
		}
		// one left
		if(ngh & (1 << 3)) {
			x1++; x3++;
		}

		this.game.ctx.drawImage(this.game.tileset, sx + ts * x1, sy + ts * y1, ts, ts, x     , y     , th, th);
		this.game.ctx.drawImage(this.game.tileset, sx + ts * x2, sy + ts * y2, ts, ts, x + th, y     , th, th);
		this.game.ctx.drawImage(this.game.tileset, sx + ts * x3, sy + ts * y3, ts, ts, x     , y + th, th, th);
		this.game.ctx.drawImage(this.game.tileset, sx + ts * x4, sy + ts * y4, ts, ts, x + th, y + th, th, th);
	};

	return Tile;
}();