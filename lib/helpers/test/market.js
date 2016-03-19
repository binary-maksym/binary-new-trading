import Props from './test';
const a = ['a','b'];
export default class Market extends Props{
	static hello(){
		console.log(super.getProps());
	}
	static [a](){
		console.log('lol');
	}
}