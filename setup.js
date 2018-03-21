
let s = 500;

let g = 9.81;
let eps = 1e-10;

let ballR = 0.11936;
let ringR0 = 0.02;
let ringD = 0.46;
let ringH = 3.05;
let throwDistance = 4.6;
let throwHeight = 2;

let goal = new Goal(ringH,throwDistance-ringD/2,throwDistance+ringD/2);

let scene = new Scene([
	new Circle(throwDistance-ringD/2,ringH,ringR0),
	new Circle(throwDistance+ringD/2,ringH,ringR0),
	new Wall(throwDistance+ringD,ringH,ringH+1),
	new Floor(0, 0, throwDistance),
	goal])
;

scene.goal = goal;

let pixelColor = (vx, vy) => {
	let bounces = followTrajectory(ballR, 0, throwHeight, vx, vy, false);
	if(bounces == Infinity)
		return [255,128,128,255];

	return [0, Math.floor(255*(1 - Math.pow(bounces/10,.7))), 0, 255]
}


let followTrajectory = (r, x, y, vx, vy, context) => {
	let bounces = -1;

	if(context) {
		context.clearRect(-20,-20,40,40);
		scene.draw(context);
	}
	let ball = new BallTrajectory(r, x, y, vx, vy);
	for(let i = 10; i > 0; --i) {
		let [t, o] = scene.nextBounce(ball);
		bounces++;

		if(context)
			ball.draw(context, Math.min(t, 10));

		if(o == scene.goal)
			return bounces;

		if(o == null)
			break;
		if(i > 1) {
			ball = o.bounce(ball, t);
			if(ball == null)
				break;
		}
	}
	return Infinity;
};