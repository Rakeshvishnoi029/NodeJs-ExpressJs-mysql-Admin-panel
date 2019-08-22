var Request = require("request");
var Projects = require.main.require('./models/Projects');  
var ProjectMilestones = require.main.require('./models/ProjectMilestones');   
var Users = require.main.require('./models/Users');   
var Notifications = require.main.require('./models/Notifications');  
var MilestoneImages = require.main.require('./models/MilestoneImages');     
var BussinessImages = require.main.require('./models/BussinessImages');      
var BussinessLocations = require.main.require('./models/BussinessLocations');       
var BussinessProfiles = require.main.require('./models/BussinessProfiles');        
var Transactions = require.main.require('./models/Transactions');         
var MembershipTransactions = require.main.require('./models/MembershipTransactions');         
var Settings = require.main.require('./models/Settings');             

exports.signUp = function (req, res) { 

    try {
        const { check, validationResult } = require('express-validator/check');
        
        var input = JSON.parse(JSON.stringify(req.body));   
        req.checkBody('first_name', 'First name is required').notEmpty();
        req.checkBody('last_name', 'Last name is required').notEmpty();
        req.checkBody('contact_number', 'Phone is required').notEmpty();  
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();  
        req.checkBody('role_id', 'role_id is required').notEmpty();    
        req.checkBody('role_id', 'Invalid role_id').isIn(['1', '2']);  
        req.checkBody('company_name', 'Company name is required').notEmpty();   
        req.checkBody('account_type', 'Account type is required').notEmpty();   
        var errors = req.validationErrors();  
		if(errors){	  		 
            return res.send(JSON.stringify({
                "status": 400,
                "message": errors[0].msg, 
            })); 	  		 
		}else{  
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
                    connectPool.query(Checksql,input.email, function (error, results) { 
                        if(error){
                            console.log(error);
                        }else if(results[0].cnt > 0){ 
                            return res.send(JSON.stringify({
                                "status": failStatus,
                                "message": 'Email already exist.', 
                            })); 
                        }else{ 
                        const checkPhoneNumber = 'SELECT COUNT(*) AS cnt from users where contact_number = ?'; 
                        connectPool.query(checkPhoneNumber,[input.contact_number], function (error, results) { 
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
                                connectPool.query("INSERT INTO users set ? ",data, function(error, created_account){  
                                    if (error) throw error;  
                                    // Save bussiness profile 
                                    var data = {
                                        user_id : created_account.insertId, 
                                        account_type : input.account_type, 
                                        company_name : input.company_name
                                    } 
                                    connectPool.query("INSERT INTO bussiness_profile set ? ",data, function(error, bussinessprofile){   
                                        if (error) throw error;  
 
                                        // Send mail to user 
                                        var mailData = { 
                                            'receiver_id' :  created_account.insertId,
                                            'template_slug' : 'email-verification'
                                        }  
                                        Mails.SendMail(mailData); 
                                        console.log(mailData); 
                                        var responseArr = {
                                            'user_id' : String(created_account.insertId), 
                                        } 

                                        return res.send(JSON.stringify({ 
                                            "status": successStatus,
                                            "message": 'Registration successful. We have sent a verification email to registered email. Please click on the link for email verification.', 
                                            "data": responseArr,        
                                        }));      
                                    });     
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
        }   
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
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
    try {
        const { check, validationResult } = require('express-validator/check');   
        var input = JSON.parse(JSON.stringify(req.body)); 
               
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
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
            var device_token      = input.device_token;         
            var device_type      = input.device_type; 
            Request.post({  
                "headers": { "content-type": "application/json" },
                "url": siteUrl +"login", 
                "body": JSON.stringify({ 
                    "email": email,
                    "password":password,  
                    "role_id":2,     
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
    } catch (err) {
        return res.send(JSON.stringify({
            "status": failStatus,
            "message": err, 
        })); 
    } 
};


/** 
 *  logout
 *  Purpose: This function is used for logout user
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/
exports.logout = function (req, res) { 

    var userId   = req.body.userId;
    var auth     = req.headers.auth; 
		if(!userId){			 
            return res.send(JSON.stringify({
                "status": 400,
                "message": 'User id is required', 
            }));	  		
        }else if(!auth){			 
            return res.send(JSON.stringify({
                "status": 400,
                "message": 'Auth is required', 
            }));	  		
        }else{

            connectPool.getConnection(function(err, connection) {
                if (err) {
                    //connection.release();
                    console.log(' Error getting mysql_pool connection: ' + err);
                    throw err;
                }

            connection.query('SELECT COUNT(*) AS cnt  from users where id = ? AND oauth_token = ? ',[userId,auth], function (error, results) {
                connection.release(); 
                if(error){
                    console.log(error);
                }else if(results[0].cnt == 0){
                    return res.send(JSON.stringify({
                        "status": 500,
                        "message": 'Session Expired.', 
                    }));
                }else{
                    var updateOauth    = '';
                    var is_login        = 0;
                     var updateOauthSql = "UPDATE users SET oauth_token = "+'"'+updateOauth+'"'+ ",is_login =" +'"'+is_login+'"'+ " WHERE id = "+'"'+userId+'"' ;  
                    connection.query(updateOauthSql, function (error, updateToken) {
                        return res.send(JSON.stringify({
                            "status": 200,
                            "message": 'Logout Successfully.', 
                        })); 
                    }); 
                }
            });   
        });  
    }
};

  
/** 
 *  membershipList
 *  Purpose: This function is used to get membershipList
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void 
*/ 

async function membershipList(req, res) {  

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
        }if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{     
             
            let page = (input.page != '' ) ? input.page : 0; 
            let offset = (page * pageLimit);    
            var is_membership_active = "0"; 
            const getUserDetail = await Users.CheckAuthentication(auth_token);      
            var supportDetail = await Settings.getDetail(); 
            if(getUserDetail.length > 0){
                checkMembership =  await BussinessProfiles.checkMembership(getUserDetail[0].id);  
                if(checkMembership.length > 0){
                    is_membership_active = "1";
                }
            }  
             
            connectPool.query("SELECT COUNT(*) AS count  from users where auth_token = ?",[auth_token], function (error, results) {   
                //connection.release();   
                if(error){
                    console.log(error);  
                }else if(results[0].count == 1){      
                   
                        if(error)console.log(error);
                        connectPool.query('SELECT id,subscription_name,amount,no_transaction,days FROM subscription WHERE is_active = ? AND is_deleted = ?', [1, 0], function (error, Queryresults) {   
                        if(error){ 
                            console.log(error);
                            return res.send(JSON.stringify({ 
                                "status": failStatus, 
                                "message": error,
                                "data": '{}',  
                            })); 
                        } else {    

                            //console.log(Queryresults); 
                            if(Queryresults){
                                Queryresults.forEach(function (item, key) {
                                    membershipArr = {};
                                    membershipArr.id = String(item.id); 
                                    membershipArr.no_transaction = String(item.no_transaction);
                                    membershipArr.days = item.days >= 30 ? (item.days/30) +' Month' : item.days+' Days'; 
                                    membershipArr.subscription_name = String(item.subscription_name); 
                                    membershipArr.amount = String(item.amount);   
                                    reaponseArr.push(membershipArr);    
                                }); 
                            }   
                        }     
                        return res.send(JSON.stringify({ 
                            "status": successStatus, 
                            "is_membership_active": is_membership_active,  
                            "is_approved": getUserDetail[0].is_approved == 1 ? String(getUserDetail[0].is_approved) : "0", 
                            "email": supportDetail[0].primary_email != null ? String(supportDetail[0].primary_email) : "", 
                            "message": 'Membership list',     
                            "data": reaponseArr,  
                        }));    
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
exports.membershipList = membershipList;

   
/** 
 *  customerList
 *  Purpose: This function is used to get customerList 
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.customerList = function (req, res) { 
    try {
        const { check, validationResult } = require('express-validator/check');    
        var auth_token = req.headers.authtoken;    
        var errors = req.validationErrors();    
        var reaponseArr = [];    
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
                    var responseArr = {};
                    params = { 
                    }
                    Users.getCustomerList(params, function(customerList){    
                        if(customerList){ 
                            customerList.forEach(function(item , key){
                                reaponseArr1 = {   
                                    id : String(item.id),  
                                    name : item.first_name+' '+ item.last_name,   
                                } 
                                reaponseArr.push(reaponseArr1); 
                            });        
                            return res.send(JSON.stringify({  
                                "status": successStatus, 
                                "message": 'Record found.',
                                "data": reaponseArr, 
                            }));    
                        }else{ 
                            return res.send(JSON.stringify({
                                "status": failStatus, 
                                "message": 'Record not found.', 
                                "data": reaponseArr, 
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
 *  projectList
 *  Purpose: This function is used to get projectList
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: JSON 
*/  
exports.projectList = function (req, res) {  
     
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
        try{  
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication
                console.log(authResult); 
                if(authResult.success){ 
                    let page = (input.page >0 ) ? input.page : 1;    
                    let offset =  String((page-1)*pageLimit); 
                    Auth.CheckConstructorExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){ 

                            data = {
                                user_id:input.user_id,
                                offset:offset,
                                limit:pageLimit
                            }    
                            Projects.getProjectCount(data,function(projectsCount){
                                console.log(projectsCount[0].count);
                                if(projectsCount){  

                                    Projects.getProjects(data,function(projects){
                                        console.log(projects); 
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
                                                total_page = total_page-(total_page % 1)+1;  
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
        }catch (e) { 
            console.log(e);
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,  
                "message": e, 
                "data": reaponseArr  
            })); 
        }  
    }   
}; 


/** 
	 *  signUp
     *  Purpose: This function is used for sign for cuctomer
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/
async function addProject(req, res) { 
//exports.addProject = function (req, res) {  
    try{
        const { check, validationResult } = require('express-validator/check');
        var reaponseArr = '{}'; 
        var input = JSON.parse(JSON.stringify(req.body));   
        var auth_token = req.headers.authtoken; 
        req.checkBody('title', 'title is required').notEmpty();
        req.checkBody('description', 'Description name is required').notEmpty();
        req.checkBody('amount', 'Amount name is required').notEmpty();
        req.checkBody('customer_id', 'customer_id is required').notEmpty();   
        
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

            const getContractorDetail = await Users.getUserByid(input.contractor_id);      

            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication 
                if(authResult.success){ 
                    var responseArr = {};
                    Auth.CheckCustomerExists(input.customer_id, function(CheckUserExists){   
                        if(CheckUserExists.success){ 
                            var project_data = { 
                                title    : input.title,    
                                description : input.description,        
                                amount : input.amount, 
                                user_id : input.customer_id,    
                                contractor_id : input.contractor_id, 
                                status : 1,  
                                created_at: moment(Date.now()).format('YYYY-MM-DD hh:mm:ss'),   
                                updated_at: moment(Date.now()).format('YYYY-MM-DD hh:mm:ss')    
                            };     
                            // Upload Image 
                            profile_image  = ''; 
                            if (req.files && req.files.document !== "undefined") {   
                                let document = req.files.document;  
                                var timestamp = new Date().getTime();    
                                filename = timestamp+'-'+document.name;   
                                document.mv('public/upload/'+filename, function(err) {
                                    if (err){    
                                        console.log(err);    
                                    }else{ 
                                        image_data = {
                                            filename :filename,
                                            imagePath : nodeSiteUrl+'/upload/'+filename,
                                            // imagePath : nodeSiteUrl+'public/upload/'+filename,
                                            image_type : 'project_image'
                                        } 
                                        Auth.UploadImageToserver(image_data, function(uploadResult){ 
                                            if(uploadResult.success){
                                                project_data.document = filename; 
                                            }  
                                                // Save project detail
                                            Projects.saveData(project_data,function(projects){ 
                                                if(projects){   
                                                    if(projects.insertId){  
                                                        var milestoneArrglobal = [];   
                                                        var milestonesData =   JSON.parse(input.milestones);
                                                        console.log(milestonesData); 
                                                        if(milestonesData.length > 0){
                                                                milestonesData.forEach(function (item, key) { 
                                                                    milestoneArr = [];  
                                                                    milestoneArr.push(projects.insertId);  
                                                                    milestoneArr.push(input.contractor_id);  
                                                                    milestoneArr.push(item.customer_id); 
                                                                    milestoneArr.push(item.title);  
                                                                    milestoneArr.push(item.amount);   
                                                                    milestoneArr.push(1);     
                                                                    milestoneArr.push(moment(Date.now()).format('YYYY-MM-DD hh:mm:ss'));     
                                                                    milestoneArr.push(moment(Date.now()).format('YYYY-MM-DD hh:mm:ss'));      
                                                                    milestoneArrglobal.push(milestoneArr);     
                                
                                                                });   
                                                                // Save ProjectMilestones  detail
                                                                ProjectMilestones.saveData(milestoneArrglobal,function(resultMilestone){
                                                                    
                                                                    // Send notification to customer 
                                                                    var notification_data = {
                                                                        user_id : input.customer_id,  
                                                                        message : 'New project has been created by '+ getContractorDetail[0].first_name, 
                                                                        title : 'Project Created.' ,
                                                                        type : PROJECT_NOTIFICATION_TYPE,
                                                                        type_id : projects.insertId
                                                                    } 
                                                                    Auth.sendNotificationAndroid(notification_data,function(notificationResult){
                                                                        console.log(notificationResult);    
                                                                    });   
                                                                    
                                                                    return res.send(JSON.stringify({ 
                                                                        "status": successStatus,
                                                                        "message": 'Project added successfully.', 
                                                                        "data": responseArr,       
                                                                    }));   
                                                                });   
                                                            }
                                                        } 
                                                }else{ 
                                                    return res.send(JSON.stringify({ 
                                                        "status": failStatus,
                                                        "message": 'Project data not saved.', 
                                                        "data": responseArr,       
                                                    })); 
                                                } 
                                            }); 
                                        });   
                                    }     
                                });
                            }else{ 
                                // Save project detail
                                Projects.saveData(project_data,function(projects){ 
                                        if(projects){   
                                            if(projects.insertId){  
                                                var milestoneArrglobal = [];   
                                                var milestonesData =   JSON.parse(input.milestones);
                                                console.log(milestonesData);
                                                if(milestonesData.length > 0){
                                                        milestonesData.forEach(function (item, key) { 
                                                            milestoneArr = [];  
                                                            milestoneArr.push(projects.insertId);  
                                                            milestoneArr.push(input.contractor_id);  
                                                            milestoneArr.push(item.customer_id); 
                                                            milestoneArr.push(item.title);  
                                                            milestoneArr.push(item.amount);   
                                                            milestoneArr.push(1);     
                                                            milestoneArr.push(moment(Date.now()).format('YYYY-MM-DD hh:mm:ss'));     
                                                            milestoneArr.push(moment(Date.now()).format('YYYY-MM-DD hh:mm:ss'));      
                                                            milestoneArrglobal.push(milestoneArr);     
                        
                                                        });  

                                                        // Save ProjectMilestones  detail
                                                        ProjectMilestones.saveData(milestoneArrglobal,function(resultMilestone){ 

                                                            // Send notification to customer 
                                                            var notification_data = {
                                                                user_id : input.customer_id,  
                                                                message : 'New project has been created by the contractor.' + getContractorDetail[0].first_name,
                                                                title : 'Project Add' ,
                                                                type : PROJECT_NOTIFICATION_TYPE,
                                                                type_id : projects.insertId
                                                            }  
                                                            Auth.sendNotificationAndroid(notification_data,function(notificationResult){
                                                                console.log(notificationResult);    
                                                            });   
 
                                                            return res.send(JSON.stringify({ 
                                                                "status": successStatus,
                                                                "message": 'Project added successfully.', 
                                                                "data": responseArr,       
                                                            }));   
                                                        });   
                                                    } 
                                                } 
                                        // Save milestoner data   
                                        }else{ 
                                            return res.send(JSON.stringify({ 
                                                "status": failStatus,
                                                "message": 'Project data not saved.', 
                                                "data": responseArr,       
                                            })); 
                                        }  
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
exports.addProject = addProject;
 
   


/** 
	 *  userProfile
     *  Purpose: This function is used for list user profile
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/ 
exports.bussinessProfile = function (req, res) { 
    try{
    var input = JSON.parse(JSON.stringify(req.body));   
    var auth     = req.headers.auth; 
 
		if(!userId){ 			 
            return res.send(JSON.stringify({
                "status": 400,
                "message": 'User id is required', 
            }));	  		
        }else if(!auth){			 
                return res.send(JSON.stringify({
                    "status": 400,
                    "message": 'Auth is required', 
                }));
        }else{  
            const sql = "SELECT * from users WHERE id = ? AND oauth_token = ?";
            connectPool.query(sql,[userId,auth], function (error, getUserProfile) {
                
                if(error){
                    console.log(error);
                }else if(getUserProfile !=''){ 
                    if(getUserProfile[0].profile_image != null){
                        userProfile = siteUrl + 'uploads/profile/' + getUserProfile[0].profile_image;
                    }else{ 
                        userProfile = noImageUsers;
                    }
                    userData = {
                        user_id             :   getUserProfile[0].id,   
                        firstName           :   getUserProfile[0].first_name,    
                        lastName            :   getUserProfile[0].last_name,    
                        email               :   getUserProfile[0].email,    
                        phone               :   getUserProfile[0].phone, 
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
 *  Purpose: This function is used to get constructor List
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.constructorDetail = function (req, res) { 
    
    try{
        const { check, validationResult } = require('express-validator/check');  
        var input = req.query;   
        var auth_token = req.headers.authtoken;    
        var errors = req.validationErrors();    
        var reaponseArr = {};  
        var constructorArr = {};  
        if(!req.query.user_id){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'Constructor Id is required.', 
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
                    
                    var WHERE_CONDITINS = "WHERE users.role_id ="+ConstructorRole+" AND users.id = '"+input.user_id+"'"; 
                    var joinSql = 'SELECT users.*, bussiness_profile.* from users LEFT JOIN bussiness_profile ON (bussiness_profile.user_id = users.id) '+WHERE_CONDITINS;     
                    //console.log(joinSql);     
                    connectPool.query(joinSql, function (error, UserDetail) {   
                            
                        //console.log(UserDetail);  
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
                                var bussinessImagesSql = 'SELECT * from bussiness_images where `user_id` = '+input.user_id; 
                                connectPool.query(bussinessImagesSql, function (error, bussinessImages) { 
                                    if(error){ 
                                        console.log(error); 
                                    }else if(bussinessImages.length > 0){
                                        bussinessImages.forEach(function (item, key) { 
                                            var images = {};
                                            images.id = String(item.id); 
                                            //images.image = siteUrl + 'uploads/user_images/' + item.image, 
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
                                            console.log(bussenessLocations);   
                                            bussenessLocations.forEach(function (item, key) { 
                                                var data = {};
                                                data.id = String(item.id);
                                                data.address = (item.address != null ? item.address : ''); 
                                                data.contact_number = (item.contact_number != null ? item.contact_number : '');  
                                                data.contact_email = item.contact_email != null ? item.contact_email : ''; 
                                                data.pincode = item.pincode != null ? item.pincode : ''; 
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
                                            //address : (UserDetail[0].address != null ? UserDetail[0].address : ''),  
                                            contact_number : UserDetail[0].contact_number,       
                                            email : UserDetail[0].email,       
                                            decription : UserDetail[0].services,    
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
 *  userUpdateProfile
 *  Purpose: This function is used for list user profile
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: void  
*/ 
exports.updateProfile = function (req, res) { 
  
   // try{  
        const { check, validationResult } = require('express-validator/check');  
        var input = JSON.parse(JSON.stringify(req.body));    
        var row_data =   JSON.parse(req.body.data); 
        
        var error_msg = '';
        if(!row_data.user_id || row_data.user_id == null){
            error_msg = 'Please provide user_id';
        } 
        if(!row_data.company_name || row_data.company_name == null){
            error_msg = 'Please provide company name';
        }  
        if(!row_data.services || row_data.services == null){
            error_msg = 'Please provide company services';
        }  
        if(!row_data.account_type || row_data.account_type == null){
            error_msg = 'Please provide account_type';
        }  
        if(!row_data.first_name || row_data.first_name == null){
            error_msg = 'Please provide first name';
        }  
        if(!row_data.last_name || row_data.last_name == null){
            error_msg = 'Please provide last name';
        }  
        if(!row_data.category_id || row_data.category_id == null){
            error_msg = 'Please category_id'; 
        }  
        if(error_msg != ''){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": error_msg,  
            }));
        }
        var auth_token = req.headers.authtoken; 

        Auth.CheckAuth(auth_token, function(authResult){  
            // Here you have access to your variable 
            if(authResult.success){  
                connectPool.query('SELECT COUNT(*) AS count from users where id = ?',[row_data.user_id], function (error, userdata) { 
                    if(error){
                        console.log(error);
                    }else if(userdata[0].cnt == 0){ 
                        return res.send(JSON.stringify({
                            "status": failStatus,
                            "message": 'Invalid user_d.', 
                        }));
                    }else{     
                        var profile_data = { 
                            company_name    : row_data.company_name,    
                            services : row_data.services,     
                            account_type : row_data.account_type,     
                            is_profile_completed : 1,      
                            //bank_account_number : row_data.bank_account_number,
                            category_id : row_data.category_id
                        };       
                        var user_data = { 
                            first_name    : row_data.first_name,    
                            last_name : row_data.last_name, 
                            profile_completed : 1
                        }; 
                        
                        var responseArr = {};
                        if (req.files && req.files.profile_pic && req.files.profile_pic !== "undefined") { 
                            //console.log(req.files); return true;
                            var profile_pic = req.files.profile_pic;   
                            var timestamp = new Date().getTime();    
                            filename = timestamp+'-'+profile_pic.name;   
                            profile_pic.mv('public/upload/'+filename, function(err) {
                                if (err){    
                                    //console.log(err);    
                                }else{ 
                                    image_data = {
                                        filename :filename,
                                        //imagePath : nodeSiteUrl+'public/upload/'+filename
                                        imagePath : nodeSiteUrl+'/upload/'+filename
                                    } 
                                    Auth.UploadImageToserver(image_data, function(uploadResult){
                                        //console.log(uploadResult); 
                                        if(uploadResult.success){
                                            user_data.profile_pic = filename;  
                                        }  
                                        
                                        // Save bussiness profile 
                                        connectPool.query("UPDATE users set ? WHERE id = ?",[ user_data, row_data.user_id ], function(error, profileResult){ 
                                            if (error) throw error;
                                            data = {
                                                id :input.user_id, 
                                            }   
                                            // Save bussiness profile 
                                            connectPool.query("UPDATE bussiness_profile set ? WHERE user_id = ?",[ profile_data, row_data.user_id ], function(error, profileResult){       
                                                    
                                                if (error) throw error;  
                                                //console.log(profileResult);  
                                                // Save bussiness locations  
                                                var location_arra = row_data.locations; 
                                                var locationArrglobal = []; 
                                                var locationArrglobal2 = [];
                                                var locationArr2 = []; 
                                                if(location_arra){
                                                    location_arra.forEach(function (item, key) {

                                                        locationArr = {}; 
                                                        locationArr2 = []; 
                                                        locationArr2.push(row_data.user_id); 
                                                        locationArr2.push(item.address); 
                                                        locationArr2.push(item.pincode); 
                                                        locationArr2.push(item.latitude); 
                                                        locationArr2.push(item.longitude); 
                                                        locationArr2.push(item.country); 
                                                        locationArr2.push(item.city); 
                                                        locationArr2.push(item.state); 
                                                        //locationArr2.push(item.contact_email); 
                                                        locationArr2.push(item.contact_number);  
                                                        locationArrglobal2.push(locationArr2);   
                                                        
                                                    });   
                                                    BussinessLocations.saveData(locationArrglobal2,function(locationData){  
                                                        //console.log(locationData);
                                                    }); 
                                                }    
                    
                                                // Save bussiness locations  
                                                var location_arra = row_data.locations;   
                                                var locationArr2 = []; 
                                                var filename = '';   
                                                if (req.files && req.query.images !== "undefined") {  
                                                    let images = req.files.images; 
                                                    var timestamp = new Date().getTime(); 
                                                    //console.log(images);     
                                                    if(images && images.length > 0){   
                                                        var count = 0;
                                                        images.forEach(function (item, key) { 
                                                            count++;
                                                            filename =  item.name;   
                                                            //console.log(item); 
                                                            item.mv('public/upload/'+item.name, function(err) {  
                                                                if (err){
                                                                    console.log(err); 
                                                                }else{ 
                                                                    var imagedata = { 
                                                                        user_id    : row_data.user_id,   
                                                                        image :   item.name      
                                                                    };    
                                                                    connectPool.query("INSERT INTO bussiness_images set ? ",imagedata, function(error, imageData){ 
                                                                                
                                                                        if (error) throw error;    
                                                                        
                                                                        Request.post({ 
                                                                            "headers": { "content-type": "application/json"  },
                                                                            "url": siteUrl +"uploadImage",  
                                                                            "body": JSON.stringify({  
                                                                                "file_name":   item.name,       
                                                                                //"imagePath": nodeSiteUrl+'public/upload/'+  item.name
                                                                                "imagePath": nodeSiteUrl+'/upload/'+  item.name
                                                                            })    
                                                                        },(error, response, body) => { 
                                                                                if(error) { 
                                                                                    //return console.dir(error);
                                                                                }   
                                                                                var retrunRes = JSON.parse(body);  
                                                                                //console.log(nodeSiteUrl+'public/upload/'+timestamp+count+item.name);     
                                                                                if(retrunRes.status ==200){    
                                                                                var fs = require('fs');  
                                                                                fs.unlinkSync('public/upload/'+item.name);     
                                                                                    
                                                                                }  
                                                                        });  
                                                                    }); 

                                                                }   
                                                            });  
                                                        });   
                                                        
                                                    }else{ 

                                                        if(images){
                                                            //console.log(images); 
                                                            console.log('Yes image found ');
                                                        filename = images.name;      
                                                        images.mv('public/upload/'+filename, function(err) {
                                                            if (err){ 
                                                                console.log(err);  
                                                            }else{
                                                                
                                                                Request.post({ 
                                                                    "headers": { "content-type": "application/json"  },
                                                                    "url": siteUrl +"uploadImage",  
                                                                    "body": JSON.stringify({  
                                                                        "file_name": filename,      
                                                                        //"imagePath": nodeSiteUrl+'public/upload/'+filename 
                                                                        "imagePath": nodeSiteUrl+'/upload/'+filename
                                                                    })   
                                                                    
                                                                },(error, response, body) => { 
                                                                        if(error) {
                                                                            return console.dir(error);
                                                                        }  
                                                                        var retrunRes = JSON.parse(body);  
                                                                        //console.log(retrunRes);    
                                                                        if(retrunRes.status ==200){    
                                                                        var fs = require('fs');  
                                                                        fs.unlinkSync('public/upload/'+filename);  
                                                                        
                                                                            var imagedata = {
                                                                                user_id    : row_data.user_id,  
                                                                                image : filename     
                                                                            }; 
                                                                            connectPool.query("INSERT INTO bussiness_images set ? ",imagedata, function(error, imageData){ 
                                                                                    
                                                                                if (error) throw error;      
                                                                                //console.log(imageData);    
                                                                            });    
                                                                        }   
                                                                });   

                                                                
                                                            }     
                                                        }); 
                                                        }else{
                                                            console.log('File not uploaded 2');
                                                        }   
                                                    }  
                                                }else{
                                                    console.log('File not uploaded');
                                                }  

                                                data = { 
                                                    id :row_data.user_id, 
                                                }    
                                                Users.getUserDetail(data,function(userDetail){ 
                                                    console.log(userDetail); 
                                                    if(userDetail){ 
                                                        var responseArr = {   
                                                            user_id : row_data.user_id,   
                                                            profile_pic : WebsiteURL + 'public/upload/user_images/' + userDetail[0].profile_pic
                                                        }    
                                                        return res.send(JSON.stringify({  
                                                            "status": successStatus,
                                                            "message": 'User detail updated successfully.', 
                                                            "data": responseArr,       
                                                        }));  
                                                    }else{
                                                        return res.send(JSON.stringify({  
                                                            "status": successStatus,
                                                            "message": 'User detail updated successfully.', 
                                                            "data": responseArr,        
                                                        }));   
                                                    } 
                                                }); 
                    
                                            }); 
                                                    
                                        });  
                                    });   
                                }     
                            });

                        }else{
                             
                            // Save bussiness profile 
                            connectPool.query("UPDATE users set ? WHERE id = ?",[ user_data, row_data.user_id ], function(error, profileResult){ 
                                if(profileResult){
                                    // Save bussiness profile 
                                    connectPool.query("UPDATE bussiness_profile set ? WHERE user_id = ?",[ profile_data, row_data.user_id ], function(error, profileResult){       
                                        console.log(profileResult); 
                                        if (error) throw error; console.log(error);   
                                        // Save bussiness locations  
                                        var location_arra = row_data.locations; 
                                        var locationArrglobal = []; 
                                        var locationArrglobal2 = [];
                                        var locationArr2 = []; 
                                        if(location_arra){
                                            location_arra.forEach(function (item, key) {

                                                locationArr = {}; 
                                                locationArr2 = []; 
                                                locationArr2.push(row_data.user_id); 
                                                locationArr2.push(item.address); 
                                                locationArr2.push(item.pincode); 
                                                locationArr2.push(item.latitude); 
                                                locationArr2.push(item.longitude); 
                                                locationArr2.push(item.country); 
                                                locationArr2.push(item.city); 
                                                locationArr2.push(item.state); 
                                                //locationArr2.push(item.contact_email); 
                                                locationArr2.push(item.contact_number);  
                                                locationArrglobal2.push(locationArr2);  

                                                
                                            });  
                                            //console.log(locationArrglobal2);
                                            BussinessLocations.saveData(locationArrglobal2,function(locationData){ 
                                            });  
                                        }  
                                        // Save bussiness locations  
                                        
                                        var location_arra = row_data.locations; 
                                        var locationArrglobal = [];
                                        var imageArrglobal = []; 
                                        var locationArr2 = []; 
                                        var filename = '';   
                                        if (req.files && req.files.images !== "undefined") {  
                                            let images = req.files.images; 
                                            var timestamp = new Date().getTime(); 
                                            //console.log(images); 

                                            if(images && images.length > 0){   
                                                var count = 0;
                                                images.forEach(function (item, key) { 
                                                    count++;
                                                    filename =  item.name;   
                                                    //console.log(item); 
                                                    item.mv('public/upload/'+item.name, function(err) {  
                                                        if (err){
                                                            console.log(err); 
                                                        }else{ 
                                                            var imagedata = { 
                                                                user_id    : row_data.user_id,   
                                                                image :   item.name      
                                                            };    
                                                            connectPool.query("INSERT INTO bussiness_images set ? ",imagedata, function(error, imageData){ 
                                                                    
                                                                if (error) throw error;    
                                                                //console.log(item.name);    
                                                                //console.log(nodeSiteUrl+'public/upload/'+  item.name);   
                                                                Request.post({ 
                                                                    "headers": { "content-type": "application/json"  },
                                                                    "url": siteUrl +"uploadImage",  
                                                                    "body": JSON.stringify({  
                                                                        "file_name":   item.name,       
                                                                        //"imagePath": nodeSiteUrl+'public/upload/'+  item.name
                                                                        "imagePath": nodeSiteUrl+'/upload/'+  item.name
                                                                    })    
                                                                },(error, response, body) => { 
                                                                        if(error) { 
                                                                            return console.dir(error);
                                                                        }   
                                                                        var retrunRes = JSON.parse(body);  
                                                                        //console.log(nodeSiteUrl+'public/upload/'+timestamp+count+item.name);     
                                                                        if(retrunRes.status ==200){    
                                                                        var fs = require('fs');  
                                                                        fs.unlinkSync('public/upload/'+item.name);     
                                                                                    
                                                                        }  
                                                                });  
                                                            }); 

                                                        }   
                                                    });  
                                                });   
                                                
                                            }else{ 
                                                
                                                if(images){
                                                    //console.log(images); 
                                                    console.log('File uploaded');
                                                    filename = images.name;      
                                                    images.mv('public/upload/'+filename, function(err) {
                                                        if (err){ 
                                                            console.log(err);  
                                                        }else{
                                                            
                                                            Request.post({ 
                                                                "headers": { "content-type": "application/json"  },
                                                                "url": siteUrl +"uploadImage",  
                                                                "body": JSON.stringify({  
                                                                    "file_name": filename,      
                                                                    //"imagePath": nodeSiteUrl+'public/upload/'+filename
                                                                    "imagePath": nodeSiteUrl+'/upload/'+filename
                                                                })   
                                                                
                                                            },(error, response, body) => { 
                                                                    if(error) {
                                                                        return console.dir(error);
                                                                    }  
                                                                    var retrunRes = JSON.parse(body);  
                                                                    //console.log(retrunRes);    
                                                                    if(retrunRes.status ==200){    
                                                                    var fs = require('fs');  
                                                                    fs.unlinkSync('public/upload/'+filename);  
                                                                    
                                                                        var imagedata = {
                                                                            user_id    : row_data.user_id,  
                                                                            image : filename     
                                                                        }; 
                                                                        connectPool.query("INSERT INTO bussiness_images set ? ",imagedata, function(error, imageData){  
                                                                            if (error) throw error;      
                                                                            console.log(imageData);    
                                                                        });    
                                                                    }   
                                                            });  
                                                        }      
                                                    });
                                                }else{
                                                    
                                                } 
                                                    
                                            }  
                                        }else{
                                            
                                        }   
 
                                        data = { 
                                            id :row_data.user_id, 
                                        }  
                                        Users.getUserDetail(data,function(userDetail){ 
                                            if(userDetail){
                                                //console.log(userDetail);  
                                                var responseArr = {   
                                                    user_id : row_data.user_id,   
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
                            });  
                        }   
                    }
                });   
            }else{   
                return res.send(JSON.stringify({
                    "status": 500,
                    "message": 'Session Expired.', 
                })); 
            }  
        }) 
    // } catch (err) {
    //     return res.send(JSON.stringify({
    //         "status": failStatus,
    //         "message": err, 
    //     })); 
    // }      
};
   
 
/** 
	 *  updateMilestone
     *  Purpose: This function is used to updateMilestone
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/
exports.updateMilestone = function (req, res) { 
    
    try{
        const { check, validationResult } = require('express-validator/check');  
        var input = JSON.parse(JSON.stringify(req.body));    
        req.checkBody('title', 'title is required').notEmpty();
        req.checkBody('amount', 'Amount is required').notEmpty();
        req.checkBody('milestone_id', 'milestone_id is required').notEmpty();   
        //req.checkBody('total_project_amount', 'total_project_amount is required').notEmpty();   
        var auth_token = req.headers.authtoken;  
        var errors = req.validationErrors();
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }   
        if(errors){	  		 
            return res.send(JSON.stringify({
                "status": 400,
                "message": errors[0].msg, 
            })); 	  		 
        }else{ 
            Auth.CheckAuth(auth_token, function(authResult){  
                // Here you have access to your variable    
                if(authResult.success){    
                    Auth.CheckAuth(auth_token, function(authResult){   // check Authentication
                        //console.log(authResult); 
                        if(authResult.success){     
                            var milestone_data = { 
                                title    : input.title,     
                                amount : input.amount,     
                                id : input.milestone_id  
                            };     
                            var responseArr = {}; 
                            ProjectMilestones.checkMilestoneExists(milestone_data,function(milestoneData){ 
                                if(milestoneData[0].count && milestoneData[0].count > 0){ 
                                    ProjectMilestones.getMilestoneDetail(milestone_data,function(milestoneDetail){
                                        //console.log(milestoneDetail); 
                                            if(milestoneDetail){   

                                                // Save ProjectMilestones  detail
                                                ProjectMilestones.updateData(milestone_data,function(resultMilestone){    
                                                        //console.log(resultMilestone); 
                                                        // Update milestone price    
                                                        milestoneDataArray = {project_id : milestoneDetail[0].project_id};
                                                        ProjectMilestones.getMilestonByProject(milestoneDataArray,function(projectMilestone){
                                                            if(projectMilestone){
                                                                //console.log(projectMilestone); 
                                                                var total_amount = 0;
                                                                projectMilestone.forEach(function (item, key) {    
                                                                    total_amount += item.amount;  
                                                                }); 
                                                                project_update = {'id' : milestoneDetail[0].project_id,'amount':total_amount}
                                                                Projects.updateData(project_update,function(update_result){ 
                                                                    if(update_result){
                                                                        console.log('project Price updated '+total_amount);
                                                                    }else{
                                                                        console.log('project Price not updated '+total_amount);
                                                                    }
                                                                });    
                                                            }
                                                        });   

                                                        
                                                        if (req.files && req.query.images !== "undefined") {  
                                                            let images = req.files.images;     
                                                            var timestamp = new Date().getTime();    
                                                            if(images.length > 0){   
                                                                var count = 0;
                                                                images.forEach(function (item, key) { 
                                                                    count++;
                                                                    filename =  item.name;   
                                                                    //console.log(item); 
                                                                    item.mv('public/upload/'+item.name, function(err) {  
                                                                        if (err){
                                                                            console.log(err); 
                                                                        }else{ 

                                                                                image_data_upload = {
                                                                                    filename :item.name,
                                                                                    //imagePath : nodeSiteUrl+'public/upload/'+item.name,
                                                                                    imagePath : nodeSiteUrl+'/upload/'+item.name,
                                                                                    image_type : 'project_image' 
                                                                                }  
                                                                                var imagedata = { 
                                                                                    constructor_id    : milestoneDetail[0].constructor_id,   
                                                                                    project_id    : milestoneDetail[0].project_id,   
                                                                                    project_milestone_id : parseInt(input.milestone_id), 
                                                                                    image :   item.name,      
                                                                                    //project_id : input.project_milestone_id,   
                                                                                }; 
                                                                                Auth.UploadImageToserver(image_data_upload, function(uploadResult){
                        
                                                                                    //console.log(uploadResult);  
                                                                                    if(uploadResult.success){ 
                                                                                        //console.log(imagedata); 
                                                                                        MilestoneImages.saveData(imagedata, function(mileStoneImages){
                                                                                            //console.log(mileStoneImages);  
                                                                                        });  
                                                                                    }  
                                                                                });  
                                                                                //console.log(milestoneDetail);  
                                                                        }   
                                                                    });  
                                                                });   
                                                                
                                                            }else{  
                                                            
                                                                filename = images.name;  
                                                                    images.mv('public/upload/'+images.name, function(err) {  
                                                                        if (err){
                                                                            console.log(err); 
                                                                        }else{  
                        
                                                                            image_data_upload = {
                                                                                filename :images.name,
                                                                                imagePath : nodeSiteUrl+'/upload/'+images.name,
                                                                                //imagePath : nodeSiteUrl+'public/upload/'+images.name,
                                                                                image_type : 'project_image' 
                                                                            }  
                                                                            var imagedata = { 
                                                                                constructor_id    : milestoneDetail[0].constructor_id,   
                                                                                project_id    : milestoneDetail[0].project_id,   
                                                                                project_milestone_id : parseInt(input.milestone_id), 
                                                                                image :   images.name         
                                                                            };  
                                                                            Auth.UploadImageToserver(image_data_upload, function(uploadResult){  
                                                                                if(uploadResult.success){ 
                                                                                    //console.log(imagedata); 
                                                                                    MilestoneImages.saveData(imagedata, function(mileStoneImages){
                                                                                        //console.log(mileStoneImages);  
                                                                                    });      
                                                                                }  
                                                                            }); 
                                                                        }   
                                                                    });      
                                                            }  
                                                        }else{
                                                        } 
                                                        
                                                         // Send notification to customer 
                                                         var notification_data = {
                                                            user_id : milestoneDetail[0].customer_id, 
                                                            message : milestoneDetail[0].title +' updated by the contractor.',  
                                                            title : 'Milestone Update.',
                                                            type : MILESTONE_UPDATE_NOTIFICATION_TYPE, 
                                                            type_id : milestoneDetail[0].project_id
                                                        } 
                                                        Auth.sendNotificationAndroid(notification_data,function(notificationResult){
                                                            //console.log(notificationResult);    
                                                        }); 

                                                        // Save bussiness profile 
                                                        return res.send(JSON.stringify({ 
                                                            "status": successStatus,
                                                            "message": 'Milestone updated.', 
                                                            "data": responseArr,        
                                                        }));  
                                            
                                                    });   

                                            }else{
                                                return res.send(JSON.stringify({ 
                                                    "status": failStatus,  
                                                    "message": 'Invalid milestone ID.',
                                                    "data": '{}'  
                                                })); 
                                            }  
                                    });

                                }else{

                                    return res.send(JSON.stringify({ 
                                        "status": failStatus,  
                                        "message": 'Invalid milestone ID.',
                                        "data": '{}'  
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
                }else{  
                    return res.send(JSON.stringify({
                        "status": 500,
                        "message": 'Session Expired.', 
                    })); 
                }  
            })  
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
exports.updateBankDetail = function (req, res) { 
     
    try{
        const { check, validationResult } = require('express-validator/check');  
        var input = JSON.parse(JSON.stringify(req.body));  
        var auth_token = req.headers.authtoken; 
        var errors = req.validationErrors(); 
        var error_msg = '';
        if(!input.bank_account_number || input.bank_account_number == null){
            error_msg = 'Please provide bank_account_number';
        } 
        if(!input.user_id || input.user_id == null){
            error_msg = 'Please provide user_id.';
        } 
        if(!input.routing_number || input.routing_number == null){
            error_msg = 'Please provide routhing_number';
        }  
        if(!input.ssn_last_4 || input.ssn_last_4 == null){
            error_msg = 'Please provide company ssn_last_4';
        }  
        if(!input.account_holder_name || input.account_holder_name == null){
            error_msg = 'Please provide account_holder_name';
        }     
        if(!input.dob || input.dob == null){
            error_msg = 'Please provide dob.';
        }    
        if(!input.address || input.address == null){
            error_msg = 'Please provide address.';
        }    
        if(!input.city || input.city == null){ 
            error_msg = 'Please provide city.';
        }    
        if(!input.postal_code || input.postal_code == null){
            error_msg = 'Please provide postal_code.';
        }    
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }  
        if(error_msg != ''){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": error_msg,  
            })); 
        }else{ 
    
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                if(authResult.success){     
                    var bankDetail = { 
                        user_id    : input.user_id,     
                        bank_account_number : input.bank_account_number,     
                        account_holder_name : input.account_holder_name, 
                        ssn_last_4 : input.ssn_last_4,
                        routing_number : input.routing_number, 
                        pincode : input.postal_code,  
                        city : input.city, 
                        address : input.address,  
                        is_profile_completed : 1,      
                        dob : moment(input.dob).format('YYYY-MM-DD hh:mm:ss'),   
                    };        
                    var responseArr = {};  
                    BussinessProfiles.checkRecordExist(bankDetail,function(bussinessProfile){   
                       
                        if(bussinessProfile[0].count && bussinessProfile[0].count > 0){ 
                            BussinessProfiles.updateData(bankDetail,function(updateResult){ 
                                if(updateResult){   
                                    //Create stripe account 
                                    var bankData = {  
                                        user_id    :  input.user_id,     
                                    };  
                                    Auth.StripeCreateAccount(bankData, function(uploadResult){  
                                        return res.send(uploadResult);    
                                    });    
                                }else{ 
                                    return res.send(JSON.stringify({ 
                                        "status": failStatus,  
                                        "message": 'Data could  not updated. Please try again.',
                                        "data": {}  
                                    }));  
                                }   
                            }); 
                        }else{
                            return res.send(JSON.stringify({ 
                                "status": SessionExpireStatus,  
                                "message": 'Invalid user_id.',
                                "data": responseArr  
                            })); 
                        }
                    });  
                }else{ 
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": responseArr  
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
    
    try{
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
                    Auth.CheckConstructorExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){ 

                            data = {
                                user_id:input.user_id,
                                offset:offset,
                                limit:pageLimit,
                                join:'customer'  
                            }    
                            Transactions.getTransactionCountContr(data,function(recordCount){
                                //console.log(recordCount[0].count);
                                if(recordCount){   

                                    Transactions.getConsTransactions(data,function(records){  
                                        if(records){ 
                                            records.forEach(function (item, key) {
                                                dataArr = {};
                                                dataArr.transaction_id = String(item.transaction_id);    
                                                dataArr.milestone_title = (item.milestone_title != null) ? String(item.milestone_title) : '';   
                                                dataArr.project_title = (item.project_title != null) ? String(item.project_title) : '';   
                                                dataArr.customer_name = (item.first_name != null) ? String(item.first_name) : '';   
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
 *  transactionHistory
 *  Purpose: This function is used to get transactionHistory
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: JSON 
*/  
exports.membershipTransactions = function (req, res) {   
    
     
    const { check, validationResult } = require('express-validator/check');   
    var input = JSON.parse(JSON.stringify(req.body)); 
    var input = req.query;   
    var auth_token = req.headers.authtoken;   
    var errors = req.validationErrors();     
    var reaponseArr = [];   
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

        try {   
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication
                console.log(authResult); 
                if(authResult.success){ 
                    let page = (input.page >0 ) ? input.page : 1;    
                    let offset =  String((page-1)*pageLimit); 
                    Auth.CheckConstructorExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){  
                            data = {
                                user_id:input.user_id,
                                offset:offset,
                                limit:pageLimit,
                                join:'customer'  
                            }    
                            MembershipTransactions.getTransactionCount(data,function(recordCount){
                                //console.log(recordCount[0].count);
                                if(recordCount){   

                                    MembershipTransactions.getTransactions(data,function(records){
                                        console.log(records); 
                                        if(records){ 
                                            records.forEach(function (item, key) {
                                                dataArr = {};
                                                dataArr.transaction_id = (item.transaction_id != null) ? String(item.transaction_id) : String(item.id);     
                                                dataArr.plan_title = (item.plan_title != null) ? String(item.plan_title) : '';  
                                                dataArr.days = (item.days != null) ? String(item.days)+' Days' : '';   
                                                dataArr.amount = String(CURRENCY+item.amount);    
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
        }catch (e) { 
            console.log(e);
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,  
                "message": e, 
                "data": reaponseArr  
            })); 
        }  
    }   
}; 

/** 
 *  getBankDetail
 *  Purpose: This function is used to get BankDetail
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.getBankDetail = function (req, res) { 

    var reaponseArr = {}; 
    try{
        const { check, validationResult } = require('express-validator/check');   
        var input = req.query; 
        var auth_token = req.headers.authtoken;    
        var errors = req.validationErrors();    
        var reaponseArr = [];   

        if(!input.user_id){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'User id is required.', 
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
            
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                if(authResult.success){   
                    params = { 
                        user_id:input.user_id, 
                    }
                    BussinessProfiles.getData(params, function(bussinessDetail){    
                        if(bussinessDetail){ 
                            console.log(bussinessDetail);  
                            reaponseArr = {    
                                user_id : String(bussinessDetail[0].user_id), 
                                bank_account_number : String(bussinessDetail[0].bank_account_number != null ? bussinessDetail[0].bank_account_number : ''), 
                                routing_number : String(bussinessDetail[0].routing_number != null ? bussinessDetail[0].routing_number : ''), 
                                ssn_last_4 : String(bussinessDetail[0].ssn_last_4 != null ? bussinessDetail[0].ssn_last_4 : ''), 
                                account_holder_name : String(bussinessDetail[0].account_holder_name != null ? bussinessDetail[0].account_holder_name : ''), 
                                dob : bussinessDetail[0].dob != null ? String(moment(bussinessDetail[0].dob).format('YYYY-MM-DD')) : '', 
                                address : bussinessDetail[0].address != null ? String(bussinessDetail[0].address) : '', 
                                city : bussinessDetail[0].city != null ? String(bussinessDetail[0].city) : '', 
                                postal_code : bussinessDetail[0].pincode != null ? String(bussinessDetail[0].pincode) : '',   
                            }          
                            return res.send(JSON.stringify({  
                                "status": successStatus, 
                                "message": 'Record found.',
                                "data": reaponseArr, 
                            }));  
                        }else{  
                            return res.send(JSON.stringify({
                                "status": failStatus, 
                                "message": 'Invalid user_d Id.', 
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
    }catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": {}  
        })); 
    }    
};


/** 
 *  getMembershipData
 *  Purpose: This function is used to get getMembershipData
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.getMembershipData = function (req, res) { 
    
    try{
        const { check, validationResult } = require('express-validator/check');   
        var input = req.query; 
        var auth_token = req.headers.authtoken;    
        var errors = req.validationErrors();    
        var reaponseArr = [];   

        if(!input.user_id){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'User id is required.', 
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
            
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                if(authResult.success){  
                    params = {
                        user_id:input.user_id, 
                    }
                    BussinessProfiles.getData(params, function(bussinessDetail){    
                        if(bussinessDetail){ 
                            
                            reaponseArr = {    
                                user_id : String(bussinessDetail[0].user_id), 
                                membership_plan_name : String(bussinessDetail[0].membership_plan_name != null ? bussinessDetail[0].membership_plan_name : ''), 
                                total_transactions : bussinessDetail[0].total_transactions != null ? String(bussinessDetail[0].total_transactions) : '',  
                                remaining_transactions : bussinessDetail[0].rem_transactions != null ? String(bussinessDetail[0].rem_transactions) : '',     
                                plan_start_date : bussinessDetail[0].plan_start_date != null ? String(moment(bussinessDetail[0].plan_start_date).format('YYYY-MM-DD hh:mm:ss')) : '',    
                                plan_expiry_date : bussinessDetail[0].plan_expiry_date != null ? String(moment(bussinessDetail[0].plan_expiry_date).format('YYYY-MM-DD hh:mm:ss')) : '',     
                                membership_amount : bussinessDetail[0].membership_amount != null ? String(CURRENCY+bussinessDetail[0].membership_amount) : '',    
                            }          
                            return res.send(JSON.stringify({   
                                "status": successStatus, 
                                "message": 'Record found.',
                                "data": reaponseArr, 
                            }));  
                        }else{  
                            return res.send(JSON.stringify({
                                "status": failStatus, 
                                "message": 'Invalid user_d Id.', 
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
    }catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": {}  
        })); 
    } 
};

/** 
 *  projectDetail
 *  Purpose: This function is used to get constructor List
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
exports.projectDetail = function (req, res) { 
    
    try{
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
        }
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{ 
            
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                if(authResult.success){ 
                    var responseArr = {};
                    params = {
                        id:input.project_id,
                        join : 'customer' 
                    }
                    Projects.getProjectDetail(params, function(projectDetail){   
                        if(projectDetail){  
                                // Get milestone
                                milestoneArr = [];
                                milestoneArr = Array(); 
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
                                                data.amount = item.amount;  
                                                data.status = (item.status==1 ? 'Pending' : 'Completed');  
                                                data.created_date =  moment(item.created_at).format('YYYY-MM-DD hh:mm:ss');  
                                                data.images =  (milestoneArr1[item.id] ? milestoneArr1[item.id] : Array());    
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
                                            amount : (projectDetail[0].amount != null ? CURRENCY+projectDetail[0].amount : ''),         
                                            description : projectDetail[0].description,       
                                            status : (projectDetail[0].status==2 ? 'Completed' : 'Pending'),       
                                            customer_name : projectDetail[0].first_name+' '+projectDetail[0].last_name, 
                                            is_rated :  projectDetail[0].is_rated!= null ? String(projectDetail[0].is_rated) : '',  
                                            document :  documentUrl,   
                                            project_created_date :  moment(projectDetail[0].created_at).format('YYYY-MM-DD hh:mm:ss'),  
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
    } catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": {}  
        })); 
    }
};     
  

/** 
 *  deletePortfolioImage
 *  Purpose: This function is used to delete portfolio image of constructor
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: image Id 
 *  Returns: json  
*/
exports.deletePortfolioImage = function (req, res) { 
  
    try{
        const { check, validationResult } = require('express-validator/check');  
        var input = req.query;   
        
        var auth_token = req.headers.authtoken; 
        var errors = req.validationErrors();  
        if(!input.image_id){  
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'image_id is required.', 
            }));
        } 
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{ 
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication
                console.log(authResult); 
                if(authResult.success){     
                    var sqlParams = { 
                        id    : input.image_id,     
                    };     
                    var responseArr = {}; 
                    BussinessImages.checkRecordExist(sqlParams,function(milestoneData){ 
                        if(milestoneData[0].count && milestoneData[0].count > 0){ 
                            BussinessImages.deleteRecord(sqlParams,function(queryResult){ 
                                if(queryResult){    
                                        // Save bussiness profile 
                                        return res.send(JSON.stringify({ 
                                            "status": successStatus,
                                            "message": 'Image delete successfully.', 
                                            "data": responseArr,        
                                        }));   
                                }else{
                                    return res.send(JSON.stringify({ 
                                        "status": failStatus,  
                                        "message": 'Image not deleted.',
                                        "data": '{}'  
                                    })); 
                                }  
                            }); 
                        }else{

                            return res.send(JSON.stringify({ 
                                "status": failStatus,  
                                "message": 'Invalid image ID.',
                                "data": '{}'  
                            }));  
                        }  
                    }); 
                }else{
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": '{}'  
                    }));    
                }
            });  

        } 
    } catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": {}  
        })); 
    }  
}; 


/** 
 *  deletePortfolioImage
 *  Purpose: This function is used to delete portfolio image of constructor
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: image Id 
 *  Returns: json  
*/
exports.deleteLocation = function (req, res) { 
  
    try{
        const { check, validationResult } = require('express-validator/check');  
        var input = req.query; 
        var auth_token = req.headers.authtoken; 
        var errors = req.validationErrors();  
        if(!input.location_id){  
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": 'location_id is required.', 
            }));
        } 
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }else{ 
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                if(authResult.success){     
                    var sqlParams = { 
                        id    : input.location_id,    
                    };     
                    var responseArr = {}; 
                    BussinessLocations.checkRecordExist(sqlParams,function(milestoneData){ 
                        if(milestoneData[0].count && milestoneData[0].count > 0){ 
                            BussinessLocations.deleteRecord(sqlParams,function(queryResult){ 
                                if(queryResult){    
                                        // Save bussiness profile 
                                        return res.send(JSON.stringify({ 
                                            "status": successStatus,
                                            "message": 'Location deleted successfully.', 
                                            "data": responseArr,        
                                        }));   
                                }else{
                                    return res.send(JSON.stringify({ 
                                        "status": failStatus,  
                                        "message": 'Location not deleted.',
                                        "data": '{}'  
                                    })); 
                                }  
                            }); 
                        }else{

                            return res.send(JSON.stringify({ 
                                "status": failStatus,  
                                "message": 'Invalid location ID.',
                                "data": '{}'  
                            }));  
                        }  
                    }); 
                }else{
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": '{}'  
                    }));    
                }
            });   
        } 
    } catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": {}  
        })); 
    }  
}; 

/** 
	 *  updateMilestone
     *  Purpose: This function is used to updateMilestone
	 *  Pre-condition:  None
	 *  Post-condition: None. 
	 *  Parameters: ,
	 *  Returns: void 
*/
exports.updateLocation = function (req, res) { 
  
    try{
        const { check, validationResult } = require('express-validator/check');  
        var input = JSON.parse(JSON.stringify(req.body));    
        console.log(input);   
        var auth_token = req.headers.authtoken; 
        var errors = req.validationErrors(); 
        var error_msg = '';
        if(!input.location_id || input.location_id == null){
            error_msg = 'Please provide location_id';
        } 
        if(!input.address || input.address == null){
            error_msg = 'Please provide caddress';
        }  
        if(!input.pincode || input.pincode == null){
            error_msg = 'Please provide company pincode';
        }  
        if(!input.latitude || input.latitude == null){
            error_msg = 'Please provide latitude';
        }  
        if(!input.longitude || input.longitude == null){
            error_msg = 'Please provide longitude.';
        }  
        if(!input.city || input.city == null){
            error_msg = 'Please provide city';
        }  
        if(!input.country || input.country == null){
            error_msg = 'Please country';  
        }  
        if(!input.state || input.state == null){
            error_msg = 'Please provide state';   
        }  
        if(!auth_token){   	 		 
            return res.send(JSON.stringify({ 
                "status": SessionExpireStatus,
                "message": 'Session Expired.',  
            }));	  		 
        }  
        if(error_msg != ''){ 
            return res.send(JSON.stringify({
                "status": failStatus,
                "message": error_msg,  
            })); 
        }else{  
            Auth.CheckAuth(auth_token, function(authResult){   // check Authentication  
                if(authResult.success){     
                    var locationData = { 
                        id    : input.location_id,     
                        address : input.address,     
                        contact_number : input.contact_number, 
                        pincode : input.pincode,
                        latitude : input.latitude,
                        longitude : input.longitude,
                        city : input.city,
                        country : input.country,
                        state : input.state, 
                    };      
                    var responseArr = {}; 
                    BussinessLocations.checkRecordExist(locationData,function(milestoneData){  
                        if(milestoneData[0].count && milestoneData[0].count > 0){ 
                            BussinessLocations.updateData(locationData,function(updateResult){ 
                                if(updateResult){ 
                                    // Save bussiness profile 
                                    return res.send(JSON.stringify({ 
                                        "status": successStatus,
                                        "message": 'Location updated.', 
                                        "data": responseArr,         
                                    })); 
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
                                "message": 'Invalid locationId.',
                                "data": responseArr  
                            })); 
                        }
                    });  
                }else{
                    return res.send(JSON.stringify({ 
                        "status": SessionExpireStatus,  
                        "message": 'Session Expired.',
                        "data": responseArr  
                    }));     
                }
            });  
        }

    } catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": {}  
        })); 
    }  
};



/** 
 *  notifications
 *  Purpose: This function is used to get notifications
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: JSON 
*/  
exports.notifications = function (req, res) {  
    
    try{
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
                console.log(authResult); 
                if(authResult.success){ 
                    let page = (input.page >0 ) ? input.page : 1;    
                    let offset =  String((page-1)*pageLimit); 
                    Auth.CheckConstructorExists(input.user_id, function(CheckUserExists){   
                        if(CheckUserExists.success){ 

                            data = {
                                user_id:input.user_id,
                                offset:offset,
                                limit:pageLimit
                            }     
                            Notifications.getDataCount(data,function(dataCount){
                                console.log(dataCount[0].count);
                                if(dataCount){  

                                    Notifications.getData(data,function(notifications){
                                        console.log(notifications); 
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
    } catch (e) { 
        console.log(e);
        return res.send(JSON.stringify({ 
            "status": SessionExpireStatus,  
            "message": e, 
            "data": {}  
        })); 
    }  
}; 
  
exports.testUser = function (req, res) {
    connectPool.getConnection(function(err, connection) {
        if (err) {
            //connection.release();
            console.log(' Error getting mysql_pool connection: ' + err);
            throw err;
        }

    connection.query('SELECT * from users', function (error, results) { 
        connection.release(); 
        if(results[0].cnt < 0){
            return res.send(JSON.stringify({
                "status": 404,
                "error": 'No record found.', 
            }));
        }else{ 
            connection.query('SELECT * from users', function (error, results, fields) {
                if (error)
                    throw error;			 
                    return res.send(JSON.stringify({
                        "status": 200,
                        "message": 'success.', 
                        "country": results, 
                    }));   
            });
        }    
    });
     
});
};

exports.uploadUserImage = function (req, res) {
    
    if(req.files && req.files.image){  
            var image = req.files.image;  
        Request.post({ 
            "headers": { "content-type": "application/json" },
            "url": siteUrl +"Apiusers/uploadUserImage",
            "body": JSON.stringify({ 
                "userImage": req.files.image.name,
                "userId": 125
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

 

