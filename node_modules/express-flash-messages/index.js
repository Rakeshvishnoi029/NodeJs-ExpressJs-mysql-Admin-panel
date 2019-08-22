'use strict'

module.exports = () => {
	return (req, res, next) => {
		req.flash = _flash
		res.locals.getMessages = _getMessages(req)
		next()
	}
}

// Create messages
function _flash(type, msg){
	if(this.session === undefined) throw Error('req.flash() requires sessions')
	const msgs = this.session.flash = this.session.flash || {}
	if(!msg){
		msg = type
		type = 'info'
	}
	msgs[type] = msgs[type] || []
	if(Array.isArray(msg)){
		msgs[type].push(...msg)
		return
	}
	msgs[type].push(msg)
}

// Get all messages
function _getMessages(req){
	return () => {
		if(req.session === undefined) throw Error('getMessages() requires sessions')
		const msgs = req.session.flash = req.session.flash || {}
		req.session.flash = {}
		return msgs
	}
}