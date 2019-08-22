var express = require('express');
var router = express.Router();
 
var ConstructorController    = require('../controllers/ConstructorController');  
var CommonsController    = require('../controllers/CommonsController'); 
var CustomerController    = require('../controllers/CustomerController'); 
var MailsController    = require('../controllers/MailsController'); 
var AdminController    =  require('../controllers/admin/AdminController');  
var CategoriesController    =  require('../controllers/admin/CategoriesController');  
var UsersController    =  require('../controllers/admin/UsersController');   
var ProductsController    =  require('../controllers/admin/ProductsController');   
  
/* Constructor detail API  */
router.post('/constructor/sign-up', ConstructorController.signUp);  
router.post('/constructor/login', ConstructorController.login);  
router.get('/constructor/membershipList', ConstructorController.membershipList);
router.post('/constructor/updateProfile', ConstructorController.updateProfile);  
router.get('/constructor/constructorDetail', ConstructorController.constructorDetail);   
router.get('/constructor/projectList', ConstructorController.projectList);   
router.post('/constructor/addProject', ConstructorController.addProject);    
router.get('/constructor/projectDetail', ConstructorController.projectDetail);     
router.get('/constructor/customerList', ConstructorController.customerList);     
router.get('/constructor/notifications', ConstructorController.notifications);      
router.post('/constructor/updateMilestone', ConstructorController.updateMilestone);      
router.get('/constructor/deletePortfolioImage', ConstructorController.deletePortfolioImage);       
router.post('/constructor/updateLocation', ConstructorController.updateLocation);        
router.get('/constructor/deleteLocation', ConstructorController.deleteLocation); 
router.post('/constructor/updateBankDetail', ConstructorController.updateBankDetail); 
router.get('/constructor/getBankDetail', ConstructorController.getBankDetail);  
router.get('/constructor/transactionHistory', ConstructorController.transactionHistory);   
router.get('/constructor/membershipTransactions', ConstructorController.membershipTransactions);   
router.get('/constructor/getMembershipData', ConstructorController.getMembershipData);    
  

/* Customer detail API  */
router.get('/customer/constructorList', CustomerController.constructorList); 
router.post('/customer/constructorDetail', CustomerController.constructorDetail); 
router.post('/customer/sign-up', CustomerController.signUp);   
router.post('/customer/login', CustomerController.login);    
router.get('/customer/getProfile', CustomerController.getProfile);          
router.post('/customer/updateUserProfile', CustomerController.updateUserProfile);          
router.get('/customer/projectList', CustomerController.projectList);            
router.get('/customer/projectDetail', CustomerController.projectDetail);            
router.get('/customer/notifications', CustomerController.notifications);               
router.get('/customer/transactionHistory', CustomerController.transactionHistory);                
router.post('/customer/submitReview', CustomerController.submitReview);                 
router.get('/customer/test', CustomerController.test);                 
router.get('/customer/getSubscription', CustomerController.getSubscription);                 
//router.post('/customer/logout', CustomerController.logout);    
 
 
/* Common APIs  */
router.post('/constructor/forgotPassword', CommonsController.forgotPassword);          
router.post('/customer/forgotPassword', CommonsController.forgotPassword);           
router.get('/constructor/categoryList', CommonsController.categoryList); 
router.get('/customer/categoryList', CommonsController.categoryList); 
router.post('/customer/changePassword', CommonsController.changePassword);  
router.post('/constructor/changePassword', CommonsController.changePassword);  
router.post('/constructor/updateToken', CommonsController.updateToken);  
router.post('/customer/updateToken', CommonsController.updateToken);   
router.post('/customer/logout', CommonsController.logout);   
router.post('/constructor/logout', CommonsController.logout);    
   
/** Routes for admin  */ 
router.get('/admin/login', AdminController.login);     
router.post('/admin/login', AdminController.login);     
router.get('/admin/Dashboard', requiredAuthentication, AdminController.dashboard); 
    
/** Routes for category module  */ 
router.get('/admin/Categories/list', requiredAuthentication , CategoriesController.list);     
router.get('/admin/Categories/edit/:id', requiredAuthentication, CategoriesController.edit);     
router.post('/admin/Categories/edit/:id', CategoriesController.edit); 
router.post('/admin/Categories/add', requiredAuthentication, CategoriesController.add); 
router.get('/admin/Categories/add', requiredAuthentication, CategoriesController.add); 
router.get('/admin/Categories/delete/:id', requiredAuthentication, CategoriesController.deleteRecord);   

/** Routes for users module  */ 
router.get('/admin/Users/list',requiredAuthentication,  UsersController.list);     
router.get('/admin/Users/edit/:id', requiredAuthentication, UsersController.edit);     
router.post('/admin/Users/edit/:id',requiredAuthentication,  UsersController.edit); 
router.post('/admin/Users/add',requiredAuthentication, UsersController.add); 
router.get('/admin/Users/add', requiredAuthentication, UsersController.add); 
router.get('/admin/Users/delete/:id', requiredAuthentication, UsersController.deleteRecord);

/** Routes for users Products  */ 
router.get('/admin/Products/list',requiredAuthentication,  ProductsController.list);     
router.get('/admin/Products/edit/:id', requiredAuthentication, ProductsController.edit);     
router.post('/admin/Products/edit/:id',requiredAuthentication,  ProductsController.edit);   
router.post('/admin/Products/add',requiredAuthentication, ProductsController.add); 
router.get('/admin/Products/add', requiredAuthentication, ProductsController.add); 
router.get('/admin/Products/delete/:id', requiredAuthentication, ProductsController.deleteRecord);   
router.get('/admin/Products/images/:id', requiredAuthentication, ProductsController.images);   
router.post('/admin/Products/images/:id', requiredAuthentication, ProductsController.images);   
router.get('/admin/Products/deleteImage/:id', requiredAuthentication, ProductsController.deleteImage); 
router.get('/admin/Products/setDefaultImage/:id/:product_id', requiredAuthentication, ProductsController.setDefaultImage);  
router.get('/Products/getProductlist', ProductsController.getProductlist);   
  
router.get('/admin/logout', AdminController.logout);         
module.exports = router;       

function requiredAuthentication(req, res, next) {
    next(); 
    // if(req.session){
    //     LoginUser = req.session.LoginUser; 
    //     if(LoginUser){    
    //         next();   
    //     }else{
    //         res.redirect(nodeAdminUrl+'/login');       
    //     } 
    // }else{
    //     res.redirect(nodeAdminUrl+'/login');       
    // }
}