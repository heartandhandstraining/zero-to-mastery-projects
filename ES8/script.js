//String padding
//New methods we can add to strings

'Turtle'.padStart(10); //10 total spaces used including the string and remaining spaces go before string
'Turtle'.padEnd(10); //10 total spaces used including the string and remaining spaces go after string


//Trailing commas in functions, parameter lists and calls

const fun = (a,b,c,d,) => {
	console.log(a);
}

fun(1,2,3,4,); //1


//Object.values 
//Object.entries

let obj = {
	username0: 'Santa',
	username1: 'Rudolph',
	username2: 'Mr. Grinch'
}

Object.keys(obj) //Turns into array with properties and values
Object.keys(obj).forEach((key, index) => {
	console.log(key, obj[key]);
})


Object.values(obj).forEach(value => {
	console.log(value); //Santa, Rudolph, Mr. Grinch
})

Object.entries(obj).forEach(entry => {
	console.log(entry); //["username0", "Santa"], ["username1", "Rudolph"], ["username2", "Mr. Grinch"]
})

Object.entries(obj).map(value => {
	return value[1] + value[0].replace('username', '');
})