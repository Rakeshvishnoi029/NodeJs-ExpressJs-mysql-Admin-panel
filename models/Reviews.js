/** 
 *  getUserByid
 *  Purpose: This function is used to getUserByid
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function getUserByid(user_id) {	  
	try { 
		if(user_id){ 
			var sql='select * from users where id = '+ user_id;    
			return new Promise((resolve,reject)=>{
				connectPool.query(sql, (err, result) => {
					if (err) { 
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
		if (connectPool && connectPool.end) connectPool.end();
	} 
} 
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
			var sql='INSERT INTO reviews set ? ';
			return new Promise((resolve,reject)=>{
				connectPool.query(sql,data, (err, result) => {
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
async function updateData(data) {	  
	
	try { 
		if(data){  

			var sql = "UPDATE reviews set ? WHERE id = ?";   
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
 *  updateOverallRating
 *  Purpose: This function is used to updateOverallRating
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json 
*/
async function getOverallRating(data) {	   
	
	try { 
		if(data){   
			var sql = "select AVG(rating) as rating from reviews WHERE user_id = ?";   
			return new Promise((resolve,reject)=>{
				connectPool.query(sql, data, (err, result) => {
					if (err) { 
						console.log(data); 
						reject(err)
					} else {   
						resolve(result[0].rating);
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
 
module.exports={
	saveData,
	updateData,
	getUserByid, 
	getOverallRating,  
}; 
