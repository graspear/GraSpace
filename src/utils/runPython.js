const { PythonShell } = require('python-shell');

const runPythonScript = (scriptName, args = []) => {
  return new Promise((resolve, reject) => {
    PythonShell.run(scriptName, { args, scriptPath: './src/python' }, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

module.exports = runPythonScript;
