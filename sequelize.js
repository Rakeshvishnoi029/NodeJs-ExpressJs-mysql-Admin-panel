const Sequelize = require('sequelize')
const SubscriptionModel = require.main.require('./models/subscription'); 
const ProductsModel = require.main.require('./models/products'); 
const MembershipTransactions = require.main.require('./models/MembershipTransactions'); 
const ProductImages = require.main.require('./models/ProductImages');  
const CategoryModel = require.main.require('./models/Categories');  
//const SubscriptionModel = require('./models/subscription') 
const sequelize = new Sequelize('construction_app_admin', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  pool: { 
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

global.Subcription = SubscriptionModel.Subscription(sequelize, Sequelize)
global.SQMembershipTransactions = MembershipTransactions.InitSequel(sequelize, Sequelize)

global.SQProducts = ProductsModel.InitSequel(sequelize, Sequelize)
global.SQProductImages = ProductImages.InitSequel(sequelize, Sequelize)
global.SQCategory = CategoryModel.InitSequel(sequelize, Sequelize)
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
// const BlogTag = sequelize.define('blog_tag', {})
// const Blog = BlogModel(sequelize, Sequelize)
// const Tag = TagModel(sequelize, Sequelize)

// Blog.belongsToMany(Tag, { through: BlogTag, unique: false })
// Tag.belongsToMany(Blog, { through: BlogTag, unique: false })
// Blog.belongsTo(User);
// User.hasMany(Blog); 
//Subcription.hasMany(SQMembershipTransactions);  
Subcription.hasMany(SQMembershipTransactions, { foreignKey: 'subscription_id' }) 
SQProducts.hasMany(SQProductImages, { foreignKey: 'product_id' })  
SQProducts.belongsTo(SQCategory, { foreignKey: 'category_id' })  
 
sequelize.sync({ force: false })
  .then(() => {
    console.log(`Sequelize setp success`)
}) 

module.exports = {
  Subcription, 
  SQMembershipTransactions,
  SQProducts,
  SQProductImages
} 