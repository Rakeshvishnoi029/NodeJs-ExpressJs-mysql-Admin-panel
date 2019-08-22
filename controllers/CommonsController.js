
var Users = require.main.require('./models/Users');
var randomstring = require("randomstring");   
var Request = require("request"); 
/** 
 *  notificationList
 *  Purpose: This function is used to see notification list 
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void  
*/
exports.notificationList = function (req, res) { 
    var userId      = req.query.userId;  
    var auth        = req.headers.auth;   
    if(!userId){	  		 
        return res.send(JSON.stringify({
            "status": 400,
            "message": 'User id is required.', 
        })); 
	}else if(!auth){			 
        return res.send(JSON.stringify({
            "status": 400,
            "message": 'Auth is required.', 
        }));
    }else{  
        connectPool.query('SELECT COUNT(*) AS cnt FROM `users` where `id` = ? AND `oauth_token` = ? ',[userId,auth], function (error, results) {
             if(error){
                console.log(error);
            }else if(results[0].cnt == 0){ 
                return res.send(JSON.stringify({
                    "status": 500,
                    "message": 'Session Expired.', 
                }));
            }else{
                connectPool.query('SELECT `id`,`user_id`,`title`,`description` FROM `notifications` WHERE `user_id` = ? ',userId, function (error, notificationList) {
                    if(error){
                        console.log(error);
                    }else if(notificationList !=''){  
                        return res.send(JSON.stringify({
                            "status": 200, 
                            "message": 'Notification List', 
                            "data": notificationList, 
                        })); 
                    }else{
                        return res.send(JSON.stringify({
                            "status": 400, 
                            "message": 'No record found.', 
                        }));   
                    }  
                }); 
            }
        });  
    }        
};  

/** 
 *  sendNotificationAndroid
 *  Purpose: This function is used sendNotificationAndroid
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/ 
async function sendNotificationAndroid0(notification_data) {

    if(notification_data && notification_data.user_id){   
        //const userDetail = await Users.getUserByid(notification_data.user_id);  

        return new Promise((resolve,reject)=>{ 

            Request.post({  
                "headers": { 
                    "content-type": "application/json",
                    "authorization": 'key='+FIREBASE_LEGACY_KEY
                },
                "url": "https://fcm.googleapis.com/fcm/send",    
                "body": JSON.stringify({ 
                    to: notification_data.device_token, 
                    "collapse_key": "type_a",
                    "notification": 
                        { 
                            "body": "Body of Your Notification",
                            "title": "Title of Your Notification"
                        },
                    "data": 
                        { 
                            "body": 'Body of Your Notification in Data',
                            "title": 'Title of Your Notification in Title',
                            "key_1": 'Value for key_1',
                            "key_2": 'Value for key_2'  
                        },       
                })    
            },(error, response, body) => { 
                if(error) {
                    reject(error);
                }else{ 
                    var retrunRes = JSON.parse(body);    
                    console.log(retrunRes);      
                    resolve(retrunRes); 
                }  
            });    
        }) 
    }else{
        return res.send(JSON.stringify({
            "status": 400,
            "message": 'Invalid data.', 
        })); 
    }        
};    
exports.sendNotificationAndroid0 = sendNotificationAndroid0;


/**  
 *  updateBankDetail
 *  Purpose: This function is used to updateBankDetail
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function updateToken(req, res) { 
    try {
         const { check, validationResult } = require('express-validator/check');
         var reaponseArr = '{}'; 
         var input = JSON.parse(JSON.stringify(req.body));  
         console.log(input); 
         var auth_token = req.headers.authtoken; 
         req.checkBody('user_id', 'user_id is required').notEmpty();
         req.checkBody('device_token', 'device_token is required').notEmpty(); 
         var errors = req.validationErrors();  
         if(!auth_token){   	 		 
             return res.send(JSON.stringify({ 
                 "status": SessionExpireStatus,
                 "message": 'Session Expired.',  
             }));	  		 
         }
         if(errors){	  		 
             return res.send(JSON.stringify({
                 "status": failStatus,
                 "message": errors[0].msg, 
             })); 	  		 
         }else{ 
             var respondeArray = {};
             const CheckAuthentication = await Users.CheckAuthentication(auth_token);   // Check Authentication   
             if(CheckAuthentication){
                 const checkUser = await Users.getUserByid(input.user_id); 
                 console.log(checkUser); 
                 if(checkUser.length > 0){ 
                     var updateData = { 
                        id    : input.user_id,      
                        device_token : input.device_token,  
                     }; 
                     var saveRecord = await Users.updateUserData(updateData);    
                     if(saveRecord){   
                         return res.send(JSON.stringify({  
                             "status": successStatus,
                             "message": 'User detail updated successfully.',  
                             "data": {},          
                         }));  
                     }else{
                         return res.send(JSON.stringify({ 
                             "status": failStatus,  
                             "message": 'Data could  not updated. Please try again.',
                             "data": respondeArray  
                         })); 
                     }  
                }else{
                    return res.send(JSON.stringify({ 
                        "status": failStatus,  
                        "message": 'Invalid user Id.',
                        "data": respondeArray  
                    }));
                }  
             }else{
                 return res.send(JSON.stringify({ 
                     "status": failStatus,  
                     "message": 'Session expired.',
                     "data": respondeArray   
                 })); 
             }   
         } 
     } catch (err) {
         return res.send(JSON.stringify({
             "status": failStatus,
             "message": err, 
         })); 
     }  
     return false;  
 }; 
 exports.updateToken = updateToken; 


/**  
 *  updateBankDetail
 *  Purpose: This function is used to updateBankDetail
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function logout(req, res) { 
    try {
         const { check, validationResult } = require('express-validator/check');
         var reaponseArr = '{}'; 
         var input = JSON.parse(JSON.stringify(req.body));  
         console.log(input); 
         var auth_token = req.headers.authtoken; 
         req.checkBody('user_id', 'user_id is required').notEmpty();  
         var errors = req.validationErrors();  
         if(!auth_token){   	 		 
             return res.send(JSON.stringify({ 
                 "status": SessionExpireStatus,
                 "message": 'Session Expired.',  
             }));	  		 
         }
         if(errors){	  		 
             return res.send(JSON.stringify({
                 "status": failStatus,
                 "message": errors[0].msg, 
             })); 	  		 
         }else{ 
             var respondeArray = {};
             const CheckAuthentication = await Users.CheckAuthentication(auth_token);   // Check Authentication  
             console.log(CheckAuthentication);  
             if(CheckAuthentication.length > 0){ 
                 const checkUser = await Users.getUserByid(input.user_id); 
                // console.log(checkUser); 
                 if(checkUser.length > 0){ 
                     var updateData = { 
                        id    : input.user_id,      
                        device_token : null,  
                        device_type : null,  
                        auth_token : null,   
                     };  
                     var saveRecord = await Users.updateUserData(updateData);    
                     if(saveRecord){   
                         return res.send(JSON.stringify({  
                             "status": successStatus,
                             "message": 'User logged out successfully.',  
                             "data": {},          
                         }));  
                     }else{
                         return res.send(JSON.stringify({ 
                             "status": failStatus,  
                             "message": 'Data could  not updated. Please try again.',
                             "data": respondeArray  
                         })); 
                     }  
                }else{
                    return res.send(JSON.stringify({ 
                        "status": failStatus,  
                        "message": 'Invalid user Id.',
                        "data": respondeArray  
                    }));
                }  
             }else{
                 return res.send(JSON.stringify({ 
                     "status": failStatus,  
                     "message": 'Session expired.',
                     "data": respondeArray   
                 })); 
             }   
         } 
     } catch (err) {
         return res.send(JSON.stringify({
             "status": failStatus,
             "message": err, 
         })); 
     }  
     return false;  
 }; 
 exports.logout = logout; 
 
  /** 
 *  StripeCreateAccount
 *  Purpose: This function is used to StripeCreateAccount
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.sendNotificationAndroid = function(user_data ,callback){  
      
    if(notification_data && notification_data.user_id){ 
        Request.post({  
            "headers": { 
                "content-type": "application/json",
                "authorization": 'key='+FIREBASE_LEGACY_KEY
            },
            "url": "https://fcm.googleapis.com/fcm/send",    
            "body": JSON.stringify({ 
                to: notification_data.device_token, 
                "collapse_key": "type_a",
                "notification": 
                    { 
                        "body": notification_data.message, 
                        "title": notification_data.title
                    },
                "data": 
                    { 
                        "body": notification_data.message, 
                        "title": notification_data.title, 
                        "key_1": 'Value for key_1',
                        "key_2": 'Value for key_2'  
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
        return callback(null);    
    }   
}


/** 
 *  forgotPassword
 *  Purpose: This function is used to forgotPassword
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: email
 *  Returns: void 
*/
exports.forgotPassword = function (req, res) { 
  
    const { check, validationResult } = require('express-validator/check');  
    var input = JSON.parse(JSON.stringify(req.body));    
    console.log(input);   
    var auth_token = req.headers.authtoken; 
    var errors = req.validationErrors(); 
    var error_msg = '';
    if(!input.email || input.email == null){
        error_msg = 'Please provide location_id';
    }   
	if(error_msg != ''){ 
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": error_msg,  
        })); 
    }else{  
        var userData = { 
            email    : input.email
        };      
        var responseArr = {};  
        Users.checkEmailExist(userData,function(result){  
            if(result[0].count && result[0].count > 0){ 
                updateData = {
                    reset_password_code : randomstring.generate(10), 
                    email : input.email
                } 
                Users.updateData(updateData,function(updateResult){  
                    if(updateResult){      
                        Users.getUserByEmail(input.email,function(userDetail){
                            // Send mail to user 
                            var mailData = { 
                                'receiver_id' :  userDetail[0].id,  
                                'template_slug' : 'forgot-password' 
                            }  
                            Mails.SendMail(mailData);  
                            responseArr.user_id = userDetail.id;  
                            // Save bussiness profile 
                            return res.send(JSON.stringify({  
                                "status": successStatus,
                                "message": 'Reset password link is sent to your email. Please check.', 
                                "data": responseArr,         
                            }));  
                        }); 

                    }else{ 
                        return res.send(JSON.stringify({ 
                            "status": failStatus,  
                            "message": 'Data could  not updated. Please try again.',
                            "data": '{}'  
                        })); 
                    }   
                }); 
            }else{
                return res.send(JSON.stringify({ 
                    "status": SessionExpireStatus,  
                    "message": 'Email is not registered.',
                    "data": responseArr  
                })); 
            }
        });   
           
    }
    return false;  
};
  
/** 
 *  categoryList
 *  Purpose: This function is used to get category list 
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void  
*/ 
exports.categoryList = function (req, res) {  

    try { 
        const { check, validationResult } = require('express-validator/check');   
        var input = JSON.parse(JSON.stringify(req.body)); 
        var input = req.query;   
        var auth_token = req.headers.authtoken;   
        var errors = req.validationErrors();     
        var reaponseArr = [];   
        var constructorArr = {}; 
        if(errors){	  	 	 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": errors[0].msg, 
            })); 
        //}if(!auth_token){   	 		 
        }if(false){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{      
            let page = (input.page != '' ) ? input.page : 0; 
            let offset = (page * pageLimit);      
            connectPool.query('SELECT id,title FROM categories WHERE is_active = ?', [1], function (error, results) {  
                if(error){
                    console.log(error); 
                }else if (!results) {  
                    return res.send(JSON.stringify({ 
                        "status": 200,
                        "message": 'No record available.',
                        "data": results,
                    })); 
                } else { 
                    return res.send(JSON.stringify({ 
                        "status": 200,
                        "message": 'Category list',
                        "data": results,
                    }));   
                }
            });     
        }
    }catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": reaponseArr  
        })); 
    }   
}; 

/** 
	 *  ChangePassword
     *  Purpose: This function is used for ChangePassword
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/
exports.changePassword = function (req, res) {
     
    try { 
        const { check, validationResult } = require('express-validator/check');   
        var input = JSON.parse(JSON.stringify(req.body));          
        req.checkBody('current_password', 'Current Password is required').notEmpty();
        req.checkBody('new_password', 'New password is required').notEmpty(); 
        req.checkBody('user_id', 'user_id is required').notEmpty(); 
        var auth_token = req.headers.authtoken;
        var reaponseArr = {};    
        var errors = req.validationErrors();  
        if(errors){	  	 	 
            return res.send(JSON.stringify({
                "status": 400,
                "message": errors[0].msg, 
            }));
        }  
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        } else{ 
            try {
                Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                    if(authResult.success){ 
                        var inputArray = {
                            "current_password": input.current_password,
                            "new_password":input.new_password, 
                            "user_id":input.user_id,  
                        } 
                        Request.post({ 
                            "headers": { "content-type": "application/json" },
                            "url": siteUrl +"changePassword", 
                            "body": JSON.stringify({  
                                "current_password": input.current_password,
                                "new_password":input.new_password, 
                                "user_id":input.user_id,  
                            })
                        },(error, response, body) => { 
                            if(error) {
                                return console.dir(error);
                            }     
                            var retrunRes = JSON.parse(body); 
                            return res.send(JSON.stringify(retrunRes));	
                            
                        });
                }else{
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": reaponseArr  
                    })); 
                } 
                });
            }catch (e) { 
                console.log(e);
                return res.send(JSON.stringify({ 
                    "status": SessionExpireStatus,  
                    "message": e, 
                    "data": reaponseArr  
                })); 
            }  
        }  
    }catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": reaponseArr  
        })); 
    }  
};




