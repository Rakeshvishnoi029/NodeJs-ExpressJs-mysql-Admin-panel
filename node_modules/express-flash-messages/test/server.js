'use strict'
const express = require('express')
const session = require('express-session')
const open = require('open')
const flash = require('../index.js')


const app = express()
app.use(session({
	secret: 'secret'
}))
app.use(flash())
app.set('views', './test/views')
app.set('view engine', 'pug')


app.get('/', (req, res) => {
	req.flash('This is a test notification.')
	res.render('index')
})
app.get('/redirect', (req, res) => {
	req.flash('info', 'Successfully redirected!')	
	res.redirect('/')
})
app.get('/multiple', (req, res) => {
	req.flash('info', 'Multiple notifications.')	
	res.redirect('/')
})
app.get('/error', (req, res) => {
	req.flash('error', 'This is a test error.')
	res.redirect('/')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log(`Listening on port ${port}`)
})

open(`http://localhost:${port}/`)

