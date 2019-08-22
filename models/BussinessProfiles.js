//var sync = require('synchronize');
module.exports={
	  
	updateData:function(data,callback)
	{	
		var user_id = data.user_id; 
		var sql = "UPDATE bussiness_profile set ? WHERE user_id =  ?";     
		connectPool.query(sql,[data, user_id ],function(error,result){ 
			if (error) {   
				console.log(error)
				callback(false);    
			}  
			else 
			{	  
				if(result.length==0 || result==null){
					callback(false);
				}else{
					result.id = user_id;  
					callback(result);
				}  
			} 
		});  
	}, 
	getData:function(data,callback)
	{	   
		var sql='select * from bussiness_profile where user_id = ?';     
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
	checkRecordExist:function(data,callback)
	{	 
		 
		var sql='select count(id) as count from bussiness_profile where user_id = ?';     
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
	deleteRecord:function(data,callback)
	{	 
		
		var sql='delete from bussiness_locations where id = ?';    
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
	updateRating,
	getDataByUserId,
	checkMembership
}; 

/** 
 *  updateRating
 *  Purpose: This function is used to updateOverallRating
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json 
*/
async function updateRating(data) {	   
	
	try { 
		if(data){   
			var sql = "UPDATE `bussiness_profile` SET `overall_rating` = "+data.rating+" WHERE `bussiness_profile`.`user_id` ="+data.user_id;    
			return new Promise((resolve,reject)=>{
				connectPool.query(sql, (err, result) => {
					if (err) { 
						console.log(data);  
						reject(err)
					} else {   
						resolve(result); 
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
async function getDataByUserId(user_id) {	   
	try { 
		if(user_id){   
			console.log(user_id); 
			var sql='select * from bussiness_profile where user_id = ?';
			return new Promise((resolve,reject)=>{
				connectPool.query(sql,user_id, (err, result) => { 
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
async function checkMembership(user_id) {	    
	try { 
		if(user_id){   
			console.log(user_id); 
			current_date = moment(Date.now()).format('YYYY-MM-DD');   
			var sql='select * from bussiness_profile where user_id = ? AND rem_transactions > 0 AND DATE(plan_expiry_date) >="'+current_date+'"';  
			return new Promise((resolve,reject)=>{
				connectPool.query(sql,user_id, (err, result) => { 
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
	} catch (err) {
        return err;  
    } finally {
		//if (connectPool && connectPool.end) connectPool.end();
	}   
}
 
  