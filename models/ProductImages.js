//var sync = require('synchronize');
const table = 'product_images';
 

/** 
 *  getAllData
 *  Purpose: This function is used to getAllData
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function getAllData() {	  
	try {   
			var sql='select * from '+table+' where is_deleted = 0 ORDER BY id DESC';    
			return new Promise((resolve,reject)=>{
				connectPool.query(sql, (err, result) => {
					if (err) { 
						reject(err)
					} else {  
						resolve(result)
					}
				})
			}).catch(function(e){
				return e; 
		});
		 
	}finally {
	 
	} 
}
/** 
 *  getAllData
 *  Purpose: This function is used to getAllData
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function getByProductId(product_id) {	  
	try {   
			var sql='select * from '+table+' where product_id ='+product_id;
			console.log(sql);    
			return new Promise((resolve,reject)=>{
				connectPool.query(sql, (err, result) => {
					if (err) { 
						reject(err)
					} else {  
						resolve(result)
					}
				})
			}).catch(function(e){
				return e; 
		});
		 
	}finally {
	 
	} 
}
 
function saveDataCallback(data,callback)
{	
	 
	var sql='INSERT INTO product_images set ? ';    
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
}


/** 
 *  deleteRecord
 *  Purpose: This function is used to deleteRecord
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function deleteRecord(id) {	  
	try { 
		if(id){ 
			var sql='delete  from '+table+' where id = '+ id;   
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
	 
	} 
} 

/** 
 *  deleteRecord
 *  Purpose: This function is used to deleteRecord
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function setDefaultImage(id, product_id) {	  
	try { 
		if(id){ 

			var sql1='UPDATE '+table+' set default_image = 0 where product_id = '+ product_id;  
			connectPool.query(sql1, (err, result) => {
				console.log(result); 
			});  
			var sql='update '+table+' set default_image = 1 where id = '+ id;   
				console.log(sql);  
				return new Promise((resolve,reject)=>{
					connectPool.query(sql, (err, result1) => {
						if (err) {  
							reject(err)
						} else { 
							console.log(result1); 
							resolve(result1)
						}
					}) 
				})
		}else{
			return null;
		}
	} finally {
	 
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
			var sql='INSERT INTO '+table+' set ? ';
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
 *  getAllData
 *  Purpose: This function is used to getAllData
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function getDefaultImage(product_id) {	  
	try {   
		var sql='select * from '+table+' where product_id ='+product_id+' AND  default_image = 1'; 
			return new Promise((resolve,reject)=>{
				connectPool.query(sql, (err, result) => {
					if (err) { 
						reject(err)
					} else {  
						resolve(result)
					}
				})
			}).catch(function(e){
				return e; 
		});
		 
	}finally {
	 
	} 
}
   
   

module.exports={
	getByProductId,
	saveData,  
	getAllData,
	deleteRecord,  
	saveDataCallback,
	getDefaultImage,
	setDefaultImage,
	InitSequel:function(sequelize, type)
	{	
        var ProductImages = sequelize.define('product_images', {
              id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
              },  
              product_id : { type: type.INTEGER }, 
			  image	 : { type: type.INTEGER },  
              default_image : { type: type.INTEGER },    
          	},  
          {
            tableName: 'product_images',
            timestamps: false
          }  
      );  
      return ProductImages;
  }, 
}; 
