var pts;

function main() {
	fullscreenCanvas();

	mainRegion.background = '#000000';

	// change these to choose different shapes
	pts = getEqual();
	// pts = getIsosceles();
	// pts = getRandom();
	
	draw();
}

function draw() {
	fillBackground();

	// drawTriangle(pts, 10);
	// drawTrianglePoint(copyPts(pts), {x: mouseX, y: mouseY}, 100);
	var tempPoints = orderPts(fitPts(copyPts(pts)));

	lineWidth(1);
	stroke('#FFFFFF');
	drawTriangleDist(tempPoints, 10);

	lineWidth(5);
	stroke('#FF0000');
	drawTrianglePointDist(tempPoints, {x: mouseX, y: mouseY}, 5);
}

function mouseMoved() {
	draw();
}

function resize() {
	draw();
}

function getEqual() {
	var pts = [];
	var mx = width/2;
	var my = height/2;

	var s = Math.min(width, height);
	s *= 1/2;

	my += s*(Math.sqrt(3)/2 - 1/Math.sqrt(3));

	var dAng = Math.PI * 2 / 3;
	var Ang0 = -Math.PI/2;
	for (var i = 0; i < 3; i++) {
		pts[i] = {
			x: mx + s * Math.cos(Ang0 + i * dAng),
			y: my + s * Math.sin(Ang0 + i * dAng)
		};
	}

	return pts;
}

function getIsosceles() {
	var mx = width/2;
	var my = height/2;

	var s = Math.min(width/2, height);
	s *= 0.9;

	pts = [
		{
			x: mx,
			y: my - s/2
		},
		{
			x: mx - s,
			y: my + s/2
		},
		{
			x: mx + s,
			y: my + s/2
		}
	];

	return pts;
}

function getRandom() {
	var pts = [];

	for (var i = 0; i < 3; i++) {
		var ang = 2*Math.PI * Math.random();
		var r = Math.sqrt(Math.random());
		pts[i] = {
			x: r * Math.cos(ang),
			y: r * Math.sin(ang)
		};
	}

	return pts;
}

function fitPts(pts) {
	var bounds = getRange(pts);
	var w = bounds.maxX - bounds.minX;
	var h = bounds.maxY - bounds.minY;

	var s;
	if (h * width > w * height) {
		// height is the bound
		s = height / h;
	} else {
		// width is the bound
		s = width / w;
	}

	s *= 0.85;

	// translate so center is centered
	var tx = (bounds.minX + bounds.maxX) / 2;
	var ty = (bounds.minY + bounds.maxY) / 2;

	// scale points
	for (var p of pts) {
		p.x = s * (p.x - tx) + width/2;
		p.y = s * (p.y - ty) + height/2;
	}

	return pts;
}

function orderPts(pts) {
	var minI = 0;
	var minV = undefined;

	for (var i = 0; i < pts.length; i++) {
		var v = cos_ang(pts[i], pts[((i+1)%3+3)%3], pts[((i-1)%3+3)%3])
		if (minV === undefined || v < minV) {
			minV = v;
			minI = i
		}
	}

	var temp = pts[minI];
	pts[minI] = pts[0];
	pts[0] = temp;

	return pts;
}

function cos_ang(p0, p1, p2) {
	// returns the cosine of the angle at p0 between p1 and p2
	var v1 = {
		x: p1.x - p0.x,
		y: p1.y - p0.y
	};

	var v2 = {
		x: p2.x - p0.x,
		y: p2.y - p0.y
	};

	var mv1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
	var mv2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

	return (v1.x * v2.x + v1.y * v2.y) / mv1 / mv2;
}

function copyPts(pts) {
	var res = [];

	for (var p of pts) {
		res.push({
			x: p.x,
			y: p.y
		});
	}

	return res;
}

function getRange(pts) {
	var res = {};

	for (var p of pts) {
		if (res.minX === undefined || p.x < res.minX) {
			res.minX = p.x;
		}
		if (res.minY === undefined || p.y < res.minY) {
			res.minY = p.y;
		}
		if (res.maxX === undefined || p.x > res.maxX) {
			res.maxX = p.x;
		}
		if (res.maxY === undefined || p.y > res.maxY) {
			res.maxY = p.y;
		}
	}

	return res;
}

function drawTriangle(pts, depth) {
	var lines = [
		[0, 1],
		[1, 2],
		[2, 0]
	];
	var stack = [ [0, 1, 2] ];
	for (var i = 0; i < depth; i++) {
		var newStack = [];

		for (var j = 0; j < stack.length; j++) {
			var tri = stack[j];
			var newPt = getDivPoint(tri, pts);
			newPtI = pts.length;
			
			pts.push(newPt);

			newStack.push([newPtI, tri[0], tri[1]]);
			newStack.push([newPtI, tri[0], tri[2]]);

			lines.push([tri[0], newPtI]);
		}

		stack = newStack;
	}
	// drawPts(pts);
	drawLines(pts, lines);
}

function drawTriangleDist(pts, dist) {
	var lines = [
		[0, 1],
		[1, 2],
		[2, 0]
	];
	var stack = [ [0, 1, 2] ];
	while (stack.length > 0) {
		var tri = stack.pop();
		var newPt = getDivPoint(tri, pts);
		newPtI = pts.length;
		
		pts.push(newPt);

		if (getDist(pts, tri[0], newPtI) > dist) {
			stack.push([newPtI, tri[0], tri[1]]);
			stack.push([newPtI, tri[0], tri[2]]);
		}

		lines.push([tri[0], newPtI]);
	}
	// drawPts(pts);
	drawLines(pts, lines);
}

function drawTrianglePointDist(pts, p, dist) {
	var lines = [];
	var stack = [ [0, 1, 2] ];
	while (stack.length > 0) {
		var tri = stack.pop();;
		var newPt = getDivPoint(tri, pts);
		newPtI = pts.length;
		
		pts.push(newPt);

		var tri1 = [newPtI, tri[0], tri[1]];
		var tri2 = [newPtI, tri[0], tri[2]];

		var p1 = getDivPoint(tri1, pts);
		var p2 = getDivPoint(tri2, pts);

		var sg = getSign(pts[tri[0]], newPt, p);
		var s1 = getSign(pts[tri[0]], newPt, p1);
		var s2 = getSign(pts[tri[0]], newPt, p2);

		if (getDist(pts, tri[0], newPtI) > dist) {
			if (sg * s1 > 0) {
				stack.push(tri1);
			} else {
				stack.push(tri2);
			}
		}
		lines.push([tri[0], newPtI]);
	}
	// drawPts(pts);
	drawLines(pts, lines);
}

function drawTrianglePoint(pts, p, depth) {
	var lines = [
		[0, 1],
		[1, 2],
		[2, 0]
	];
	var stack = [ [0, 1, 2] ];
	for (var i = 0; i < depth; i++) {
		var newStack = [];

		for (var j = 0; j < stack.length; j++) {
			var tri = stack[j];
			var newPt = getDivPoint(tri, pts);
			newPtI = pts.length;
			
			pts.push(newPt);

			var tri1 = [newPtI, tri[0], tri[1]];
			var tri2 = [newPtI, tri[0], tri[2]];

			var p1 = getDivPoint(tri1, pts);
			var p2 = getDivPoint(tri2, pts);

			var sg = getSign(pts[tri[0]], newPt, p);
			var s1 = getSign(pts[tri[0]], newPt, p1);
			var s2 = getSign(pts[tri[0]], newPt, p2);

			if (sg * s1 > 0) {
				newStack.push(tri1);
			} else {
				newStack.push(tri2);
			}

			lines.push([tri[0], newPtI]);
		}

		stack = newStack;
	}
	// drawPts(pts);
	drawLines(pts, lines);
}

function getSign(p0, p1, p2) {
	// gets the sign of the point p2 relative to the line defined by p0 and p1
	// all points are {x, y}

	var dx = p1.x - p0.x;
	var dy = p1.y - p0.y;

	return (p2.y - p0.y) * dx - (p2.x - p0.x) * dy;
}

function getPDist(p0, p1) {
	var dx = p0.x - p1.x;
	var dy = p0.y - p1.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function getDist(pts, p0, p1) {
	var dx = pts[p0].x - pts[p1].x;
	var dy = pts[p0].y - pts[p1].y;
	return Math.sqrt(dx*dx + dy*dy);
}

function drawLines(pts, lines) {
	for (l of lines) {
		line(pts[l[0]].x, pts[l[0]].y, pts[l[1]].x, pts[l[1]].y);
	}
}

function drawPts(pts) {
	var w = 10;
	fill('#FFFFFF');

	for (var p of pts) {
		rect(p.x - w/2, p.y - w/2, w, w);
	}
}

function getDivPoint(tri, pts) {
	var x0 = pts[tri[0]].x;
	var y0 = pts[tri[0]].y;

	var x1 = pts[tri[1]].x;
	var y1 = pts[tri[1]].y;

	var dx = pts[tri[2]].x - pts[tri[1]].x;
	var dy = pts[tri[2]].y - pts[tri[1]].y;

	return {
		x: (dx*dx*x0 + dy*dy*x1 + dx*dy*(y0-y1))/(dx*dx + dy*dy),
		y: y0 + dx*(dy*(x0-x1) + dx*(y1-y0))/(dx*dx + dy*dy)
	};
}