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

        var buffer="";//Buffer to pass to next walk function.

        var primitiveBuffer = "";

        var starters= ['"',"'",'{','['];
        var enders= ['"',"'",'}',']'];
        var escapable= ['"',"'",'}',']','\\'];


        var starter = undefined;
        var ender = "";

        var depth = 0;
        //console.log("walking "+ inside);

        var parentType = undefined;
        var parent = undefined;

        if(wrapper==="'"||wrapper==='"'){
            //console.log("wrapped in [ ");
            parentType="string";
            parent ="";
            return parseKeyword(inside);
        }

        if(wrapper==="{"){
            //console.log("wrapped in { ");
            parent = {};
            parentType="object";
        }

        if(wrapper==="["){
            //console.log("wrapped in [ ");
            parent = [];
            parentType="array";
        }
        var leftTemp="";
        var readingLeft=true;
        var lastParse="";
        var escape = 0;
        var escapedBuffer = "";
        //console.log("The length is" +inside.length);
        for(var i = 0; i<inside.length;i++){
            var c = inside[i];
            var didEscape = false;
            if(escape){
                if(escapable.indexOf(c)!=-1){
                    escape=0;
                }else{
                    throw new SyntaxError("Unexpected tokena "+c);
                }
                console.log("adding escaped c to buffer "+c);
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
                //console.log("found starter in "+starter);
                continue;
            }

            if(c=='\\'&&!escape&&!didEscape){
                escape=true;
                console.log("Depth was "+depth);
            }

            if(c!==","&&c!==":"&&depth==0&&c!==" "&&c!=="\\"&&c!=="\r"&&c!=="\t"&&c!=="\n"){ //if its not a start character nor any legal symbol
                //we should buffer for primitives.
                console.log("started primitive parsing with "+c);
                primitiveBuffer+=c;
            }


            var matched=false;
            if(c===ender&&!matched&&!escape){
                depth--;
                //console.log("ender in "+ender);

                matched=true;
                if(depth==0){
                    //Expect :,{[]) or space

                }
            }
            if(c===starter&&!matched&&!escape){
                //console.log("starter in "+starter);

                depth++;
                matched=true;
            }


            if(depth==0){

                if(c==="]"||c==="}"){
                    //console.log("Yes2, parenttype "+parentType);
                    //console.log("Yes2, starter "+starter);
                    //console.log("Yes2, buffer "+buffer);

                    if(starter!=undefined){
                        //console.log("Starter2 not undefined");
                        if(starter==="["||starter==="{"){
                            //console.log("starter2 needs a walk");

                            var temp = walk(buffer,starter);

                            if(readingLeft){
                                //console.log("finished parsing left Object in parent "+parentType);
                                leftTemp = temp;
                                if(parentType==="array"){
                                    //console.log("Will push to array");
                                    parent.push(temp);
                                }else if(parentType==="object"){
                                    //console.log("WE SHOULDNT SEE OBJECTS ON THE LEFT SIDE");
                                }else if (parentType===undefined){
                                    //console.log("No parent so returning object");
                                    //console.log(temp);
                                    return temp;
                                }
                            }else{
                                //console.log("finished parsing right object");
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
                        //console.log("Found :, switching to right");
                        readingLeft=false;
                    }else{
                        throw SyntaxError("Unexpected :");
                    }
                }
                if(c===","||i==inside.length-1){
                    if(primitiveBuffer!==""){
                        if(readingLeft){
                            // console.log("finished reading primitive on left side");
                            if(parentType==="object"){
                                // console.log("This is not allowed for objects..");
                                throw new SyntaxError("Unexpected token nn");
                            }else if(parentType==="array"){
                                parent.push(parseKeyword(primitiveBuffer));
                                primitiveBuffer="";
                            }
                        }else{
                            if(parentType==="object"){
                                // console.log("finished reading primitive on right side");
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
