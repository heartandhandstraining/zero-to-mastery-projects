const fs = require('fs');

fs.readFile('./hello.txt', (err, data) => {
	if(err){
		console.log('error');
	}else{
		console.log('1', data.toString());
	}
})

const file = fs.readFileSync('./hello.txt');
console.log('2', file.toString());

//APPEND
// fs.appendFile('./hello.txt', ' This is so cool!', err => {
// 	if(err){
// 		console.log('error');
// 	}
// })

//WRITE
// fs.writeFile('bye.txt', 'Sad to see you go', err => {
// 	if(err){
// 		console.log('error');
// 	}
// })

//DELETE

fs.unlink('./bye.txt', err => {
	if (err){
		console.log('error');
	}
	console.log('Inception');
})