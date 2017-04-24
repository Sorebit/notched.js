'use strict';

var Game = function() {
	// Game constructor
	function Game(ctx, width, height) {
		this.ctx = ctx;

		// Map dimensions in tiles
		this.width = width;
		this.height = height;

		this.zoom = 1;
		this.tileSize = TILE_SIZE * this.zoom;
		this.camera = {x: 0, y: 0};
		this.mouse = {x: 0, y: 0, down: false};
		this.cursor = {x: undefined, y: undefined};

		// Initialize map
		this.map = new Array(this.height);
		for(var y = 0; y < this.height; y++) {
			this.map[y] = new Array(this.width);
			for(var x = 0; x < this.width; x++) {
				this.map[y][x] = new Tile(this, x, y, 0);
			}
		}
	}

	Game.prototype.changeType = function(cx, cy, type) {
		if(cx >= 0 && cx < this.width && cy >= 0 && cy < this.height)
			this.map[cy][cx].type = type;
		for(var dx = -1; dx <= 1; dx++) {
			for(var dy = -1; dy <= 1; dy++) {
				var x = cx + dx;
				var y = cy + dy;
				if(x < 0 || x >= this.width || y < 0 || y >= this.height)
					continue;
				this.map[y][x].updateNeighbours();
			}	
		}
	}

	Game.prototype.drawCursor = function() {
		if(typeof this.cursor.x === 'undefined' || typeof this.cursor.y === 'undefined')
			return;
		this.ctx.fillStyle = 'rgba(180, 180, 180, 0.7)';
		this.ctx.fillRect(this.cursor.x * TILE_SIZE + this.camera.x, this.cursor.y * TILE_SIZE + this.camera.y, TILE_SIZE, TILE_SIZE);
	}

	// Utility forEach function
	Game.prototype.forEachTile = function(execute) {
		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {
				execute(this.map[y][x]);
			}
		}
	}

	// Tileset load handler
	Game.prototype.loadTileset = function(path) {
		var self = this;
		var ev = new Event('tilesetReady');
		var tileset = new Image();
		tileset.src = path;
		tileset.addEventListener('load', function() {
			console.log('Done loading tileset.');
			self.tileset = tileset;
			document.dispatchEvent(ev);
		})
	};

	// path - path to tileset file
	// mapGen - function to execute to generate map before processing it
	Game.prototype.setup = function(path, mapGen) {
		var self = this;
		// Setup tileset load handler before loading
		document.addEventListener('tilesetReady', function() {
			if(mapGen instanceof Function) {
				mapGen();
			}
			// Process map for diplaying
			self.forEachTile(function(tile) {
				tile.updateNeighbours(self.map);
			});
			// Emit 'gameReady' event
			document.dispatchEvent(new Event('gameReady'));
		});
		// Load tileset
		this.loadTileset(path);
	}

	Game.prototype.tick = function() {
		this.ctx.clearRect(0, 0, can.width, can.height);
		this.forEachTile(function(tile) {
			tile.draw();
		});
		this.drawCursor();
	}

	Game.prototype.setZoom = function(mult) {
		this.zoom = mult;
		this.tileSize = TILE_SIZE * this.zoom;
		this.tick();
	}

	return Game;
}();