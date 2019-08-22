//var sync = require('synchronize');
module.exports={
	getTransactions:function(data,callback)
	{	
		let LIMIT = '';
		if(data.join == 'constructor'){  
			//var sql='select * from transactions LEFT JOIN projects ON (projects.id = transactions.project_id) LEFT JOIN users as constructor ON (constructor.id = transactions.contractor_id) where transactions.user_id = ?';    
			var sql='select * from transactions where transactions.user_id = ? order by id DESC';    
		}else{ 
			var sql='select * from transactions LEFT JOIN projects ON (projects.id = transactions.project_id) where transactions.user_id = ? order by id DESC';
		}  
		console.log(sql);   
		console.log(data);   
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
	}, 
	
	getConsTransactions:function(data,callback)
	{	
		let LIMIT = '';
		var sql='select * from transactions LEFT JOIN users ON (users.id = transactions.user_id) where transactions.contractor_id = ?'; 
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
	},
	saveData:function(data,callback)
	{	
		 
		var sql='INSERT INTO projects set ? ';  
		var param = data;      
		connectPool.query(sql,data,function(error,result){
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
	getTransactionCount:function(data,callback)
	{	
		 
		var sql='select count(id) as count from transactions where user_id = ?';   
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
	getTransactionCountContr:function(data,callback)
	{	
		 
		var sql='select count(id) as count from transactions where contractor_id = ?';   
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
