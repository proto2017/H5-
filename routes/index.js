var express = require('express');
var router = express.Router();
var mediaPath = 'public/music';
/* GET home page. */
router.get('/', function(req, res, next) {
	var fs = require("fs");
	fs.readdir(mediaPath, function(err, files) {
		if (err) {
			console.log(err);
		} else {
		//	console.log(files);
			res.render('index', {title: '音乐可视化', music: files});
		}
	})
});

module.exports = router;
