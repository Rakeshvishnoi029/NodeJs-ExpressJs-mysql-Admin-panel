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
var Settings = require.main.require('./models/Settings');         
/** 
	 *  signUp
     *  Purpose: This function is used for sign for cuctomer
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/
exports.signUp = function (req, res) { 

    const { check, validationResult } = require('express-validator/check'); 
    var input = JSON.parse(JSON.stringify(req.body));   
    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('last_name', 'Last name is required').notEmpty();
    req.checkBody('contact_number', 'Phone is required').notEmpty();  
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();  
    req.checkBody('role_id', 'role_id is required').notEmpty();    
    req.checkBody('role_id', 'Invalid role_id').isIn(['1', '2']);  
   
    var errors = req.validationErrors();  
		if(errors){	  		 
            return res.send(JSON.stringify({
                "status": 400,
                "message": errors[0].msg, 
            })); 	  		 
		}else{  
            connectPool.getConnection(function(err, connection) {
                if (err) {
                    connection.release();
                    console.log(' Error getting mysql_pool connection: ' + err);
                    throw err; 
                } 
            Request.post({   
                "headers": {"content-type": "application/json"}, 
                "url": siteUrl+"generatePassword", 
                "body": JSON.stringify({ 
                    "password":input.password
                })
            },(error, response, body) => {  
                if(error) {
                    return console.dir(error);
                } 
                var retrunRes = JSON.parse(body);  
                if(retrunRes.status == 200){   
                    var  password  = retrunRes.data.password; 
                    const Checksql = 'SELECT COUNT(*) AS cnt from users where email= ? '; 
                    connection.query(Checksql,input.email, function (error, results) {
                        connection.release(); 
                        if(error){
                            console.log(error);
                        }else if(results[0].cnt > 0){ 
                            return res.send(JSON.stringify({
                                "status": failStatus,
                                "message": 'Email already exist.', 
                            })); 
                        }else{ 
                        const checkPhoneNumber = 'SELECT COUNT(*) AS cnt from users where contact_number = ?'; 
                        connection.query(checkPhoneNumber,[input.contact_number], function (error, results) {
                            connection.release(); 
                            if(error){
                                console.log(error);
                            }else if(results[0].cnt > 0){ 
                                return res.send(JSON.stringify({
                                    "status": failStatus,
                                    "message": 'Phone number already exist.', 
                                }));
                            }else{      			
                                var randomstring = require("randomstring");
                                var activation_code = randomstring.generate(20);
                                var slug = randomstring.generate(15);   
  
                                var data = {
                                    role_id    : input.role_id,  
                                    activation_code : activation_code, 
                                    first_name   : input.first_name,
                                    last_name   : input.last_name, 
                                    email   : input.email, 
                                    password   : password,  
                                    contact_number   : input.contact_number,   
                                    slug   : slug,    
                                    is_approved   : 0,    
                                    is_email_verified   : 0,        
                                };     
                                connection.query("INSERT INTO users set ? ",data, function(error, results){ 
                                    connection.release();   
                                    if (error) throw error;  
                                         
                                    // Send mail to user 
                                    var mailData = {
                                        'receiver_id' :  results.insertId,
                                        'template_slug' : 'email-verification'
                                    }   
                                    var responseArr = { 
                                        'user_id' : results.insertId, 
                                    } 

                                    Mails.SendMail(mailData); 
                                    
                                    return res.send(JSON.stringify({ 
                                        "status": successStatus,
                                        "message": 'Registration successful. We have sent a verification email to registered email. Please click on the link for email verification.', 
                                        "data": responseArr,       
                                    }));        
                                }); 
                            }
                         }); 
                        }    
                    });
                    
                }else{
                    return res.send(JSON.stringify({
                        "status": 401,
                        "message": 'Invalid response',
                        "data": {},  
                    }));  
                } 
            });
        }); 
    }   
};
    
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
        
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('role_id', 'Role_id is required').notEmpty(); 
    req.checkBody('device_token', 'device_token is required').notEmpty(); 
    req.checkBody('device_type', 'device_type is required').notEmpty();  
    var errors = req.validationErrors();   
    if(errors){	  	 	 
        return res.send(JSON.stringify({
            "status": 400,
            "message": errors[0].msg, 
        }));
    }else{  
        var email         = input.email;   
        var password      = input.password;      
        var role_id      = input.role_id;   // 1 = customer , 2 = constructor       
        var device_token      = input.device_token;          
        var device_type      = input.device_type;   
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
                return console.dir(error);
            }    
            var retrunRes = JSON.parse(body); 
            return res.send(JSON.stringify(retrunRes));	
            
        });
    }  
}; 

async function test(req, res) {	 
    data = ''; 
    // const result1 = await Users.getCustomerListTest(data); 
    // console.log(result1[0].id); 
    // console.log('Execute 2 ');    
    // console.log('Execute 3 ');   
    // console.log('Execute 4 ');    
    // params = {
    //     id : result1[0].id 
    // }
   
    mailData = {
        user_id: 90,  
        message: 'This is test notification.', 
        title: 'This is test notification.',  
    }    
   // const response = await Auth.sendNotificationAndroid(mailData);  

     // Send notification to customer 
     var notification_data = { 
        user_id : 90,  
        message : 'New project has been created by the contractor.',
        title : 'New project has been created by the contractor.',
        type : PROJECT_NOTIFICATION_TYPE,  
        type_id : 5 
    }

    Auth.sendNotificationAndroid(notification_data,function(notificationResult){
        console.log(notificationResult);  
        return res.send(JSON.stringify({
            "status": successStatus, 
            "message": 'This is test .',  
            "data": notificationResult,           
        }));  
    });
     
    
    //console.log(response);
    //response = Common.sendNotificationAndroid(mailData); 
    //console.log(response);        
    // return res.send(JSON.stringify({
    //     "status": successStatus, 
    //     "message": 'This is test .',  
    //     "data": response,           
    // }));      
 
}
exports.test = test;
 
/** 
 *  constructorList
 *  Purpose: This function is used to get constructor List
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
async function constructorList(req, res) {  
    
    const { check, validationResult } = require('express-validator/check');   
    var input = JSON.parse(JSON.stringify(req.body));  
    var input = req.query;   
    var auth_token = req.headers.authtoken;   
    var errors = req.validationErrors();     
    var reaponseArr = {};   
    var constructorArr = {}; 
    if(!req.query.category_id){
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": 'Category Id is required.', 
        })); 
    }  
    if(errors){	  	 	 
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": errors[0].msg, 
        })); 
    }if(!auth_token){   	 		 
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,
            "message": 'Session Expired.',  
        }));	  		 
    }else{  
 
        let page = (input.page != '' ) ? input.page : 1;  
        let offset =  String((page-1)*pageLimit);
        filter_data = {}; 
        var locationCondition = '';  
        
        if(input.latitude && input.latitude != null && input.longitude && input.longitude != null){
            console.log(input.longitude);
              
            filter_data.latitude = input.latitude;
            filter_data.longitude = input.longitude; 
            if(input.search_text && input.search_text != null){  
                filter_data.search_text = input.search_text; 
            } 
            let ids = ''; 
            
            // Get default distance  
            const setting = await Settings.getDetail();
            const stores = await BussinessLocations.getLocationsByCordinates(filter_data , setting[0].search_distance);   
           // console.log(stores);  
            if(stores){   
                let storeIds = [];
                let count = 0; 
                if(stores.length > 0){
                    stores.forEach(function (item, key) {
                        count++; 
                       if(count  == stores.length){
                            ids += item.user_id; 
                       }else{
                            ids += item.user_id+','; 
                       }
                    });  
                    console.log(ids); 
                    if(ids != null){ 
                        locationCondition = ' AND users.id IN ('+ids+') ';    
                    } 
                }else{

                    reaponseArr = { 
                        'total_record' :  String(0), 
                        'total_page' : String(0), 
                        'current_page' : page,  
                        'user_list' : reaponseArr 
                    }      
                    return res.send(JSON.stringify({  
                        "status": successStatus, 
                        "message": 'Record found.',
                        "data": reaponseArr
                    }));  
                } 
            }else{

                reaponseArr = { 
                    'total_record' :  String(0), 
                    'total_page' : String(0), 
                    'current_page' : page,  
                    'user_list' : {}
                }      
                return res.send(JSON.stringify({  
                    "status": successStatus, 
                    "message": 'Record found.',
                    "data": reaponseArr
                }));  
                console.log(' Loctaion not found ');  
            } 
        }
        
        //  Check location search    
        connectPool.query("SELECT COUNT(*) AS count  from users where auth_token = ?",[auth_token], function (error, results) {      
            if(error){
                console.log(error);  
            }else if(results[0].count == 1){  
  
                var SORT_BY = 'ORDER BY `users`.`id` ASC';
                if(input.sort=='rating_low_to_high'){
                     SORT_BY = 'ORDER BY `bussiness_profile`.`overall_rating` ASC'; 
                }else if(input.sort=='rating_high_to_low'){ 
                      SORT_BY = 'ORDER BY `bussiness_profile`.`overall_rating` DESC';
                }    
                var execute = 0;
                var WHERECONDITION = ' users.is_active = 1 AND users.is_approved = 1 AND users.is_deleted = 0 AND users.role_id = '+ConstructorRole+' '; 
     
                if(req.query.category_id){
                    WHERECONDITION += ' AND bussiness_profile.category_id = '+req.query.category_id+' '; 
                }   
                if(locationCondition != null){ 
                   // WHERECONDITION += locationCondition;  
                }   
                var joinSql = 'SELECT users.id,users.first_name,users.profile_pic,users.email,   bussiness_profile.overall_rating,bussiness_profile.company_name, bussiness_profile.account_type,bussiness_profile.category_id,categories.title from users LEFT JOIN bussiness_profile ON (bussiness_profile.user_id = users.id)  LEFT JOIN categories ON (categories.id = bussiness_profile.category_id) WHERE '+WHERECONDITION + SORT_BY+' LIMIT '+pageLimit+' OFFSET '+offset;    
                 
                var countSql = 'SELECT users.id,users.first_name,users.profile_pic,  bussiness_profile.overall_rating from users LEFT JOIN bussiness_profile ON (bussiness_profile.user_id = users.id) WHERE '+WHERECONDITION;        
                //console.log(countSql); return true;

                connectPool.query(countSql, function (error, countResult) {    
                      
                    if(error){  
                        console.log(error);
                        return res.send(JSON.stringify({  
                            "status": failStatus, 
                            "message": error,
                            "data": '{}',    
                        })); 
                    } else {    
                        connectPool.query(joinSql, function (error, Queryresults) {     
                            if(error){ 
                                console.log(error);
                                return res.send(JSON.stringify({  
                                    "status": failStatus, 
                                    "message": error,
                                    "data": '{}',    
                                })); 
                            } else {   
                                reaponseArr = []; 
                                if(Queryresults){  
                                    Queryresults.forEach(function (item, key) {
                                        constructorArr = {}; 
                                        constructorArr.id = String(item.id);  
                                        constructorArr.name = String(item.first_name);   
                                        constructorArr.rating = item.overall_rating != null ? String(item.overall_rating) : '0';    
                                        constructorArr.account_type = String(item.account_type);        
                                        constructorArr.category_name = String(item.title);          
                                        constructorArr.company_name = item.company_name != null ? String(item.company_name) : '';        
                                        if(item.profile_pic != null){ 
                                            constructorArr.profile_pic = WebsiteURL + 'public/upload/user_images/' + item.profile_pic;  
                                        }else{      
                                            constructorArr.profile_pic = noImageConstructor; 
                                        }   
                                        reaponseArr.push(constructorArr);       
                                    }); 
                                }  
                                total_page = parseInt(countResult.length/pageLimit);
                                if(total_page == 0){
                                    total_page =1; 
                                }
                                if(page==0){
                                    page = 1; 
                                } 
                                reaponseArr = { 
                                    'total_record' :  String(countResult.length), 
                                    'total_page' : String(total_page), 
                                    'current_page' : page, 
                                    'user_list' : reaponseArr
                                }      
                                return res.send(JSON.stringify({  
                                    "status": successStatus, 
                                    "message": 'Record found.',
                                    "data": reaponseArr
                                })); 
                            }
                        }); 
                    }
                }); 
                   
            }else{   
                
                return res.send(JSON.stringify({ 
                    "status": SessionExpireStatus,  
                    "message": 'Session Expired.',
                    "data": reaponseArr  
                }));    
            } 
        });  
    }   
};  
exports.constructorList = constructorList;


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
  
/** 
 *  projectList
 *  Purpose: This function is used to get projectList
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: JSON  
*/  
exports.projectList = function (req, res) {  
    try {
        const { check, validationResult } = require('express-validator/check');   
        var input = JSON.parse(JSON.stringify(req.body)); 
        var input = req.query;   
        var auth_token = req.headers.authtoken;   
        var errors = req.validationErrors();     
        var reaponseArr = {};    
        var projectglobalArr = [];   
        var constructorArr = {}; 

        if(!req.query.user_id){
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'User Id is required.', 
            }));
        } 
        if(errors){	  	  	  
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": errors[0].msg, 
            })); 
        }if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{     

            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication 
                if(authResult.success){ 
                    let page = (input.page >0 ) ? input.page : 1;    
                    let offset =  String((page-1)*pageLimit); 
                    Auth.CheckCustomerExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){  
                            data = {
                                user_id:input.user_id,
                                offset:offset,
                                limit:pageLimit
                            }    
                            Projects.getCustomerProjectCount(data,function(projectsCount){ 
                                if(projectsCount){   
                                    Projects.getCutomerProjects(data,function(projects){ 
                                        if(projects){ 
                                            projects.forEach(function (item, key) {
                                                dataArr = {};
                                                dataArr.project_id = String(item.id); 
                                                dataArr.project_title = String(item.title);
                                                dataArr.description = String(item.description); 
                                                dataArr.amount = CURRENCY+String(item.amount);  
                                                dataArr.status = (item.status == 1) ? 'Pending' : 'Completed';  
                                                dataArr.created_date = moment(item.created_at).format('YYYY-MM-DD hh:mm:ss');    
                                                projectglobalArr.push(dataArr);      
                                            });    
                                        } 
                                    var total_record = projectsCount[0].count
                                        if(parseInt(total_record) <= parseInt(pageLimit)){
                                            var  total_page = 1;     
                                        }else{
                                            var  total_page = (total_record/pageLimit); 
                                            if(total_page % 1 != 0){
                                                if(total_page % 1 != 0){
                                                    total_page = total_page-(total_page % 1)+1;  
                                                }  
                                            }      
                                        } 
                                        reaponseArr = {  
                                            'total_record' :  String(total_record), 
                                            'total_page' : String(total_page),   
                                            'current_page' : page, 
                                            'project_list' : projectglobalArr
                                        }  
                                        return res.send(JSON.stringify({ 
                                            "status": successStatus, 
                                            "message": 'Project list', 
                                            "data": reaponseArr,  
                                        }));   
                                    });
                                }else{ 
                                    reaponseArr = { 
                                        'total_record' :  String(0), 
                                        'total_page' : String(0),  
                                        'current_page' : page, 
                                        'project_list' : projectglobalArr
                                    }  
                                    return res.send(JSON.stringify({ 
                                        "status": successStatus, 
                                        "message": 'No record found',
                                        "data": reaponseArr,  
                                    })); 
                                }  
                            });  
                        }else{
                            return res.send(JSON.stringify({ 
                                "status": failStatus,  
                                "message": 'Invalid user_id.',
                                "data": reaponseArr  
                            }));   
                        }
                    });  
                }else{    
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": reaponseArr  
                    }));    
                }  
            });   
        } 
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    }   
};  

/** 
 *  transactionHistory
 *  Purpose: This function is used to get transactionHistory
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: JSON 
*/  
exports.transactionHistory = function (req, res) {  

    try {
        const { check, validationResult } = require('express-validator/check');   
        var input = JSON.parse(JSON.stringify(req.body)); 
        var input = req.query;   
        var auth_token = req.headers.authtoken;   
        var errors = req.validationErrors();     
        var reaponseArr = {};    
        var globalArr = [];   
        var constructorArr = {}; 

        if(!req.query.user_id){
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'User Id is required.', 
            }));
        } 
        if(errors){	  	  	  
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": errors[0].msg, 
            }));    
        }if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	   		 
        }else{   
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication 
                if(authResult.success){ 
                    let page = (input.page >0 ) ? input.page : 1;    
                    let offset =  String((page-1)*pageLimit); 
                    Auth.CheckCustomerExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){ 
                            data = {
                                user_id:input.user_id,
                                offset:offset,
                                limit:pageLimit,
                                join:'constructor' 
                            }    
                            Transactions.getTransactionCount(data,function(recordCount){ 
                                if(recordCount){   
                                    Transactions.getTransactions(data,function(records){ 
                                        if(records){ 
                                            records.forEach(function (item, key) {
                                                dataArr = {};
                                                dataArr.transaction_id = String(item.transaction_id);    
                                                dataArr.milestone_title = (item.milestone_title != null) ? String(item.milestone_title) : '';   
                                                dataArr.project_title = (item.project_title != null) ? String(item.project_title) : '';   
                                                dataArr.constructor_name = (item.constructor_name != null) ? String(item.constructor_name) : '';   
                                                dataArr.amount = String(CURRENCY+item.amount);   
                                                dataArr.milestone_title = String(item.milestone_title);    
                                                dataArr.status = (item.status == 1) ? 'Pending' : 'Completed';  
                                                //dataArr.payment_type = (item.status == 1) ? 'Pending' : 'Completed';  
                                                dataArr.created_date = moment(item.created_at).format('YYYY-MM-DD hh:mm:ss');    
                                                globalArr.push(dataArr);      
                                            });         
                                        }   
                                    var total_record = recordCount[0].count
                                        if(parseInt(total_record) <= parseInt(pageLimit)){
                                            var  total_page = 1;     
                                        }else{
                                            var  total_page = (total_record/pageLimit); 
                                            if(total_page % 1 != 0){
                                                total_page = (total_record/pageLimit,2)+1; 
                                            }    
                                        } 
                                        reaponseArr = {   
                                            'total_record' :  String(total_record), 
                                            'total_page' : String(total_page),   
                                            'current_page' : page, 
                                            'project_list' : globalArr 
                                        }  
                                        return res.send(JSON.stringify({ 
                                            "status": successStatus, 
                                            "message": 'Transaction history', 
                                            "data": reaponseArr,  
                                        }));   
                                    });
                                }else{ 
                                    reaponseArr = { 
                                        'total_record' :  String(0), 
                                        'total_page' : String(0),  
                                        'current_page' : page, 
                                        'project_list' : globalArr
                                    }  
                                    return res.send(JSON.stringify({ 
                                        "status": successStatus, 
                                        "message": 'No record found',
                                        "data": reaponseArr,  
                                    })); 
                                }  
                            });  
                        }else{
                            return res.send(JSON.stringify({ 
                                "status": failStatus,  
                                "message": 'Invalid user_id.',
                                "data": reaponseArr  
                            }));   
                        }
                    });  
                }else{    
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": reaponseArr  
                    }));    
                }  
            });   
        } 
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    }   
}; 
   
 

/** 
 *  constructorDetail
 *  Purpose: This function is used to get constructorDetail
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.constructorDetail = function (req, res) { 


    try {
        const { check, validationResult } = require('express-validator/check');   
        var input = JSON.parse(JSON.stringify(req.body));  
        var auth_token = req.headers.authtoken;   
        req.checkBody('user_id', 'Constructor_id is required').notEmpty();
        var errors = req.validationErrors();    
        var reaponseArr = [];  
        var constructorArr = {};   
        if(errors){	  	 	 
            return res.send(JSON.stringify({
                "status": failStatus, 
                "message": errors[0].msg, 
            })); 
        }if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{    
            connectPool.query("SELECT COUNT(*) AS count  from users where auth_token = ?",[auth_token], function (error, results) {   
                if(error){
                    console.log(error);  
                }else if(results[0].count == 1){  
                    
                    var WHERE_CONDITINS = "WHERE users.role_id ="+ConstructorRole+" AND users.id = '"+input.user_id+"'"; 
                    var joinSql = 'SELECT users.*, bussiness_profile.*  from users LEFT JOIN bussiness_profile ON (bussiness_profile.user_id = users.id) LEFT JOIN categories ON (categories.id = bussiness_profile.category_id) '+WHERE_CONDITINS;     
                        
                    connectPool.query(joinSql, function (error, UserDetail) {    
                        if(error){ 
                            console.log(error);
                            return res.send(JSON.stringify({ 
                                "status": failStatus, 
                                "message": error,
                                "data": '{}',    
                            })); 
                        } else {     
                        
                            if(UserDetail.length > 0){    
                                // Get Profile images  
                                var imageArr = []; 
                                var bussinessImagesSql = 'SELECT `id`,`image`,`is_default`,`user_id` from bussiness_images where `user_id` = '+input.user_id; 
                                connectPool.query(bussinessImagesSql, function (error, bussinessImages) { 
                                    if(error){ 
                                        console.log(error); 
                                    }else if(bussinessImages.length > 0){
                                        bussinessImages.forEach(function (item, key) { 
                                            var images = {};
                                            images.id = String(item.id); 
                                            images.image = WebsiteURL + 'public/upload/user_images/' + item.image;
                                            imageArr.push(images); 
                                        });   
                                    }  
                                    // Get Profile location  
                                    var locationArr = []; 
                                    var bussenessLocationsSql = 'SELECT * from bussiness_locations where `user_id` = '+input.user_id; 
                                    connectPool.query(bussenessLocationsSql, function (error, bussenessLocations) { 
                                        if(error){   
                                            console.log(error); 
                                        }else if(bussenessLocations.length > 0){
                                            bussenessLocations.forEach(function (item, key) { 
                                                var data = {};
                                                data.id = String(item.id);
                                                data.address = item.address; 
                                                data.contact_number = item.contact_number; 
                                                data.contact_email = item.contact_email; 
                                                data.pincode = item.pincode; 
                                                data.latitude = item.latitude; 
                                                data.longitude = item.longitude; 
                                                data.state = item.state;    
                                                data.city = item.city;  
                                                data.country = item.country;   
                                                locationArr.push(data);  
                                            });    
                                        }
                                        
                                        var profile_image = noImageConstructor;
                                        if(UserDetail[0].profile_pic != null){ 
                                            profile_image = WebsiteURL + 'public/upload/user_images/' + UserDetail[0].profile_pic;  
                                        }  
                                        reaponseArr = {    
                                            id : input.user_id, 
                                            first_name : UserDetail[0].first_name,   
                                            last_name : UserDetail[0].last_name,   
                                            rating : (UserDetail[0].overall_rating != null ? String(UserDetail[0].overall_rating) : ''),    
                                            bank_account_number : (UserDetail[0].bank_account_number != null ? String(UserDetail[0].bank_account_number) : ''),     
                                            company_name : UserDetail[0].company_name,      
                                            address : (UserDetail[0].address != null ? UserDetail[0].address : ''),  
                                            contact_number : (UserDetail[0].contact_number != null ? UserDetail[0].contact_number : ''),      
                                            email : UserDetail[0].email,        
                                            description : UserDetail[0].services,    
                                            profile_image : profile_image,      
                                            category_id : String(UserDetail[0].category_id),     
                                            account_type : String(UserDetail[0].account_type),      
                                            images :  imageArr, 
                                            locations : locationArr 
                                        }      
                                        return res.send(JSON.stringify({  
                                            "status": successStatus, 
                                            "message": 'Record found.',
                                            "data": reaponseArr, 
                                        }));   
                                    }); 
                                    
                                });  

                            }else{  

                                return res.send(JSON.stringify({ 
                                    "status": successStatus, 
                                    "message": 'Invalid user_id.',
                                    "data": reaponseArr,  
                                })); 
                            }  
    
                        }
                    });  
                }else{   
                    
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": reaponseArr  
                    }));    
                } 
            });  
        } 
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    }   
};   
 
/** 
	 *  getProfile
     *  Purpose: This function is used for getProfile
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/ 
async function getProfile(req, res){


//exports.getProfile = function (req, res) { 
    try {
        const { check, validationResult } = require('express-validator/check');  
        var input = req.query;   
        var auth_token = req.headers.authtoken;    
        var errors = req.validationErrors();    
        var reaponseArr = {};   
        if(!input.user_id){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'User Id is required.', 
            }));
        }   
        if(errors){	  	 	 
            return res.send(JSON.stringify({
                "status": failStatus, 
                "message": errors[0].msg, 
            })); 
        }
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		  
        }else{    
 
            const CheckAuthentication = await Users.CheckAuthentication(auth_token);   // Check Authentication  
            if(CheckAuthentication.length > 0){
            
                Auth.CheckAuth(auth_token, function(authResult){   // check Authentication
                    
                    const sql = "SELECT * from users WHERE id = ?";
                    connectPool.query(sql,[input.user_id], function (error, getUserProfile) { 
                        if(error){
                            console.log(error);
                        }else if(getUserProfile !=''){ 
                            if(getUserProfile[0].profile_pic != null){
                                userProfile = WebsiteURL + 'public/upload/user_images/' + getUserProfile[0].profile_pic;
                            }else{ 
                                userProfile = noImageUsers;
                            } 
                            userData = {
                                user_id             :   getUserProfile[0].id,   
                                firstName           :   getUserProfile[0].first_name,    
                                lastName            :   getUserProfile[0].last_name,    
                                email               :   getUserProfile[0].email,    
                                contact_number      :   getUserProfile[0].contact_number, 
                                address             :   getUserProfile[0].address,    
                                profile_image       :   userProfile,     
                            };  
                            return res.send(JSON.stringify({
                                "status": 200,
                                "message":'User profile list.',
                                "data":userData
                            })); 
                    }else{
                            return res.send(JSON.stringify({ 
                                "status": 500,
                                "message":'Session Expired.',
                                "data":reaponseArr 
                            })); 
                        }
                    });  
                }); 
            }else{
                return res.send(JSON.stringify({ 
                    "status": SessionExpireStatus,
                    "message": 'Session expired.',   
                })); 
            }  
        } 
    } catch (err) { 
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
            "data":reaponseArr 
        })); 
    }       
};
exports.getProfile = getProfile;

/** 
	 *  updateUserProfile
     *  Purpose: This function is used for updateUserProfile
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/
exports.updateUserProfile = function (req, res) {  
   
    try { 
        const { check, validationResult } = require('express-validator/check');
        var reaponseArr = {}; 
        var input = JSON.parse(JSON.stringify(req.body));  
        var auth_token = req.headers.authtoken; 
        req.checkBody('user_id', 'user_id is required').notEmpty();
        req.checkBody('first_name', 'First name is required').notEmpty();
        req.checkBody('last_name', 'Last name is required').notEmpty();
        req.checkBody('contact_number', 'Phone is required').notEmpty();  
        req.checkBody('email', 'Email is not valid').isEmail();    
    
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
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication 
                if(authResult.success){ 
                    var responseArr = {};
                    Auth.CheckCustomerExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){
                            
                            var profile_data = { 
                                first_name    : input.first_name,    
                                last_name : input.last_name,        
                                contact_number : input.contact_number,  
                            }; 

                            // Upload Image 
                            profile_image  = ''; 
                            if (req.files && req.files.profile_pic !== "undefined") { 
                                let profile_pic = req.files.profile_pic;  
                                var timestamp = new Date().getTime();    
                                filename = timestamp+'-'+profile_pic.name;   
                                profile_pic.mv('public/upload/'+filename, function(err) {
                                    if (err){   
                                        console.log(err);    
                                    }else{ 
                                        image_data = {
                                            filename :filename,
                                            imagePath : nodeSiteUrl+'/upload/'+filename
                                        }  
                                        Auth.UploadImageToserver(image_data, function(uploadResult){ 
                                            if(uploadResult.success){
                                                profile_data.profile_pic = filename; 
                                            }  
                                            profile_data.id =  input.user_id;  
                                            Users.updateDataById(profile_data,function(userDetail){ 
                                                data = { 
                                                    id :input.user_id, 
                                                }  
                                                Users.getUserDetail(data,function(userDetail){ 
                                                    if(userDetail){ 
                                                        var responseArr = {   
                                                            user_id : input.user_id,  
                                                            first_name    : input.first_name,    
                                                            last_name : input.last_name,        
                                                            contact_number : input.contact_number, 
                                                            email : input.email,
                                                            contact_number : input.contact_number,
                                                            profile_pic : WebsiteURL + 'public/upload/user_images/' + userDetail[0].profile_pic
                                                        }    
                                                        return res.send(JSON.stringify({  
                                                            "status": successStatus,
                                                            "message": 'User detail updated successfully.', 
                                                            "data": responseArr,       
                                                        })); 
                                                    }
                                                });  
                                                            
                                            });  
                                        });   
                                    }     
                                });
                            }else{
                                    // Save bussiness profile 
                                    profile_data.id =  input.user_id;  
                                    Users.updateDataById(profile_data,function(userDetail){ 
                                    data = { 
                                        id :input.user_id, 
                                    }   
                                    Users.getUserDetail(data,function(userDetail){    
                                        //console.log(userDetail);         
                                        if(userDetail){ 
                                            var responseArr = {   
                                                user_id : input.user_id,  
                                                first_name    : input.first_name,    
                                                last_name : input.last_name,        
                                                contact_number : input.contact_number, 
                                                email : input.email,
                                                contact_number : input.contact_number,
                                                profile_pic : WebsiteURL + 'public/upload/user_images/' + userDetail[0].profile_pic
                                            }    
                                            return res.send(JSON.stringify({  
                                                "status": successStatus,
                                                "message": 'User detail updated successfully.', 
                                                "data": responseArr,       
                                            })); 
                                        } 
                                    });         
                                });   
                            }   
                        }else{
                            return res.send(JSON.stringify({ 
                                "status": failStatus,  
                                "message": 'Invalid user_id.',
                                "data": reaponseArr  
                            }));  
                        }  
                    }); 
                }else{
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": reaponseArr  
                    }));  
                } 
            });  
        }
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    }   
};
  
/** 
 *  projectDetail
 *  Purpose: This function is used to get projectDetail
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
async function projectDetail(req, res){
//exports.projectDetail = function (req, res) { 
    try {
        const { check, validationResult } = require('express-validator/check');   
        var input = req.query; 
        var auth_token = req.headers.authtoken;    
        var errors = req.validationErrors();    
        var reaponseArr = [];   

        if(!input.project_id){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'Project id is required.', 
            }));
        } 
        if(errors){	  	 	 
            return res.send(JSON.stringify({
                "status": failStatus, 
                "message": errors[0].msg, 
            })); 
        }if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{ 
            var is_membership_active = "0";
            var projectDetail = await Projects.getProjectById(input.project_id);    
            if(projectDetail[0].contractor_id){   
                checkMembership =  await BussinessProfiles.checkMembership(projectDetail[0].contractor_id);  
                if(checkMembership.length > 0){
                    is_membership_active = "1";
                }      
            }  
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                if(authResult.success){ 
                    var responseArr = {};
                    params = {
                        id:input.project_id,
                        join : 'contractor' 
                    }
                    Projects.getProjectDetail(params, function(projectDetail){     
                        if(projectDetail){  
                                // Get milestone
                                milestoneArr = [];
                                params1 = {
                                    project_id:projectDetail[0].id, 
                                }  
                                ProjectMilestones.getMilestonByProject(params1, function(projectMilestone){  
                                    milestoneArr1 = [];
                                    // get milestome Images  
                                    MilestoneImages.getMilestoneImages(params1, function(mileStoneImages){ 
                                        if(mileStoneImages){
                                            mileStoneImages.forEach(function (item, key) {    
                                                var mdata = {}; 
                                                mdata.id = String(item.id);
                                                mdata.project_milestone_id = String(item.project_milestone_id); 
                                                imageurl = '';
                                                if(item.image != null){  
                                                    imageurl  = WebsiteURL + 'public/upload/project_images/' + item.image;  
                                                } 
                                                mdata.image = imageurl;     
                                                if(!milestoneArr1[item.project_milestone_id]){   
                                                    milestoneArr1[item.project_milestone_id] = [];   
                                                }   
                                                milestoneArr1[item.project_milestone_id].push(mdata);  
                                            }); 
                                        } 
    
                                        if(projectMilestone && projectMilestone.length > 0){ 
                                            projectMilestone.forEach(function (item, key) {  
                                                var data = {};
                                                data.id = String(item.id);
                                                data.project_id = String(item.project_id); 
                                                data.title = item.title; 
                                                data.description =  (item.description != null ? item.description :  '');   
                                                data.amount = String(item.amount);   
                                                data.status = (item.status==1 ? 'Pending' : 'Completed');  
                                                data.created_date =  moment(item.created_at).format('YYYY-MM-DD hh:mm:ss');  
                                                data.images =  (milestoneArr1[item.id] ? milestoneArr1[item.id] : []);     
                                                milestoneArr.push(data);     
                                            });  
                                        }  
                                        var documentUrl = '';  
                                        if(projectDetail[0].document != null){
                                            documentUrl  = WebsiteURL + 'public/upload/project_images/' + projectDetail[0].document; 
                                        }  
                                        reaponseArr = {    
                                            id : String(projectDetail[0].id),  
                                            title : projectDetail[0].title,       
                                            amount : CURRENCY+projectDetail[0].amount,        
                                            description : projectDetail[0].description,       
                                            status : (projectDetail[0].status==2 ? 'Completed' : 'Pending'),       
                                            constructor_name : projectDetail[0].first_name+' '+projectDetail[0].last_name,       
                                            document :  documentUrl,  
                                            is_rated :  projectDetail[0].is_rated!= null ? String(projectDetail[0].is_rated) : '',    
                                            project_created_date :  moment(projectDetail[0].created_at).format('YYYY-MM-DD hh:mm:ss'),  
                                            is_membership_active : is_membership_active,  
                                            milestones : milestoneArr     
                                        }       
                                        return res.send(JSON.stringify({  
                                            "status": successStatus, 
                                            "message": 'Record found.',
                                            "data": reaponseArr, 
                                        }));    
                                    });   
                                    
                                }); 

                        }else{ 
                            return res.send(JSON.stringify({
                                "status": failStatus, 
                                "message": 'Invalid project Id.', 
                            })); 
                        }
                    });
                }else{
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": reaponseArr  
                    })); 
                }
                
            });   
        } 
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    }   
}; 
exports.projectDetail = projectDetail;
 

/** 
 *  projectList
 *  Purpose: This function is used to get projectList
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: JSON 
*/  
exports.notifications = function (req, res) {  
    try {
        const { check, validationResult } = require('express-validator/check');   
        var input = req.query;   
        var auth_token = req.headers.authtoken;   
        var errors = req.validationErrors();     
        var reaponseArr = {};   
        var globalArr = [];    
        var constructorArr = {}; 

        if(!req.query.user_id){
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'User Id is required.', 
            }));
        } 
        if(errors){	  	  	  
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": errors[0].msg, 
            })); 
        }if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{   
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication 
                if(authResult.success){ 
                    let page = (input.page >0 ) ? input.page : 1;    
                    let offset =  String((page-1)*pageLimit); 
                    Auth.CheckCustomerExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){  
                            data = {
                                user_id:input.user_id,
                                offset:offset,
                                limit:pageLimit
                            }     
                            Notifications.getDataCount(data,function(dataCount){ 
                                if(dataCount){ 
                                    Notifications.getData(data,function(notifications){ 
                                        if(notifications){ 
                                            notifications.forEach(function (item, key) {  
                                                dataArr = {};
                                                dataArr.project_id = String(item.project_id); 
                                                dataArr.project_title = String(item.title); 
                                                dataArr.notification_title = String(item.notification_title);
                                                dataArr.message = String(item.message); 
                                                if(item.title != null){
                                                    dataArr.project_title = String(item.title); 
                                                }else{
                                                    dataArr.project_title = ''; 
                                                } 
                                                dataArr.created_at = moment(item.created_at).format('YYYY-MM-DD hh:mm:ss');    
                                                globalArr.push(dataArr);       
                                            });    
                                        } 
                                        var total_record = dataCount[0].count; 
                                        if(parseInt(total_record) <= parseInt(pageLimit)){
                                            var  total_page = 1;     
                                        }else{ 
                                            var  total_page = (total_record/pageLimit);  
                                            if(total_page % 1 != 0){
                                                total_page = (total_record/pageLimit,2)+1; 
                                            }    
                                        }  
                                        reaponseArr = {  
                                            'total_record' :  String(total_record), 
                                            'total_page' : String(total_page),   
                                            'current_page' : page, 
                                            'project_list' : globalArr
                                        }  
                                        return res.send(JSON.stringify({ 
                                            "status": successStatus, 
                                            "message": 'Project list', 
                                            "data": reaponseArr,  
                                        }));   
                                    });
                                }else{ 
                                    reaponseArr = { 
                                        'total_record' :  String(0), 
                                        'total_page' : String(0),  
                                        'current_page' : page, 
                                        'project_list' : globalArr
                                    }  
                                    return res.send(JSON.stringify({ 
                                        "status": successStatus, 
                                        "message": 'No record found',
                                        "data": reaponseArr,  
                                    })); 
                                }  
                            });  
                        }else{
                            return res.send(JSON.stringify({ 
                                "status": failStatus,  
                                "message": 'Invalid user_id.',
                                "data": reaponseArr  
                            }));   
                        }
                    });  
                }else{    
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": reaponseArr  
                    }));    
                }  
            });  
        } 
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    }  
}; 
 
/** 
     *  purchaseHistory
     *  Purpose: This function is used for list purchase history
     *  Pre-condition:  None
     *  Post-condition: None. 
     *  Parameters: ,
     *  Returns: void 
*/
exports.purchaseHistory = function (req, res) {
    
    try {
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
            let sql = 'SELECT `id` AS `orderDetailsId`,`deal_id`,`user_id`,`store_id`,`coupon_code`,`barcode`,`title`,`description`,`category`,`sub_category`,`price`,`quantity`,`discount_price`,`discounted_price`,`admin_deal_discount`,`store_amount` FROM `order_details` WHERE `user_id` = ? '; 
            connectPool.query(sql,userId, function (error, orderDetails) {
                if(error){
                        console.log(error);
                }else if(orderDetails !=''){  
                    return res.send(JSON.stringify({
                        "status": 200, 
                        "message": 'Purchase history', 
                        "data": orderDetails, 
                    })); 
                }else{                        
                    return res.send(JSON.stringify({
                        "status": 400, 
                        "message": 'No record found.', 
                    }));   
                }  
            });  
        }
    } catch (err) { 
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    } 
}; 

/**  
 *  updateBankDetail
 *  Purpose: This function is used to updateBankDetail
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/ 
const { Subcription } = require('../sequelize')
async function getSubscription(req, res) { 
     
    Subcription.findAll({ include: [SQMembershipTransactions]}).then(Subcription => res.json({
        "status": 200, 
        "message": 'Purchase history', 
        "data": Subcription, 
    })).catch(function(e){
        console.log(e);
    });    
    //const test = () => Subcription.findAll(); 
    //Subcription.findAll({ include: [SQMembershipTransactions]}, {raw: true}).success(Subcription);    
    //console.log(test)      
    
    // return res.send(JSON.stringify({
    //     "status": 200,   
    //     "message": 'Purchase history', 
    //     "data": test,  
    // }));  
}; 
exports.getSubscription = getSubscription;