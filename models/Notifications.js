//var sync = require('synchronize');
/** 
 *  saveData
 *  Purpose: This function is used to saveData
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json 
*/
async function saveData(data) { 
	try { 
		if(data){   
			var sql='INSERT INTO notifications set ? ';
			return new Promise((resolve,reject)=>{
				connectPool.query(sql,data, (err, result) => {
					if (err) { 
						console.log(err);
						reject(err)
					} else { 
						resolve(result)
					}
				})
			}) 
		}else{ 
			return null;
		}
	} finally {
		//if (connectPool && connectPool.end) connectPool.end();
	}  
}

module.exports={
	saveData,
	getData:function(data,callback)
	{	
		let LIMIT = '';
		var sql='select notifications.*, projects.title  from notifications LEFT JOIN projects ON (projects.id = notifications.project_id) where notifications.receiver_id = ? order by id DESC';
		if(data.limit){
			sql +=  ' LIMIT '+data.limit;
		}
		if(data.offset){
			LIMIT =  ' OFFSET '+data.offset;  
			sql += LIMIT;  
		}   
		var param=[data.user_id];    
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
	saveNotificationData:function(data,callback)
	{	
		var sql='INSERT INTO notifications set ? ';  
		connectPool.query(sql,data,function(error,result){
			if (error) { 
				console.log(error); 
				callback(false); 
			} else {	 
				if(result.length==0 || result==null){
					callback(false);
				}else{
					callback(result);
				}  
			}   
		});   
	},   
	getDataCount:function(data,callback)
	{	 
		var sql='select count(id) as count from notifications where receiver_id = ?'; 
		var param=[data.user_id];     
		connectPool.query(sql,param,function(error,result){
			if (error) { 
				console.log(error); 
				callback(null);
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
