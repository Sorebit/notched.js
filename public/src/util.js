// Pop element from arr at index 
function popElement(arr, index) {
	if(arr == undefined || arr.length <= 0)
		return;
	if(index < 0 || index >= arr.length)
		return;
	var temp = arr.slice(index + 1, arr.length);
	arr = arr.slice(0, index);
	for(var i = 0; i < temp.length; ++i){
		arr.push(temp[i]);
	}
	return arr;
}

// Check for line intersection
function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
	// if the lines intersect, the result contains the x and y 
	// of the intersection (treating the lines as infinite) 
	// and booleans for whether line segment 1 or line segment 2 contain the point
	
	var denominator, a, b, numerator1, numerator2, result = {
		x: null,
		y: null,
		onLine1: false,
		onLine2: false,
		collinear: false
	};
	denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
	if (denominator == 0) {
		return result;
	}
	a = y1 - y3;
	b = x1 - x3;
	numerator1 = ((x4 - x3) * a) - ((y4 - y3) * b);
	numerator2 = ((x2 - x1) * a) - ((y2 - y1) * b);
	a = numerator1 / denominator;
	b = numerator2 / denominator;

	// if we cast these lines infinitely in both directions, they intersect here:
	result.x = x1 + (a * (x2 - x1));
	result.y = y1 + (a * (y2 - y1));
	/*
	// it is worth noting that this should be the same as:
	x = x3 + (b * (x4 - x3));
	y = x3 + (b * (y4 - y3));
	*/
	// if line1 is a segment and line2 is infinite, they intersect if:
	if (a > 0 && a < 1) {
		result.onLine1 = true;
	}
	// if line2 is a segment and line1 is infinite, they intersect if:
	if (b > 0 && b < 1) {
		result.onLine2 = true;
	}
	// if line1 and line2 are segments, they intersect if both of the above are true
	return result;
};

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

// Normalize vector for it's length to be [0, 1]
function normalize(vector) {
	var length = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
	if(length === 0)
		return;
	vector.x /= length;
	vector.y /= length;
}

// Convert angle in degrees to radians
function toRad(angle) {
	return (angle*Math.PI) / 180;
}

// Clamp value beetween min and max
function clamp(a, min, max) {
	return Math.max(Math.min(a, max), min);
}

function addVectors(v1, v2) {
	return {x: v1.x + v2.x, y: v1.y + v2.y};
}

function subtractVectors(v1, v2) {
	return {x: v1.x - v2.x, y: v1.y - v2.y};
}