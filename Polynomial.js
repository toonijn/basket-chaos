Array.prototype.last = function() {
	return this[this.length-1];
};

Array.prototype.reverse = function() {
	let r = [];
	for(let i = this.length; --i >= 0;)
		r.push(this[i]);
	return r;
};

Math.square = (x) => x*x;


let Polynomial = class {
	constructor(coefs) {
		this.coefs = [].concat(coefs);
		while(this.coefs.length > 0 && Math.abs(this.coefs.last()) < eps)
			this.coefs.pop();
		this.degree = this.coefs.length-1;
	}

	coef(i) {
		if(i >= this.coefs.length)
			return 0;
		return this.coefs[i];
	}

	get(t) {
		let v = 0;
		for(let i = this.degree; i >= 0; --i)
			v = v*t + this.coefs[i];
		return v;
	}

	roots() {
		let a,b,c,d,e,D;
		switch(this.degree) {
		case -1:
		case 0:
			return [];
		case 1:
			return [-this.coefs[0]/this.coefs[1]];
		case 2:
			[c, b, a] = this.coefs;
			D = b*b - 4 * a * c;
			if(Math.abs(D) < eps)
				return [-b/(2*a)];
			if(D < 0)
				return [];
			let sD = Math.sqrt(D);
			if(a < 0)
				sD = -sD;
			return [(-b-sD)/(2*a), (-b+sD)/(2*a)];
		case 4:
			// https://en.wikipedia.org/wiki/Quartic_function#General_formula_for_roots
			return quartic(this.coefs.reverse()).filter(({im}) => Math.abs(im) < eps).map(({re}) => re);
		default:
			throw new Error('.roots() is not implemented for degree '+this.degree);
		}
	}

	diff() {
		let p = [];
		for(let i = 1; i <= this.degree; ++i)
			p.push(i*this.coefs[i]);
		return new Polynomial(p);
	}

	add(that) {
		let p = [];
		let m = Math.max(this.degree, that.degree);
		for(let i = 0; i <= m; ++i)
			p.push(this.coef(i)+that.coef(i));
		return new Polynomial(p);
	}

	subtract(that) {
		let p = [];
		let m = Math.max(this.degree, that.degree);
		for(let i = 0; i <= m; ++i)
			p.push(this.coef(i) - that.coef(i));
		return new Polynomial(p);
	}

	multiply(that) {
		let p = [];
		let m = this.degree + that.degree;
		for(let i = 0; i <= m; ++i)
			p.push(0);

		for(let i = 0; i <= this.degree; ++i) {
			for(let j = 0; j <= that.degree; ++j)
				p[i+j] += this.coef(i)*that.coef(j);
		}
		return new Polynomial(p);
	}

	square() {
		return this.multiply(this);
	}
}