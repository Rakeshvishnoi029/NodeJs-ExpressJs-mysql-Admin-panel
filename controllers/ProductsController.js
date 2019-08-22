var Request = require("request");      
var Categories = require.main.require('./models/Categories');   
var ProductImages = require.main.require('./models/ProductImages');   
var Products = require.main.require('./models/Products');   
const controller = 'Products'; 
const module_name = 'Products';  
  
/** 
 *  list
 *  Purpose: This function is used to show listing of all arecord
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json   
*/
async function getProductlist(req, res) { 
    res.set('content-type' , 'text/html; charset=mycharset'); 
    data = {};    
    action = 'list'; 
    const { SQProducts } = require('../sequelize')
    SQProducts.findAll({ include: [SQProductImages]}).then(SQProducts => res.json({
        "status": 200, 
        "message": 'Purchase history', 
        "data": SQProducts, 
    })).catch(function(e){
        console.log(e);
    }); 
 
    // Subcription.findAll({ include: [SQMembershipTransactions]}).then(Subcription => res.json({
    //     "status": 200, 
    //     "message": 'Purchase history', 
    //     "data": Subcription, 
    // })).catch(function(e){
    //     console.log(e);
    // }); 

    // const allRecord = await Products.getAllData();   
    // res.render('admin/'+controller+'/list',{
    //     page_title:" List",
    //     data:allRecord, 
    //     controller:controller,
    //     action:action,
    //     module_name:module_name
    // });    
};      
exports.getProductlist = getProductlist;
  
/** 
 *  Edit
 *  Purpose: This function is used to get constructor List
 *  Pre-condition:  None
 *  Post-condition: None. 
 *  Parameters: ,
 *  Returns: json  
*/
async function edit(req, res) { 
   
    res.set('content-type' , 'text/html; charset=mycharset'); 
    var action = 'edit';
    var entityDetail = {}; 
    var errorData = {};
    var categoryList = {}
    if(req.params.id){
        var id =  String("'"+req.params.id+"'");   
        entityDetail = await Products.getUserByid(id);   
        if(entityDetail.length == 0){ 
            req.flash('error', 'Invalid url')  
            return res.redirect(nodeAdminUrl+'/'+controller+'/list');  
        }  
        categoryList =  await Categories.getAllData();  
        if (req.method == "POST") { 
            var input = JSON.parse(JSON.stringify(req.body)); 
            console.log(input); console.log('Here');  
            req.checkBody('title', 'title is required').notEmpty();
            req.checkBody('category_id', 'category_id is required').notEmpty();  
            req.checkBody('description', 'Description is required').notEmpty();  
            req.checkBody('price', 'Price is required').notEmpty();  
            req.checkBody('discount', 'Discount is required').notEmpty();  
            req.checkBody('display_price', 'display_price is required').notEmpty();  
            var errors = req.validationErrors();    
            if(errors){	   
                if(errors.length > 0){
                    errors.forEach(function (errors1) {
                        var field1 = String(errors1.param); 
                        var msg = errors1.msg; 
                        errorData[field1] = msg;   
                        entityDetail[0].field1 = req.field1;
                    }); 
                }  
            }else{  
                var saveResult = '';    
                var msg =  controller+' updated successfully.';  
                var saveResult = await Products.updateUserData(input);  
                req.flash('success', msg)   
                res.locals.message = req.flash(); 
                if(saveResult){     
                    return res.redirect(nodeAdminUrl+'/'+controller+'/list');     
                }       
            }  
        } 
 
    }else{   
        req.flash('error', 'Invalid url.');  
        return res.redirect(nodeAdminUrl+'/'+controller+'/list');     
    }  
    res.render('admin/'+controller+'/edit',{
        page_title:" Edit",
        data:entityDetail,
        errorData:errorData,
        controller:controller,
        action:action,
        categories : categoryList
    });    
};          
exports.edit = edit;  
   
   