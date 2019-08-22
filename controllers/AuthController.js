var Request = require("request");
var Notifications = require.main.require('./models/Notifications'); 
/** 
 *  CheckAuth
 *  Purpose: This function is used to get category list 
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void  
*/   
exports.CheckAuth = function(auth_token , callback){   
    connectPool.query("SELECT COUNT(*) AS count  from users where auth_token = ?",[auth_token], function (error, results) {  
        if(error){   
            console.log(error);  
        }else if(results[0].count == 1){ 
                finalData = {'success' :'success'}; 
        }else{    
            finalData = {'failed' :'failed'};
        }   
        return callback(finalData); 
    });  
}


/** 
 *  CheckAuthUser
 *  Purpose: This function is used to check CheckAuthUser
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void  
*/ 
async function CheckAuthUser(authtoken){
    authUser = {};
    var authUser = localStorage.getItem('LoginUser');
    console.log(authUser);
    return new Promise((resolve,reject)=>{ 
            if (authUser) { 
                reject(authUser)
            } else { 
                resolve({})
            }  
    })
     
    return authUser; 
}  

exports.CheckAuthUser = CheckAuthUser; 
/** 
 *  CheckCustomerExists
 *  Purpose: This function is used to CheckCustomerExists
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.CheckCustomerExists = function(user_id ,callback){  
    connectPool.query("SELECT COUNT(*) AS count  from users where id = ? AND role_id = ?",[user_id,1], function (error, results) { 
        if(error){ 
            console.log(error);  
        }else if(results[0].count == 1){ 
            finalData = {'success' :'success'}; 
        }else{    
            finalData = {'failed' :'failed'};
        }   
        return callback(finalData);
    }); 
} 

/** 
 *  CheckConstructorExists
 *  Purpose: This function is used to CheckConstructorExists
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/ 
exports.CheckConstructorExists = function(user_id ,callback){   
    connectPool.query("SELECT COUNT(*) AS count  from users where id = ? AND role_id = ?",[user_id,2], function (error, results) {    
        if(error){ 
            console.log(error);  
        }else if(results[0].count == 1){ 
                finalData = {'success' :'success'}; 
        }else{    
            finalData = {'failed' :'failed'};
        }   
        return callback(finalData);
    });  
} 
/** 
 *  UploadImageToserver
 *  Purpose: This function is used to UploadImageToserver
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.UploadImageToserver = function(image_data ,callback){  
    //console.log(image_data); 
    var image_type = '';
    if(image_data.image_type !== 'undefined'){
        image_type = image_data.image_type; 
    } 
    Request.post({ 
        "headers": { "content-type": "application/json"  },
        "url": siteUrl +"uploadImage",  
        "body": JSON.stringify({  
            "file_name": image_data.filename,       
            "imagePath": image_data.imagePath, 
            'image_type' : image_type 
        })   
    },(error, response, body) => { 
            if(error) {
                return console.dir(error); 
            }  
            var retrunRes = JSON.parse(body);     
            if(retrunRes.status ==200){   
                var fs = require('fs');  
                fs.unlinkSync('public/upload/'+image_data.filename);    
                finalData = {'success' :'success'}; 
            }else{
                finalData = {'failed' :'failed'};
            }  
            return callback(finalData);
    }); 
}  
/** 
 *  StripeCreateAccount
 *  Purpose: This function is used to StripeCreateAccount
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.StripeCreateAccount = function(user_data ,callback){  
      
    Request.post({ 
        "headers": { "content-type": "application/json"  },
        "url": siteUrl +"createCustomStripeAccount",  
        "body": JSON.stringify({  
            "user_id": user_data.user_id
        })   
    },(error, response, body) => { 
            if(error) {
                return console.dir(error); 
            }  
            var retrunRes = JSON.parse(body);   
            return callback(retrunRes);   
    });   
}   
/** 
 *  StripeCreateAccount
 *  Purpose: This function is used to StripeCreateAccount
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.sendNotificationAndroid = function(notification_data ,callback){  
      
    
    if(notification_data && notification_data.user_id){

        connectPool.query("SELECT * from users where id = ?", notification_data.user_id, function (error, results) {    
            if(error){
                console.log(error); 
            }else{
                if(results){  
                    device_token = results[0].device_token; 
                    //device_token = 'd-WV-qEPOJw:APA91bGNza5DCUMEggjL3e3U2FjAT2ShHIsUWOcNapxStUXYc5bYwspO3353IGKEJbmrT4sOQ7N36O-a3HXhbFkagp6tpcQJtj_aBqEl0ELZudmo0A62Lm2VPxY006B137uO59noH71z'; 
                      
                    if(device_token && device_token != null){
                        notificationSaveData = {
                            receiver_id : notification_data.user_id,
                            notification_title : notification_data.title,
                            message : notification_data.message,
                            project_id : notification_data.type_id,
                            created_at : moment(Date.now()).format('YYYY-MM-DD hh:mm:ss'), 
                            updated_at : moment(Date.now()).format('YYYY-MM-DD hh:mm:ss'),  
                        }
                        Notifications.saveNotificationData(notificationSaveData, function(saveResult){
                            console.log(saveResult);    
                        }); 
                        console.log(notificationSaveData); 
                        if(results[0].device_type == 'android' || results[0].device_type == 'Android'){ 

                            Request.post({  
                                "headers": { 
                                    "content-type": "application/json",
                                    "authorization": 'key='+FIREBASE_LEGACY_KEY
                                },
                                "url": "https://fcm.googleapis.com/fcm/send",    
                                "body": JSON.stringify({ 
                                    to: device_token, 
                                    //"collapse_key": "type_a", 
                                    "data": 
                                        { 
                                            "body": notification_data.message, 
                                            "title": notification_data.title, 
                                            "type": notification_data.type,
                                            "type_id": notification_data.type_id,
                                        },       
                                })     
                            },(error, response, body) => { 
                                if(error) {
                                    return console.dir(error); 
                                    //reject(error);
                                }else{ 
                                    var retrunRes = JSON.parse(body);    
                                    console.log(retrunRes); 
                                    return callback(retrunRes);  
                                }     
                            });

                        }else{
 
                            Request.post({  
                                "headers": { 
                                    "content-type": "application/json",
                                    "authorization": 'key='+FIREBASE_LEGACY_KEY
                                },
                                "url": "https://fcm.googleapis.com/fcm/send",    
                                "body": JSON.stringify({ 
                                    to: device_token, 
                                    //"collapse_key": "type_a",
                                    "notification": 
                                        { 
                                            "body": notification_data.message, 
                                            "title": notification_data.title
                                        },
                                    "data": 
                                        { 
                                            "body": notification_data.message, 
                                            "title": notification_data.title, 
                                            "type": notification_data.type,
                                            "type_id": notification_data.type_id,
                                        },       
                                })     
                            },(error, response, body) => { 
                                if(error) {
                                    return console.dir(error); 
                                    //reject(error);
                                }else{ 
                                    var retrunRes = JSON.parse(body);    
                                    console.log(retrunRes); 
                                    return callback(retrunRes);  
                                }     
                            }); 
                        }  
                    } 
                }
            }   
        });  
    }else{
        return callback(null);    
    }   
}  
 
/** 
 *  ChangePassword
 *  Purpose: This function is used to ChangePassword to the live server
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.ChangePassword = function(passwordData ,callback){  
     
    Request.post({ 
        "headers": { "content-type": "application/json"  },
        "url": siteUrl +"changePassword",  
        "body": JSON.stringify({  
            "user_id": passwordData.user_id,     
            "current_password": passwordData.new_password,     
            "new_password": passwordData.new_password,      
        })    
    },(error, response, body) => { 
            if(error) {
                return console.dir(error); 
            }  
            var retrunRes = JSON.parse(body);      
            if(retrunRes.status ==200){   
                finalData = {'success' :'success'};
            }else{
                finalData = {'failed' :'failed'}; 
            }  
            return callback(finalData);
    }); 
}





