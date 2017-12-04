var utilsData = {
/*
    This function creates the data in the format as required by the d3 scatter plot extension. 
*/
  createData : function(dataSet, numDims, msrInfo){
    console.log("Inside d3Utils createData function");
    var dataArr = [];
    var obj = {};
    

    var msrCtr = 0;
    for(var i = 0; i < dataSet.length; i++){
	var msrValCtr = 2;
		if(obj.hasOwnProperty("dimVal")){
        if(obj["dimVal"] == dataSet[i][0].qText)
            {
                for(var j = 0; j < msrInfo.length; j++){
                    obj[dataSet[i][1].qText + "-" + msrInfo[j].qFallbackTitle] = dataSet[i][msrValCtr++].qText;
                } 
               // msrCtr = 0;
                msrValCtr = 2;
            }
		else{
				dataArr.push(obj);
				obj = {};
				var msrPrefix = dataSet[i][1].qText;
            	obj["dimVal"] = dataSet[i][0].qText;
                for(var j = 0; j < msrInfo.length; j++){
                obj[dataSet[i][1].qText + "-" + msrInfo[j].qFallbackTitle] = dataSet[i][msrValCtr++].qText;
            }
			}
		}
        else{
            obj = {};
            var msrPrefix = dataSet[i][1].qText;
            obj["dimVal"] = dataSet[i][0].qText;
                for(var j = 0; j < msrInfo.length; j++){
                obj[dataSet[i][1].qText + "-" + msrInfo[j].qFallbackTitle] = dataSet[i][msrValCtr++].qText;
            }
        }
		
		}
    return dataArr;
  },

  /*

        This function gets the max and min for a  measure.

  */

getMaxMinMeasure: function(dataSet,msrNum){
}
}