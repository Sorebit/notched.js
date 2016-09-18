function Bullet(type, origX, origY, dx, dy) {
	this.type = type;
	this.x = origX;
	this.y = origY;
	this.dx = dx;
	this.dy = dy;
	this.distanceX = 0;
	this.distanceY = 0;
	this.shouldRemove = false;
	switch(type) {
		// Normal bullet
		case 0:  this.speed = 360; this.speedVar = 0; break;
		// High spread bullet
		case 1:  this.speed = 360; this.speedVar = 50; break;
		// Slow, probably heavy bullet
		case 2:  this.speed = 150; this.speedVar = 2; break;
		// default
		default: this.speed = 128; this.speedVar = 0;
	}
	this.speed += random11() * this.speedVar;
	this.alive = true;
}

function Weapon(type) {
	this.type = type;
	switch(type) {
		// pistol
		case 0:
			this.bulletCount = 1;
			this.bulletType = 0;
			this.range = 184;
			this.rangeVar = 20;
			this.angleVar = 2;
			break;
		// shotgun
		case 1:  
			this.bulletCount = 10;
			this.bulletType = 1;
			this.range = 96;
			this.rangeVar = 20;
			this.angleVar = 15;
			break;
		// ring
		case 2:
			this.bulletCount = 150;
			this.bulletType = 2;
			this.range = 400;
			this.rangeVar = 20;
			this.angleVar = 180;
			break;
		// blocker
		case 3:
			this.bulletCount = 150;
			this.bulletType = 0;
			this.range = 200;
			this.rangeVar = 20;
			this.angleVar = 45;
			break;

		// undefined
		default: 
			this.bulletCount = 0;
			this.bulletType = 0;
			this.range = 64;
			this.rangeVar = 20;
			this.angleVar = 0;
	}
	this.range += random11() * this.rangeVar;
}