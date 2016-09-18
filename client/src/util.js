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

function isNumber(i) {
	return typeof i === 'number';
}

function isInteger(num) {
	return num === (num | 0);
}

function random(minOrMax, maxOrUndefined, dontFloor) {
	dontFloor = dontFloor || false;

	var min = this.isNumber(maxOrUndefined) ? minOrMax: 0;
	var max = this.isNumber(maxOrUndefined) ? maxOrUndefined: minOrMax;

	var range = max - min;

	var result = Math.random() * range + min;

	if (this.isInteger(min) && this.isInteger(max) && ! dontFloor) {
		return Math.floor(result);
	} else {
		return result;
	}
}

function random11() {
	return this.random(-1, 1, true);
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


// Normalize vector for it's length to be [0, 1]
function normalize(vector) {
	var length = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
	if(length === 0)
		return;
	vector.x /= length;
	vector.y /= length;
	return vector;
}

// Convert angle in degrees to radians
function toRad(angle) {
	return angle * Math.PI / 180;
}

function toDegrees(angle) {
	return angle * 180 / Math.PI;
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

function crossProduct(a, b) {
    return a.x * b.y - a.x * b.y;
}

// Convert a radian angle to normalised vector
function radToVector(angle) {
	var vec = {
		x: Math.cos(angle),
		y: -Math.sin(angle),
	};
	return normalize(vec);
}

function randomVector(angle, angVar) {
	angle += random11() * toRad(angVar);
	return radToVector(angle);
}

// function linesIntersect(aStart, aEnd, bStart, bEnd) {
//     var aDelta = subtractVectors(aEnd, aStart), bDelta = subtractVectors(bEnd, bStart);
//     var aStartToBStart = subtractVectors(bStart, aStart);
//     var t = crossProduct(aStartToBStart, bDelta) / crossProduct(aDelta, bDelta);
//     var u = crossProduct(aStartToBStart, aDelta) / crossProduct(aDelta, bDelta)
;//     return 0 < t && t < 1 && 0 < u && u < 1;
// }

function getIntersectingWalls(proposedPosition) {
    var playerPolygon = getSquare(proposedPosition, PLAYER_SIZE);
    var intersectingWalls = [];
    for (var i = 0; i < walls.length; i += 1) {
        if (polygonsIntersect(playerPolygon, walls[i])) {
            intersectingWalls.push(walls[i]);
        }
    }
    return intersectingWalls;
}

function polygonsIntersect(a, b) {
    var n = a.length, m = b.length;
    for (var i = 0; i < n; i += 1) {
        for (var j = 0; j < m; j += 1) {
            if (linesIntersect(a[i].x, a[i].y, b[j].x, b[j + 1].y)) {
                return true;
            }
        }
    }
    return false;
}