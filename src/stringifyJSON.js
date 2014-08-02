// this is what you would do if you liked things to be easy:
// var stringifyJSON = JSON.stringify;

// but you don't so you're going to write it from scratch:
var stringifyJSON = function(obj) {
	var res = "";
	var walkObject = function(obj){
		var res = "{";
		var first=true;
		for(var prop in obj){
			if(!first){res+=",";}
			var property = walk(prop);
			var value = walk(obj[prop]);
			if(!property||!value){
				continue;
			}
			res=res+property;
			res=res+":"+value;
			first=false;
		}
		return res+"}";
	};
	var walkArray = function(array){
		var res = "[";
		var first=true;
		for(var i = 0; i<array.length; i++){
			if(!first){res+=",";}
			var value = walk(array[i]);
			if(!value){
				continue;
			}
			res=res+value;
			first=false;
		}
		return res+"]";
	}
	var walk = function(obj){
		if(Array.isArray(obj)){
			return walkArray(obj);
		}else if(typeof obj === "object"&& obj !== null){
			return walkObject(obj);
		}else if(typeof obj === "string"){
			return '"'+obj+'"';
		}else if(obj === null){
			return "null";
		}else if(obj === undefined||typeof obj === "function"){
			return false;
		}else{
			return obj.toString();
		}
	}
	return walk(obj);
};
