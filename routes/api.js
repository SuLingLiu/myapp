var express = require('express');
var router = express.Router();
var num = 0;
var rootNum = 0;



router.get('/num', function (req, res) {
	var name = req.query.name,
		level = req.query.level,
		id = req.query.id,
		parentId = req.query.parentId;
	++num;
	var data = {
		"id": id,
		"name": name,
		"level": 2,
		"online": 20,
		"total": 100,
		"sub_org_size": 2,
		"users_size": 2,
		"sub_org": [{
			"id": id + "-" + num,
			"total": 10,
			"name": id + "b" + num + "售前",
			"level": 2,
			"parentId": "1",
			"sub_org_size": 0,
			"users_size": 5
		}, {
			"id": id + "-" + num,
			"total": 10,
			"name": id + "b" + num + "售后",
			"level": 2,
			"parentId": "1",
			"sub_org_size": 0,
			"users_size": 5
		}],
		"users": [{
			"uid": id + "-" + num + '账号',
			"nickname": id + "-" + "小美",
			"pwd": "",
			"name": "张海",
			"date": "2017-09-10 18:50:20",
			"account": "89569578",
			"online": true,
			"server": "4"
		}, {
			"uid": id + "-" + num + '账号',
			"nickname": id + "-" + "小li",
			"pwd": "",
			"name": "小丽",
			"date": "2017-09-10 18:50:20",
			"account": "89569578",
			"online": false,
			"server": "4"
		}]
	};
	var rootData = [{
		"id": ++rootNum,
		"name": rootNum + 'old文件夹',
		"level": 1,
		"online": 20,
		"total": 100,
		"sub_org_size": 2,
		"users_size": 2
	}, {
		"id": ++rootNum,
		"name": rootNum + 'old文件夹',
		"level": 1,
		"online": 20,
		"total": 100,
		"sub_org_size": 2,
		"users_size": 2
	}];
	res.json({
		success: true,
		content: (id ? data : rootData)
	})
});

router.get('/add', function (req, res) {
	var name = req.query.name,
		level = req.query.level,
		id = req.query.id,
		parentId = req.query.parentId;
	++num
	var data = {
		"id": id + '-' + num,
		"name": "新建-" + num,
		"level": level,
		"parentId": id,
		"total": 0
	};
	var rootData = {
		"id": ++rootNum,
		"name": rootNum + 'old文件夹',
		"level": 1,
		"online": 20,
		"total": 100,
		"sub_org_size": 2,
		"users_size": 2
	}
	res.json({
		success: true,
		content: id ? data : rootData
	})
});

module.exports = router;