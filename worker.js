importScripts("quartic.js", "Polynomial.js", "Scene.js", "setup.js");


let taskIndex = 0;

let outerLoop = (i, cb, done, brk) => {
	if(--i >= 0)
		setTimeout(() => {
			if(cb(i))
				outerLoop(i, cb, done, brk);
			else
				brk();
		}, 0);
	else
		done();
}

onmessage = function (e) {
	let task = ++taskIndex;

	let [xmin, xmax, ymin, ymax, width, height] = e.data;
	let r,g,b,a;
	let image = new Uint8ClampedArray(width*height*4);
	let k = 0;

	let w = (xmax - xmin)/(width-1);
	let h = (ymax - ymin)/(height-1);
	outerLoop(height, (i) => {
		for(let j = 0; j < width; ++j) {
			[r,g,b,a] = pixelColor(xmin + w*j, ymin + h*i);
			image[k++] = r;
			image[k++] = g;
			image[k++] = b;
			image[k++] = a;
		}
		return task == taskIndex;
	}, () => {
		postMessage(image);
	}, () => {});
}