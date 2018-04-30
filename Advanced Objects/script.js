//reference type

var object1 = { value: 10 };
var object2 = object1;
var object3 = { value: 10 };


//context (NOT scope)

const object4 = {
	a: function() {
		console.log(this);
	}
}


//instatiation
class Player {
	constructor(name, type){
		console.log('player', this);
		this.name = name;
		this.type = type;
	}

	introduce() {
		console.log(`Hi I am ${this.name}, I'm a ${this.type}`);
	}
}

class Wizard extends Player {
	constructor(name, type){
		super(name, type);
		console.log('wizard', this);
	}

	play(){
		console.log(`WOOOOOO I'm a ${this.type}`);
	}
}

const wizard1 = new Wizard('Shelly', 'Healer');
const wizard2 = new Wizard('Shaun', 'Bananas in Pyjamas');