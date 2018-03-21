let SceneObject = class {
	firstHit(t) {
		return Infinity;
	}

	bounce(ball, t) {
		return null;
	}
}

let Circle = class extends SceneObject {
	constructor(x, y, r) {
		super();
		this.x = x;
		this.y = y;
		this.r = r;
	}

	firstHit(t) {
		let x = [].concat(t.x.coefs);
		x[0] -= this.x;
		let y = [].concat(t.y.coefs);
		y[0] -= this.y;

		let d = new Polynomial(x).square().add(new Polynomial(y).square());
		d.coefs[0] -= Math.square(t.r + this.r);
		return Math.min(...(d.roots().filter((r) => r > eps)));
	}

	draw(context) {
		context.beginPath();
		context.arc(this.x,this.y,this.r,0,2*Math.PI);
		context.stroke();
	}

	bounce(ball, t) {
		let r = ball.r;
		let [x, y] = ball.position(t);
		let [vx, vy] = ball.speed(t);

		let nx = x - this.x, ny = y - this.y;
		let nn = Math.hypot(nx, ny);
		nx /= nn; ny /= nn;

		let vn = vx*nx + vy*ny;

		return new BallTrajectory(r, x, y, vx - 2*vn*nx, vy - 2*vn*ny);
	}
}

let Wall = class extends SceneObject {
	constructor(x, ymin, ymax) {
		super();
		this.x = x;
		this.ymin = ymin;
		this.ymax = ymax;
	}

	firstHit(t) {
		let tmin = Math.min(
			...t.x.subtract(new Polynomial([this.x-t.r])).roots().concat(
				t.x.subtract(new Polynomial([this.x+t.r])).roots()).filter(r=>r>eps));
		let y = t.y.get(tmin);
		if(tmin < eps || y < this.ymin + eps || y > this.ymax + eps)
			return Infinity;
		return tmin;
	}

	draw(context) {
		context.beginPath();
		context.moveTo(this.x,this.ymin);
		context.lineTo(this.x,this.ymax);
		context.stroke();
	}

	bounce(ball, t) {
		let r = ball.r;
		let [x, y] = ball.position(t);
		let [vx, vy] = ball.speed(t);

		return new BallTrajectory(r, x, y, -vx, vy);
	}
};

let Goal = class extends SceneObject {
	constructor(y, xmin, xmax) {
		super();
		this.y = y;
		this.xmin = xmin;
		this.xmax = xmax;
	}

	firstHit(ball) {
		return Math.min(...ball.y.subtract(new Polynomial([this.y])).roots()
			.filter(r => r > eps)
			.filter(t => {
				let x = ball.x.get(t);
				return x > this.xmin-eps && x < this.xmax + eps;
			})
			.filter(t => ball.vy.get(t) < 0));
	}

	draw(context) {
		let stroke = context.strokeStyle;
		context.strokeStyle = "green";
		context.beginPath();
		context.moveTo(this.xmin,this.y);
		context.lineTo(this.xmax,this.y);
		context.stroke();
		context.strokeStyle = stroke;
	}
};

let Floor = class extends SceneObject {
	constructor(y, xmin, xmax) {
		super();
		this.y = y;
		this.xmin = xmin;
		this.xmax = xmax;
	}

	firstHit(t) {
		let tmin = Math.min(...t.y.subtract(new Polynomial([this.y])).roots().filter(r => r > eps));
		let x = t.x.get(tmin);
		if(tmin < eps || x < this.xmin + eps || x > this.xmax + eps)
			return Infinity;
		return tmin;
	}

	bounce(ball, t) {
		let r = ball.r;
		let [x, y] = ball.position(t);
		let [vx, vy] = ball.speed(t);

		return new BallTrajectory(r, x, y, vx, -vy);
	}

	draw(context) {
		context.beginPath();
		context.moveTo(this.xmin,this.y);
		context.lineTo(this.xmax,this.y);
		context.stroke();
	}
};

let BallTrajectory = class {
	constructor(r, x, y, vx, vy) {
		this.r = r;
		this.x = new Polynomial([x, vx]);
		this.y = new Polynomial([y, vy, -g/2]);
		this.vx = this.x.diff();
		this.vy = this.y.diff();
	}

	position(t) {
		return [this.x.get(t), this.y.get(t)];
	}

	speed(t) {
		return [this.vx.get(t), this.vy.get(t)];
	}

	draw(context, tEnd) {
		context.strokeStyle = "orange";
		context.lineWidth = 2*this.r;
		context.beginPath();
		context.moveTo(...this.position(0));
		for(let t = .1; t < tEnd; t += .05)
			context.lineTo(...this.position(t));
		context.lineTo(...this.position(tEnd));
		context.stroke();
	}
}

let Scene = class {
	constructor(objects) {
		this.objects = objects;
	}

	nextBounce(trajectory) {
		let t = Infinity;
		let object = null;
		this.objects.forEach(o => {
			let s = o.firstHit(trajectory);
			if(s < t) {
				t = s;
				object = o;
			}
		});

		return [t, object];
	}

	nextTrajectory(trajectory) {
	}

	draw(context) {
		context.strokeStyle = "#666";
		context.lineWidth = .1;
		this.objects.forEach(o => o.draw(context));
	}
}
