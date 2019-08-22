//var sync = require('synchronize');
module.exports={ 
	checkRecordExist:function(data,callback)
	{	 
		var sql='select count(id) as count from bussiness_images where id = ?';   
		var param=[data.id];    
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
			} 
		});  
	}, 
	deleteRecord:function(data,callback)
	{	 
		
		var sql='delete from bussiness_images where id = ?';   
		var param=[data.id];    
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
			} 
		});   
	}, 
	  
}; 
