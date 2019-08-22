//var sync = require('synchronize');
module.exports={   
	saveData:function(data,callback)
	{	
		  
		var sql = "INSERT INTO `milestone_images` ( `constructor_id`, `project_id`, `project_milestone_id`, `image`) VALUES ( '"+data.constructor_id+"', '"+data.project_id+"', '"+data.project_milestone_id+"', '"+data.image+"'); ";   
		//console.log(sql);    console.log(data);     
		connectPool.query(sql, function(error,result){ 
			if (error) {  
				console.log(error); 
				callback(false); 
			}  
			else 
			{	 
				if(result.length==0 || result==null){
					callback(false);
				}else{
					callback(result);
				} 
				//callback(result);
			} 
		});  
	}, 
	getMilestoneImages:function(data,callback)
	{	 
		
		var sql='select * from milestone_images where project_id = ? ';   
		var param=data.project_id;        
		connectPool.query(sql,param,function(error,result){
			if (error) {   
				console.log(error);
				callback(false);
			}  
			else
			{	 
				if(result.length==0 || result==null){
					callback(false);
				}else{
					callback(result);
				} 
				//callback(result);
			} 
		});  
	},  
	  
}; 
