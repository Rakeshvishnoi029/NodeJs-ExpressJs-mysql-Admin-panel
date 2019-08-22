/** 
 *  getUserByid
 *  Purpose: This function is used to getUserByid
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function getDetail() {	  
	try {  
		var sql='select * from settings where id = 1';    
		return new Promise((resolve,reject)=>{
			connectPool.query(sql, (err, result) => {
				if (err) { 
					reject(err)
				} else { 
					resolve(result)
				}
			})
		}) 
	} finally {
		//if (connectPool && connectPool.end) connectPool.end();
	} 
}   
 
module.exports={ 
	getDetail
}; 
 