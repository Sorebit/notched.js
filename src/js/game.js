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

		// Initialize map
		this.map = new Array(this.height);
		for(var y = 0; y < this.height; y++) {
			this.map[y] = new Array(this.width);
			for(var x = 0; x < this.width; x++) {
				var r = Math.random();
				var type = 0;
				if(r < 0.3)
					type = 2;
				else if(r < 0.6)
					type = 1;
				else if(r < 0.9)
					type = 3;
				this.map[y][x] = new Tile(this, x, y, type);
			}
		}
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

	Game.prototype.setup = function(path) {
		var self = this;
		// Setup tileset load handler before loading
		document.addEventListener('tilesetReady', function() {
			// Calculate neighbours
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
	}

	Game.prototype.setZoom = function(mult) {
		this.zoom = mult;
		this.tileSize = TILE_SIZE * this.zoom;
		this.tick();
	}

	return Game;
}();