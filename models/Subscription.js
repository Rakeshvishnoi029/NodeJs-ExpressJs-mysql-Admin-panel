// module.exports = (sequelize, type) => {  
//     var Subscription = sequelize.define('subscription',
//         {
//             id: {
//               type: type.INTEGER,
//               primaryKey: true,
//               autoIncrement: true
//             },
//             no_transaction : { type: type.INTEGER },
//             slug : { type: type.STRING }, 
//             transcation_id : { type: type.STRING }, 
//             subscription_name : { type: type.STRING }, 
//             amount : { type: type.INTEGER }, 
//             days : { type: type.INTEGER },  
//             is_active : { type: type.INTEGER },    
//         },  
//         {
//           tableName: 'subscription',
//           timestamps: false
//         }
//     ); 
//     return Subscription;   
// }

module.exports= {
	Subscription:function(sequelize, type)
	{	
        var Subscription = sequelize.define('subscription', {
              id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
              },
              no_transaction : { type: type.INTEGER },
              slug : { type: type.STRING }, 
              transcation_id : { type: type.STRING }, 
              subscription_name : { type: type.STRING }, 
              amount : { type: type.INTEGER }, 
              days : { type: type.INTEGER },  
              is_active : { type: type.INTEGER },    
          },  
          {
            tableName: 'subscription',
            timestamps: false
          }
      ); 
      return Subscription;
  },
  
  
};