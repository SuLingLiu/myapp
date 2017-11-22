var express = require('express');
var router = express.Router();

router.get('/num', function(req, res) {
	res.json({
		title: 1
	})
});

module.exports = router;