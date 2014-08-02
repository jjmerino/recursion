// this is what you would do if you were one to do things the easy way:
// var parseJSON = JSON.parse;

// but you're not, so you'll write it from scratch:

var parseJSON = function(json){

    //parses js keywords
    var parseKeyword = function(text){
        switch(text.toLowerCase()){
            case "null":
                return null;
            case "undefined":
                return undefined;
            case "true":
                return true;
            case "false":
                return false;
            default:
                if(!isNaN(text)){
                    return +text;
                }else{
                    throw new SyntaxError("Unknown syntax"+text)
                }
        }
    };

    //recursivelly calls itself to walk into object structures
    var walk = function(text,wrapper){
        var inside = text.trim();

        var buffer=""; //Buffer to iterate into and avoid
        var primitiveBuffer = "";
        var escapedBuffer = "";// Buffer escaped to be saved into
        var starters= ['"',"'",'{','['];
        var enders= ['"',"'",'}',']'];
        var escapable= ['"',"'",'}',']','\\'];
        var starter = undefined;
        var ender = "";
        var depth = 0;
        var parentType = undefined;
        var parent = undefined;

        if(wrapper==="'"||wrapper==='"'){
            parentType="string";
            parent ="";
            return parseKeyword(inside);
        }

        if(wrapper==="{"){
            parent = {};
            parentType="object";
        }

        if(wrapper==="["){
            parent = [];
            parentType="array";
        }
        var leftTemp="";
        var readingLeft=true;
        var escape = 0;
        for(var i = 0; i<inside.length;i++){
            var c = inside[i];
            var didEscape = false;
            if(escape){
                if(escapable.indexOf(c)!=-1){
                    escape=0;
                }else{
                    throw new SyntaxError("Unexpected tokena "+c);
                }
                buffer+=c;
                escapedBuffer+=c;
                continue;
            }
            if(starters.indexOf(c) != -1&&depth==0&&!escape){ //If we found a start character
                if(primitiveBuffer!==""){
                    throw new SyntaxError("Unexpected tokens "+c);
                }
                depth++;
                starter = c;
                ender = enders[starters.indexOf(c)];
                continue;
            }

            if(c=='\\'&&!escape&&!didEscape){
                escape=true;
            }

            if(c!==","&&c!==":"&&depth==0&&c!==" "&&c!=="\\"&&c!=="\r"&&c!=="\t"&&c!=="\n"){ //if its not a start character nor any legal symbol
                primitiveBuffer+=c;
            }


            var matched=false;
            if(c===ender&&!matched&&!escape){
                depth--;
                matched=true;
            }
            if(c===starter&&!matched&&!escape){
                //console.log("starter in "+starter);

                depth++;
                matched=true;
            }


            if(depth==0){
                if(c==="]"||c==="}"){
                    if(starter!=undefined){
                        if(starter==="["||starter==="{"){

                            var temp = walk(buffer,starter);

                            if(readingLeft){
                                leftTemp = temp;

                                if(parentType==="array"){
                                    parent.push(temp);
                                }else if(parentType==="object"){
                                    //parsed an object on the left side.
                                    //TODO: should this throw an error?
                                }else if (parentType===undefined){
                                    // no parent == return as is.

                                    // ( recursive border case)
                                    return temp;
                                }
                            }else{
                                if(parentType==="object"){
                                    parent[leftTemp]=temp;
                                }
                            }
                        }
                    }
                }
                if(c==="'"||c==='"'){ //just finished reading a string
                    if(primitiveBuffer!==""){
                        throw new SyntaxError("Unexpected token "+c);
                    }
                    if(readingLeft){
                        // console.log("Finished reading left string: "+escapedBuffer);
                        leftTemp = escapedBuffer;
                        buffer="";
                        escapedBuffer="";
                        if(parentType==="array"){
                            parent.push(leftTemp);
                        }else if(parentType==="object"){

                        }
                    }else{
                        // console.log("Finished reading right string: "+escapedBuffer);
                        if(parentType==="object"){
                            parent[leftTemp]=escapedBuffer;
                        }
                    }

                }
                if(c===":"){
                    if(readingLeft){
                        if(primitiveBuffer!==""){
                            throw new SyntaxError("Unexpected token "+c);
                        }
                        readingLeft=false;
                    }else{
                        throw SyntaxError("Unexpected :");
                    }
                }
                if(c===","||i==inside.length-1){
                    if(primitiveBuffer!==""){
                        if(readingLeft){
                            if(parentType==="object"){
                                throw new SyntaxError("Unexpected token nn");
                            }else if(parentType==="array"){
                                parent.push(parseKeyword(primitiveBuffer));
                                primitiveBuffer="";
                            }
                        }else{
                            if(parentType==="object"){
                                parent[leftTemp]=parseKeyword(primitiveBuffer);
                                primitiveBuffer="";
                            }
                        }
                        primitiveBuffer="";
                    }
                }
                if(c===","){
                    readingLeft=true;

                }
                buffer="";
                escapedBuffer="";
            }else{
                buffer += c;
               if(!escape){
                   escapedBuffer+=c;
               }
            }

        }
        if(depth>0){
            throw new SyntaxError("unexpected end of input!");
        }
        return parent;
    };

    return walk(json,undefined);
};
