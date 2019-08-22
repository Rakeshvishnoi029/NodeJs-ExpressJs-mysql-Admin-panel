//var sync = require('synchronize');
module.exports={
	getProjects:function(data,callback)
	{	
		try{

		 
		let LIMIT = '';
		var sql='select * from projects where contractor_id = ?';
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
	}catch (error) { 
			console.log(error);   
		}   
	},    
	saveData:function(data,callback)
	{	
		 
		var sql='INSERT INTO projects set ? ';  
		var param = data;      
		connectPool.query(sql,data,function(error,result){
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
	getProjectDetail:function(data,callback)
	{	 
		var sql='select * from projects where id = ?';
		if(data.join !=- 'undefined' && data.join != null){
			if(data.join == 'customer'){
				sql='select projects.*,  users.first_name,users.last_name,users.email from projects LEFT JOIN users ON (users.id = projects.user_id)  where projects.id = ? ';   
			}else if('contractor'){
				sql='select projects.*,  users.first_name,users.last_name,users.email from projects LEFT JOIN users ON (users.id = projects.contractor_id)  where projects.id = ? ';  
			}   
		}   
		   
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
				//callback(result);
			} 
		});  
	},   
	getCutomerProjects:function(data,callback)
	{	
		let LIMIT = '';
		var sql='select * from projects where user_id = ?';
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
	getProjectCount:function(data,callback)
	{	
		 
		var sql='select count(id) as count from projects where contractor_id = ?';   
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
	getCustomerProjectCount:function(data,callback)
	{	
		 
		var sql='select count(id) as count from projects where user_id = ?';   
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
			} 
		});  
	},   
	updateData:function(updatedata,callback)
	{	  
		var sql = "UPDATE projects set ? WHERE id = ?";    
		console.log(sql);    
		connectPool.query(sql,[updatedata, updatedata.id ],function(error,result){ 
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
	updateById,
	getProjectById
}; 


/** 
 *  updateData
 *  Purpose: This function is used to updateData
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json 
*/
async function updateById(data) {	   
	try { 
		if(data){   
			var sql = "UPDATE projects set ? WHERE id = ?";   
			return new Promise((resolve,reject)=>{
				connectPool.query(sql,[data, data.id], (err, result) => {
					if (err) {  
						console.log(data);
						reject(err)
					} else {  
						resolve(result)
					}
				})
			}) 
		}else{
			return null;
		}
	} catch (err) {
        return err;  
    } finally {
		//if (connectPool && connectPool.end) connectPool.end();
	}   
} 

/** 
 *  updateData
 *  Purpose: This function is used to updateData
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json 
*/
async function getProjectById(project_id) {	   
	try { 
		if(project_id){    
			var sql='select * from projects where id = ?';
			return new Promise((resolve,reject)=>{
				connectPool.query(sql,project_id, (err, result) => { 
					if (err) {  
						console.log(data);
						reject(err)
					} else {   
						resolve(result)
					}
				})
			}) 
		}else{
			return null;
		}
	} catch (err) {
        return err;  
    } finally {
		//if (connectPool && connectPool.end) connectPool.end();
	}   
} 