/**
 * Kore Core
 * Copyright(c) 2013 Koreviz
 * MIT Licensed
 */
var redis = require('redis').createClient()

module.exports = function() {
	return new Core()
}

var Core = function() {
	this.redis = redis

	this.list = this.search
}

Core.prototype = {

	/**
	 * del
	 */
	del: function(key, q, cb) {
		redis.keys(key + ':*' + (q ? q + '*': ''),
		function(err, list) {
			if (err)
			throw err

			if (list.length)
			redis.hgetall(list[0],
			function(err, hash) {

				console.log('    \033[36mkey: ' + list[0] + '\033[0m\n')

				redis.del(list[0],
				function(err) {
					if (err)
					throw err

					redis.decr(key + 's',
					function(err) {
						if (err)
						throw err

						hash.tags.split(',').forEach(
						function(item, index, list) {
							redis.zincrby(['tags', -1, item],
							function(err) {
								if (err)
								throw err

								if (index+1 === list.length) {
									if (cb)
									cb()
									else
									process.exit()
								}
							})	
						})						
					})
				})
			})
			else
			process.exit()
		})
	},

	/**
	 * find
	 */
	find: function(key, q, cb) {
		redis.keys(key + ':*' + (q ? q + '*': ''),
		function(err, list) {
			if (err)
			throw err

			if (list.length)
			redis.hgetall(list[0], cb)
			else
			process.exit()
		})
	},

	/**
	 * stats
	 */
	stats: function(key) {
		redis.get(key,
		function(err, val) {
			if (err)
			throw err
			
			if (val)
			console.log('    \033[36mtotal ' + key + ': ' + val + '\033[0m')

			redis.zcard('tags',
			function(err, count) {
				if (err)
				throw err

				console.log('    \033[33mtotal tags: ' + count + '\033[0m')

				redis.zrevrange(['tags', 0, 9],
				function(err, list) {
					console.log('    \033[90mtop 10 tags:')
					
					if (list.length)
					list.forEach(
					function(item, index, list) {
						redis.zscore('tags', item,
						function(err, score) {
							console.log('        ' + item + ': ' + score)

							if (index+1 === list.length) {
								console.log('\033[0m')
								process.exit()
							}
						})
					})
					else
					process.exit()
				})
				 
			})
		})
	},

	/**
	 * search
	 */
	search: function(key, q, cb) {
		redis.keys(key + ':*' + (q ? q + '*': ''),
		function(err, list) {
			if (err)
			throw err

			if (list.length)
			list.forEach(cb)
			else
			process.exit()
		})
	}
}