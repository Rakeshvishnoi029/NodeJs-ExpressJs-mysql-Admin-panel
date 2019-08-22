var Request = require("request");
//var UserModel = require.main.require('./models/user-model');  
var BussinessLocations = require.main.require('./models/BussinessLocations');    
var Projects = require.main.require('./models/Projects');     
var ProjectMilestones = require.main.require('./models/ProjectMilestones');     
var Users = require.main.require('./models/Users');     
var Notifications = require.main.require('./models/Notifications');     
var Transactions = require.main.require('./models/Transactions');     
var MilestoneImages = require.main.require('./models/MilestoneImages');     
var Reviews = require.main.require('./models/Reviews'); 
var BussinessProfiles = require.main.require('./models/BussinessProfiles');    
const controller = 'admin';
   
/** 
	 *  login
     *  Purpose: This function is used for login
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/ 
exports.login = function (req, res) {
    
    const { check, validationResult } = require('express-validator/check');   
    var input = JSON.parse(JSON.stringify(req.body));  
    req.role_id = 0;
    req.device_token = '4457544';
    req.device_type = 'ios'; 
    data = {};
    var action = 'login';
    errorData = {};

    if(req.session){
        LoginUser = req.session.LoginUser; 
        if(LoginUser){
            res.set('content-type' , 'text/html; charset=mycharset');  
            res.redirect(nodeAdminUrl+'/dashboard');  
        }  
    } 
      
    if (req.method == "POST") { 
          
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('role_id', 'Role_id is required').notEmpty(); 
        req.checkBody('device_token', 'device_token is required').notEmpty(); 
        req.checkBody('device_type', 'device_type is required').notEmpty();  
        var errors = req.validationErrors();    
        if(errors){	  
            if(errors.length > 0){
                errors.forEach(function (errors1) {
                    var field1 = String(errors1.param); 
                    var msg = errors1.msg; 
                    errorData[field1] = msg;     
                });
            }  
            data.email = input.email; 
            data.password = input.password; 
            res.set('content-type' , 'text/html; charset=mycharset'); 
            res.render('admin/login',{page_title:"Admin - Login",data:data,errorData:errorData});   
        }else{  
            
            var email         = input.email;   
            var password      = input.password;      
            var role_id       = 0;   // 1 = customer , 2 = constructor       
            var device_token      = '12345';          
            var device_type      = 'ios';    
            Request.post({ 
                "headers": { "content-type": "application/json" },
                "url": siteUrl +"login", 
                "body": JSON.stringify({ 
                    "email": email, 
                    "password":password, 
                    "role_id":role_id,  
                    "device_token":device_token,   
                    "device_type":device_type,   
                })
            },(error, response, body) => { 
                if(error) {
                    console.log(error); 
                    //return console.dir(error);
                }    
                var retrunRes = JSON.parse(body); 
                if(retrunRes.status == 200){   
                    req.session.LoginUser = JSON.stringify(retrunRes.data);  
                    return res.redirect('Dashboard');     
                }else{  
                    data.email = input.email; 
                    data.password = input.password; 
                    errorData.email = retrunRes.message;   
                }    
                //return res.send(JSON.stringify(retrunRes));
                res.set('content-type' , 'text/html; charset=mycharset'); 
                res.render('admin/login',{page_title:"Admin - Login",data:data,errorData:errorData,controller:controller,action:action});   
            });
        } 
 
    }else{
        res.set('content-type' , 'text/html; charset=mycharset'); 
        res.render('admin/login',{page_title:"Admin - Login",data:data,errorData:errorData});  
    }   
};  
/** 
 *  dashboard
 *  Purpose: This function is used to show dashboard
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
async function dashboard(req, res) {  

    var action = 'login';
    res.set('content-type' , 'text/html; charset=mycharset'); 
    data = {}; LoginUser = {};errorData = {};
    res.render('admin/dashboard',{page_title:"Admin - Dashboard",data:data,LoginUser:LoginUser,controller:controller,action:action});   
    
};  
exports.dashboard = dashboard;


/** 
 *  logout
 *  Purpose: This function is used to logout
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
async function logout(req, res) {  
      
    res.set('content-type' , 'text/html; charset=mycharset'); 
    data = {}; LoginUser = {};errorData = {};
    if(req.session){
        req.session.destroy(function (err) {
            //res.redirect('/'); //Inside a callback… bulletproof!
            res.redirect(nodeAdminUrl+'/login');  
        });  
    }   
    res.redirect(nodeAdminUrl+'/login');     
};  
exports.logout = logout;

/**  
 *  updateBankDetail
 *  Purpose: This function is used to updateBankDetail
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
async function submitReview(req, res) { 
  // try {
        const { check, validationResult } = require('express-validator/check');
        var reaponseArr = '{}'; 
        var input = JSON.parse(JSON.stringify(req.body));  
        var auth_token = req.headers.authtoken; 
        //req.checkBody('contractor_id', 'contractor_id is required').notEmpty();
        req.checkBody('project_id', 'project_id is required').notEmpty();
        req.checkBody('rating', 'Rating is required').notEmpty();
        req.checkBody('reviewer_id', 'reviewer_id is required').notEmpty(); 
        //req.checkBody('review', 'review is required').notEmpty();   
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
            if(CheckAuthentication.length > 0){
                var constructor_id = '';
                const projectDetail = await Projects.getProjectById(input.project_id);  
                if(projectDetail.length > 0){ 
                    constructor_id = projectDetail[0].contractor_id;   
                    const checkUser = await Users.getUserByid(constructor_id);  
                    const customerDetail = await Users.getUserByid(projectDetail[0].user_id);   
                    if(checkUser.length > 0){ 

                        var reviewData = {  
                            user_id    : constructor_id,      
                            rating : input.rating,     
                            reviewer_id : input.reviewer_id, 
                            project_id : input.project_id,    
                        }; 
                        if (typeof input.review !== 'undefined' && input.review != null && input.review != '') {
                            reviewData.review = input.review;
                        } 
                        var msg =  'Review added successfully.'; 
                        var saveRecord = await Reviews.saveData(reviewData); 
                        //console.log(reviewData);      
                        if(saveRecord){ 

                            var rating = await Reviews.getOverallRating(constructor_id);               // Get avg rating 
                            var updateData = {is_rated : 1,id : input.project_id}; 
                            var rated = await Projects.updateById(updateData);                          // Update project status 
                            
                            var ratingData = {rating : parseFloat(rating).toFixed(1), user_id : constructor_id}        
                            var updateRating = await BussinessProfiles.updateRating(ratingData);      // Update overall rating  
                            
                            // Send notification to customer 
                            var notification_data = {
                                user_id : constructor_id,  
                                message : customerDetail[0].first_name+' submitted review on your project.',  
                                title : 'Review and rating.' , 
                                type : REVIEW_NOTIFICATION_TYPE,  
                                type_id : input.project_id, 
                                sender_id : input.reviewer_id 
                            }  
                            Auth.sendNotificationAndroid(notification_data,function(notificationResult){
                                //console.log(notificationResult);     
                            });   
                            return res.send(JSON.stringify({    
                                "status": successStatus, 
                                "message": msg,  
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
                            "message": 'Invalid user_id.',
                            "data": respondeArray  
                        })); 
                    }  
                }else{
                    return res.send(JSON.stringify({ 
                        "status": failStatus,  
                        "message": 'Invalid project_id.',
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
    // } catch (err) {
    //     return res.send(JSON.stringify({
    //         "status": failStatus,
    //         "message": err, 
    //     })); 
    // }  
    return false;  
}; 
exports.submitReview = submitReview;   
  