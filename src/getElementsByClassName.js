// If life was easy, we could just do things the easy way:
// var getElementsByClassName = function (className) {
//   return document.getElementsByClassName(className);
// };

// But instead we're going to implement it from scratch:
var getElementsByClassName = function(className){

	var walk = function(element){
		var found = [];

		// we first check if the current element has the class
		if(element.classList!==undefined){
			// by iterating through it's classes
			for(var i = 0; i< element.classList.length ; i++){

				// comparing
				if(element.classList[i]==className){

					// and adding
					found.push(element);
				}
			}
		}

		// we then check it's child elements
		if(element.childNodes.length>0){
			// by iterating through the childNodes property
			for(var i = 0; i< element.childNodes.length; i++){

				// , recursively calling the function on every child
				var childs = walk(element.childNodes[i]);

				// and pushing any found elements
				for(var j = 0; j<childs.length; j++){
					found.push(childs[j]);
				}
			}
		}

		// we return the found elements
		return found;
	}
	return walk(document.body);
};
