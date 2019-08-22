//var sync = require('synchronize');
module.exports={
	getLocationsBytext:function(data,callback)
	{
		try {
			var sql= "SELECT user_id FROM `bussiness_locations` WHERE `address` LIKE '%"+data.search_text+"%' GROUP BY user_id";  
			return new Promise((resolve,reject)=>{
				connectPool.query(sql, (err, resp) => {
					if (err) { 
						reject(err)
					} else { 
						resolve(resp)
					}
				})
			})
		} finally {
		  //if (connectPool && connectPool.end) connectPool.end();
		}  
	},  
	getLocationsByCordinates:function(data,search_distance)
	{	
		//AND bussiness_profile.is_profile_completed = 0

		try {
			var longitude = data.longitude;
			var latitude = data.latitude;
			var sql2 = 'SELECT 	bussiness_locations.id,bussiness_locations.user_id,bussiness_locations.latitude,bussiness_locations.longitude , users.is_approved, bussiness_profile.is_profile_completed, ( 6371 * acos( cos( radians('+latitude+') ) * cos( radians( bussiness_locations.latitude ) )* cos( radians(bussiness_locations.longitude) - radians('+longitude+')) + sin(radians('+latitude+'))  * sin( radians(bussiness_locations.latitude)))) AS distance FROM bussiness_locations  LEFT JOIN bussiness_profile ON (bussiness_profile.user_id = bussiness_locations.user_id) LEFT JOIN users ON (users.id = bussiness_locations.user_id) WHERE users.is_approved = 1 AND bussiness_profile.is_profile_completed = 1 HAVING distance < '+search_distance+'  ORDER BY distance DESC';  
			console.log(sql2);           
			//var sql= "SELECT user_id FROM `bussiness_locations` WHERE `address` LIKE '%"+data.search_text+"%' GROUP BY user_id";  
			return new Promise((resolve,reject)=>{
				connectPool.query(sql2, (err, resp) => { 
					if (err) { 
						reject(err)
					} else { 
						resolve(resp)
					}
				}) 
			})
		} finally {
		  //if (connectPool && connectPool.end) connectPool.end();
		}  
	},  
	 
	saveData:function(data,callback)
	{	
		console.log(data);  
		var sql = "INSERT INTO bussiness_locations (user_id, address, pincode,latitude,longitude,country,city,state,contact_number) VALUES ? ";       
		//console.log(sql); console.log(data);       
		connectPool.query(sql,[data], function(error,result){ 
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
	updateData:function(data,callback)
	{	
		var location_id = data.id; 
		var sql = "UPDATE bussiness_locations set ? WHERE id = ?";     
		connectPool.query(sql,[data, location_id ],function(error,result){ 
			if (error) {  
				console.log(error); 
				callback(false);
			}  
			else 
			{	  
				if(result.length==0 || result==null){
					callback(false);
				}else{
					result.id = location_id; 
					callback(result);
				}  
			} 
		});  
	}, 
	checkRecordExist:function(data,callback)
	{	 
		var sql='select count(id) as count from bussiness_locations where id = ?';    
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
}; 
