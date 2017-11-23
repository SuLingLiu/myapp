var express = require('express');
var router = express.Router();

var rootData = [{
	"id": "1",
	"name": "我的上线同事我的上线同事我的上线同事我的上线同事我的上线同事我的上线同事我的上线同事",
	"level": 1,
	"online": 20,
	"total": 100,
	"sub_org_size": 2,
	"users_size": 0
}, {
	"id": "2",
	"name": "线下",
	"level": 1,
	"online": 20,
	"total": 100,
	"sub_org_size": 2,
	"users_size": 0
}];


router.get('/num', function (req, res) {
	var name = req.query.name,
		level = req.query.level,
		id = req.query.id,
		parentId = req.query.parentId;

	var data = {
		"id": id,
		"name": name,
		"level": 2,
		"online": 20,
		"total": 100,
		"sub_org_size": 2,
		"users_size": 0,
		"sub_org": [{
			"id": id + "-1",
			"total": 10,
			"name": id + "售前",
			"level": 2,
			"parentId": "1",
			"sub_org_size": 0,
			"users_size": 5
		}, {
			"id": id + "-2",
			"total": 10,
			"name": id + "售后",
			"level": 2,
			"parentId": "1",
			"sub_org_size": 0,
			"users_size": 5
		}],
		"users": [{
			"uid": "1",
			"nickname": id + "小美",
			"pwd": "",
			"name": "张海",
			"date": "2017-09-10 18:50:20",
			"account": "89569578",
			"online": true,
			"server": "4"
		}, {
			"uid": "1",
			"nickname": id + "小li",
			"pwd": "",
			"name": "小丽",
			"date": "2017-09-10 18:50:20",
			"account": "89569578",
			"online": false,
			"server": "4"
		}]
	};
	res.json({
		success: true,
		content: (id ? data : rootData)
	})
});

module.exports = router;