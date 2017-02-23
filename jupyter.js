const {execSync, exec, spawn} = require('child_process');
const {relative} = require('path');

// Return a process pid which is listening specific port
function processListening(port) {
	let pid;
	try {
		pid = execSync(`sleep 0.5 && lsof -ti TCP:${port} -s TCP:LISTEN`);
	} catch (err) {
		return null;
	}
	return String(pid);
}

// Launch jupyter daemon and returns pid
function launchJupyter(command, rootPath, port) {
	console.log('Launching Jupyter ...');
	const options = [rootPath, `--port=${port}`, '--no-browser'];
	const jupyter = spawn(command, options, {detached: true});
	return jupyter.pid;
}

// Open browser and show notebooks
function openBrowser(notebooks, rootPath, port) {
	if (notebooks.length === 0) {
		exec(`open "http://localhost:${port}"`);
	} else {
		notebooks.forEach(notebook => {
			const target = relative(rootPath, notebook);
			exec(`open "http://localhost:${port}/notebooks/${target}"`);
		});
	}
}

// Fetch or launch jupyter and returns their PID
function getJupyterProcess(command, rootPath, port) {
	// Fetch existing process
	let pid = processListening(port);

	// Launch Jupyter if not existed
	if (!pid) {
		launchJupyter(command, rootPath, port);
		console.log('Started');
	}
	while (!pid) {
		pid = processListening(port);
	}

	return pid;
}

module.exports = {
	openBrowser,
	getJupyterProcess
};
