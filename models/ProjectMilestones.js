//var sync = require('synchronize');


async function getMilestonByProject2(data, res) {
	try {
		var sql='select * from project_milestones where project_id = ?';   
		var param=data.project_id;        
		connectPool.query(sql,param,function(error,result){
			if (error) {  
				console.log(error);
				callback(null);
			}  
			else
			{	 
				if(result.length==0 || result==null){
					callback(null);
				}else{ 
					callback(result);
				}  
			} 
		});   
	} catch (err) {
	  return handleCustomError(res, err);
	}
} 
 

module.exports={   
	saveData:function(data,callback)
	{	 
		var sql = "INSERT INTO project_milestones (project_id,constructor_id, customer_id,title,amount,status, created_at,updated_at) VALUES ? ";  
		 
		connectPool.query(sql,[data],function(error,result){
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
	updateData:function(data,callback)
	{	
		updatedata = {
			title    : data.title,    
			amount : data.amount,  
		}  
		var sql = "UPDATE project_milestones set ? WHERE id = ?";     
		connectPool.query(sql,[updatedata, data.id ],function(error,result){ 
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
			} 
		});  
	}, 
	getMilestonByProject:function(data,callback)
	{	 
		
		var sql='select * from project_milestones where project_id = ?';   
		var param=data.project_id;        
		connectPool.query(sql,param,function(error,result){
			if (error) {  
				console.log(error);
				callback(null);
			}  else {	 
				if(result.length==0 || result==null){
					callback(false);
				}else{
					callback(result);
				}  
			} 
		});  
	},   
	checkMilestoneExists:function(data,callback)
	{	 
		
		var sql='select count(id) as count from project_milestones where id = ? ';    
		var param=data.id;         
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
	getMilestoneDetail:function(data,callback)
	{	 
		 
		var sql='select * from project_milestones where id = ? ';   
		var param=data.id;         
		connectPool.query(sql,[param],function(error,result){
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
	getMilestonByProject2, 

}; 
