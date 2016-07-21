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
		case 0:  this.speed = 360; break;
		default: this.speed = 128;
	}
}

function Weapon(type) {
	this.type = type;
	switch(type) {
		// pistol
		case 0:  this.bulletCount = 1; this.bulletType = 0; this.range = 184; break;
		// shotgun
		case 1:  this.bulletCount = 3; this.bulletType = 0; this.range = 96; break;
		// undefined
		default: this.bulletCount = 0; this.bulletType = 0; this.range = 32;
	}	
}