const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Echo Application - Type something and press Enter');

rl.on('line', (input) => {
  console.log(`Echo: ${input}`);
});
