SquareProgress = function(n, t) {
	this.canvas = n;
	this.context = this.canvas.getContext("2d");
	this.pct = t;
	this.x = 0;
	this.y = 0;
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.innerWidth = Math.floor(this.width * .8);
	this.innerHeight = Math.floor(this.height * .8);
	this.innerX = (this.width - this.innerWidth) / 2;
	this.innerY = (this.height - this.innerHeight) / 2;
	this.backgroundColor = "rgba(255,255,255,0.1)";
	this.fillColor = "rgba(255,255,255,1)";
	this.borderColor = "rgba(255,255,255,1)";
	this.centerInner = !0;
	this.duration = 1e3;
	this.animationStart = null;
	this.ease = function(n) {
		return n < .5 ? 4 * n * n * n : (n - 1) * (2 * n - 2) * (2 * n - 2) + 1
	}
};
SquareProgress.prototype.init = function() {
	this.centerInner && this.centerInnerRect();
	this.setCornerCoords();
	this.reset();
	this.animationStart = this.getTime()
};
SquareProgress.prototype.draw = function() {
	this.init();
	this.drawToPct(this.pct)
};
SquareProgress.prototype.getTime = function() {
	return window.performance != undefined ? window.performance.now() : Date.now()
};
SquareProgress.prototype.animate = function() {
	var i = this,
		r = window.performance != undefined ? window.performance.now() : Date.now(),
		u = r - this.animationStart,
		n = this.ease(u / this.duration),
		t;
	if (n >= 1) {
		this.drawToPct(this.pct);
		return
	}
	t = n * this.pct;
	this.drawToPct(t);
	requestAnimationFrame(function() {
		i.animate()
	})
};
SquareProgress.prototype.centerInnerRect = function() {
	this.innerX = (this.width - this.innerWidth) / 2 + this.x;
	this.innerY = (this.height - this.innerHeight) / 2 + this.y
};
SquareProgress.prototype.getOuterPointFromPct = function(n) {
	for (var t = this.width, u = this.height, c = this.x, l = this.y, s = (t + u) * 2, f = s * n, e = [t, t + u, t * 2 + u, s], h = -1, o = 0, i, r; f > h && o < 4;) h = e[o], o++;
	i = -1;
	r = -1;
	switch (o) {
		case 1:
			i = f;
			r = 0;
			break;
		case 2:
			i = t;
			r = f - e[0];
			break;
		case 3:
			i = t - (f - e[1]);
			r = u;
			break;
		case 4:
			i = 0;
			r = u - (f - e[2])
	}
	return {
		x: c + i,
		y: l + r
	}
};
SquareProgress.prototype.limitPtToInner = function(n) {
	var u = this.innerWidth,
		f = this.innerHeight,
		i = this.innerX,
		r = this.innerY,
		t = {
			x: n.x,
			y: n.y
		};
	return n.x <= i ? t.x = i : n.x >= i + u && (t.x = i + u), n.y <= r ? t.y = r : n.y >= r + f && (t.y = r + f), t
};
SquareProgress.prototype.setCornerCoords = function() {
	var n = this.x,
		t = this.y,
		u = this.width,
		f = this.height,
		i = this.innerX,
		r = this.innerY,
		e = this.innerWidth,
		o = this.innerHeight;
	this.cornersOuter = [
		[n, t],
		[u + n, t],
		[u + n, f + t],
		[n, f + t]
	];
	this.cornersInner = [
		[i, r],
		[e + i, r],
		[e + i, o + r],
		[i, o + r]
	]
};
SquareProgress.prototype.getCoordsForSide = function(n) {
	var t = this.cornersOuter,
		i = this.cornersInner,
		r;
	switch (n) {
		case 1:
			r = [i[0], t[0], t[1], i[1], ];
			break;
		case 2:
			r = [i[1], t[1], t[2], i[2]];
			break;
		case 3:
			r = [i[2], t[2], t[3], i[3]];
			break;
		case 4:
			r = [i[3], t[3], t[0], i[0]]
	}
	return r
};
SquareProgress.prototype.drawSide = function(n, t) {
	var i = this.context;
	if (typeof n == "undefined") return !1;
	i.lineWidth = 1;
	i.beginPath();
	i.moveTo(n[0][0], n[0][1]);
	i.lineTo(n[1][0], n[1][1]);
	i.lineTo(n[2][0], n[2][1]);
	i.lineTo(n[3][0], n[3][1]);
	i.closePath();
	i.strokeStyle = this.borderColor;
	i.stroke();
	i.fillStyle = t;
	i.fill()
};
SquareProgress.prototype.drawPartialSide = function(n) {
	if (n <= 0) return !1;
	var u = Math.ceil(n * 4),
		f = n % .25,
		t = this.getCoordsForSide(u),
		i = this.getOuterPointFromPct(n),
		r = this.limitPtToInner(i);
	typeof t != "undefined" && (t[2] = [i.x, i.y], t[3] = [r.x, r.y]);
	this.drawSide(t, this.fillColor)
};
SquareProgress.prototype.drawToPct = function(n) {
	for (var t = Math.ceil(n * 4) - 1, i, r; t > 0;) i = t--, r = this.getCoordsForSide(i), this.drawSide(r, this.fillColor);
	this.drawPartialSide(n)
};
SquareProgress.prototype.reset = function() {
	var n = this.context,
		i = this.canvas,
		t, r;
	for (n.clearRect(0, 0, i.width, i.height), n.lineWidth = 1, n.rect(this.x, this.y, this.width, this.height), n.rect(this.innerX, this.innerY, this.innerWidth, this.innerHeight), n.strokeStyle = this.borderColor, n.stroke(), t = 1; t < 5; t++) r = this.getCoordsForSide(t), this.drawSide(r, this.backgroundColor)
};