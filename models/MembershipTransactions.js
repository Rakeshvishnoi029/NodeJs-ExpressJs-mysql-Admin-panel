//var sync = require('synchronize');
module.exports={
	getTransactions:function(data,callback)
	{	
		let LIMIT = '';
		var sql='select * from membership_transactions where membership_transactions.user_id = ?';   
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
	getTransactionCount:function(data,callback)
	{	
		try {  
			//throw 'this is test error'; 
			var sql='select count(id) as count from membership_transactions where user_id = ?';   
			var param=[data.user_id];     
			connectPool.query(sql,param,function(error,result){
				if (error) {   
					console.log(error); 
					callback(false);   
					//throw error;  
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
		}catch (e) { 
			console.log(e); 
		}    
	},   


	// Sequelize Datavbase 
	InitSequel:function(sequelize, type)
	{	
        var MembershipTransactions = sequelize.define('membership_transactions', {
              id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
              },
              user_id : { type: type.INTEGER },
              transaction_id : { type: type.STRING }, 
              subscription_id : { type: type.STRING }, 
							total_transactions : { type: type.INTEGER }, 
							plan_title : { type: type.STRING },  
							user_name : { type: type.STRING },   
							amount : { type: type.INTEGER },   
							status : { type: type.STRING },   
              days : { type: type.INTEGER },      
          },   
          {
            tableName: 'membership_transactions', 
            timestamps: false
          }
      ); 
      return MembershipTransactions;
  	},
}; 

