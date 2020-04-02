const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const connection = mysql.createPool({
	connectionLimit: 100,
	host: 'localhost',
	user: 'root',
	database: 'LearningGroupsDB',
	password: 'rootpassword'
});
const fileUpload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
const port = 3000;


app.use(fileUpload({ createParentPath: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static('uploads'));
app.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});



app.post('/uploadFile', async (req, res) => {
	try {
		if(!req.files) {
			console.log("NO FILE")
			res.send({
				status: false,
				message: 'No file uploaded'
			});
		} else {
			console.log(req.files);
			let file = req.files.file;

			let extension = [];

			for (let i = file.name.toString().length; i >= 0; i--) {
				extension.unshift(file.name.toString()[i]);
				if (file.name.toString()[i] == '.') {
					break;
				}
			}

			file.mv('./uploads/' + file.md5 + extension.join(''));

			// res.send({
			// 	status: true,
			// 	message: 'File is uploaded',
			// 	data: {
			// 		name: file.md5 + extension.join(''),
			// 		mimetype: file.mimetype,
			// 		size: file.size
			// 	}
			// });
			res.send({name: file.md5 + extension.join('')});
		}
	} catch (err) {
		res.status(500).send(err);
	}
});

app.post('/upload-photos', async (req, res) => {
	try {
		if(!req.files) {
			res.send({
				status: false,
				message: 'No file uploaded'
			});
		} else {
			let data = [];

			_.forEach(_.keysIn(req.files.files), (key) => {
				let file = req.files.files[key];
				let extension = [];

				for (let i = file.name.toString().length; i >= 0; i--) {
					extension.unshift(file.name.toString()[i]);
					if (file.name.toString()[i] == '.') {
						break;
					}
				}

				file.mv('./uploads/' + file.md5 + extension.join(''));

				data.push({
					name: file.md5 + extension.join(''),
					mimetype: file.mimetype,
					size: file.size
				});
			});

			res.send({
				status: true,
				message: 'Files are uploaded',
				data: data
			});
		}
	} catch (err) {
		res.status(500).send(err);
	}
});



app.get('/auth', (req, res) => {
	let login = req.query.login;
	let passhash = req.query.passwordhash;

	let sql = 'SELECT * FROM users WHERE login = (?) and passwordhash = (?)';

	connection.query(sql, [login, passhash], (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results[0]);
	});
});

app.get('/getMemberData', (req, res) => {
	let id = req.query.id;

	let sql = 'SELECT * FROM membersdata WHERE ID = (?)';

	connection.query(sql, [id], (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results[0]);
	});
});

app.post('/regUser', (req, res) => {
	let querydata = Object.values(req.body);

    let sql = 'INSERT INTO users (login, passwordhash, firstname, lastname, nickname) VALUES (?,?,?,?,?)';

    connection.query(sql, querydata, (err, results) => {
        if (err) return console.log(err);
        console.log(results);
        res.send(results);
    });
});



app.get('/getGroup', (req, res) => {
	let id = req.query.id;

	let sql = 'SELECT * FROM usergroups WHERE ID IN (?)';

	connection.query(sql, [id], (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});

app.get('/getGrouping', (req, res) => {
	let userid = req.query.userid;
	let groupid = req.query.groupid;

	let sql = 'SELECT * FROM usergrouping';
	let querydata = [];

	if (userid != null) {
		sql = 'SELECT * FROM usergrouping WHERE user_id = (?)';
		querydata.push(userid);
	}

	if (groupid != null) {
		sql = 'SELECT * FROM usergrouping WHERE group_id = (?)';
		querydata.push(groupid);
	}

	connection.query(sql, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});

app.post('/addUserToGroup', (req,res) => {
	let querydata = Object.values(req.body);

	let sql1 = 'INSERT INTO usergrouping(User_ID, Group_ID) VALUES (?,?)';
	let sql2 = 'INSERT INTO evaluating(lesson_ID) SELECT ID FROM lessons WHERE Group_ID = ?';
	let sql3 = 'INSERT INTO learning(User_ID, Evaluation_ID) VALUES (?,?)';
	let sql4 = 'UPDATE learning SET Evaluation_ID = (?) WHERE User_ID = (?)';

	connection.query(sql1, querydata, (err, results) => {
		if (err) {
			console.log(err);
			res.send(err);
			return;
		}
		console.log("USERGROUPING INSERT");
		console.log(results);

		connection.query(sql2, [querydata[1]], (err, results) => {
			if (err) {
				console.log(err);
				res.send(err);
				return;
			}
			console.log("EVALUATING INSERT");
			console.log(results);

			let start_id = results.insertId;
			let end_id = results.affectedRows + start_id;

			for (let i = start_id; i < end_id; i++) {
				connection.query(sql3, [querydata[0], i], (err, results) => {
					console.log("LEARNING INSERT");
					if (err) {
						console.log(err);
						res.send(err);
						return;
					}
					console.log(results);
				});
			}
		});
	});
});



app.get('/getNews', (req, res) => {
	let groupid = req.query.groupid;
	
	let querydata = [];
	querydata.push(groupid);

	let sql = 'SELECT * FROM news WHERE ID IN (SELECT New_ID FROM informing WHERE Group_ID IN (?)) ORDER BY datedmy DESC';
	connection.query(sql, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});

app.post('/postNew', (req, res) => {
	let groupid = req.query.groupid;
	let querydata = Object.values(req.body);
	
	let sql1 = 'INSERT INTO news (datedmy, title, body, epilogue) VALUES (?,?,?,?)';
	let sql2 = 'INSERT INTO informing (group_id, new_id) VALUES (?,?)';
	connection.query(sql1, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		
		let nextquerydata = [groupid, results.insertId];
		
		connection.query(sql2, nextquerydata, (err, results) => {
			if (err) return console.log(err);
			console.log(results);
			res.send(results);
		});
	});
});

app.get('/getInforming', (req, res) => {
	let groupid = req.query.groupid;

	let sql = 'SELECT * FROM informing WHERE Group_ID IN (?)';
	connection.query(sql, [groupid], (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});



app.get('/getLearning', (req, res) => {
	let login = req.query.login;
	let group = req.query.group;

	let querydata = [];
	querydata.push(login);

	let sql = 'SELECT * FROM learning WHERE User_ID = (SELECT ID FROM users WHERE Login = (?))';
	connection.query(sql, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});


app.get('/getLessons', (req, res) => {
	let loginid = req.query.loginid;
	let groupid = req.query.groupid;
	
	let querydata = [];
	querydata.push(loginid);
	querydata.push(groupid);
	
	let sql = 'SELECT * FROM lessons WHERE ID IN (SELECT Lesson_ID FROM evaluating WHERE ID IN (SELECT Evaluation_ID FROM learning WHERE User_ID = (?))) AND Group_ID IN (?) ORDER BY datedmy DESC';
	connection.query(sql, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});

app.post('/postLesson', (req, res) => {
	let querydata = Object.values(req.body);

	let sql1 = 'INSERT INTO lessons (group_id, datedmy, theme, homework, profcomment) VALUES(?,?,?,?,?)';
    let sql2 = 'INSERT INTO evaluating (lesson_id) VALUES (?)';
    let sql3 = 'INSERT INTO learning (user_id) SELECT user_id FROM usergrouping WHERE group_id = (?)';
    let sql4 = 'UPDATE learning SET evaluation_id = (?) WHERE user_id IN (SELECT user_id FROM usergrouping WHERE group_id = (?))'
	connection.query(sql1, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);

        connection.query(sql2, [results.insertId], (err, results) => {
            if (err) return console.log(err);
            console.log(results);

            connection.query(sql3, [querydata[0]], (err, results) => {
                if (err) return console.log(err);
                console.log(results);

                for(let i = 0; i < results.affectedRows; i++) {
                    connection.query(sql4, [i+results.insertId, querydata[0]], (err, results) => {
                        if (err) return console.log(err);
                        console.log(results);
                    });
                }
            });
        });
	});
});


app.get('/getUserMarks', (req, res) => {
	let login = req.query.login;
	let group = req.query.group;
	let lesson_IDs = req.query.lessonsids;
	console.log(lesson_IDs);

	let querydata = [];
	querydata.push(login);
	querydata.push(lesson_IDs);

	let sql = 'SELECT * FROM marks WHERE ID IN ' +
		'(SELECT Mark_ID FROM evaluating WHERE ID IN ' +
		'(SELECT Evaluation_ID FROM learning WHERE User_ID = (SELECT ID FROM users WHERE login = (?))) AND Lesson_ID IN (?))';
	connection.query(sql, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});

app.post('/putUserMark', (req, res) => {
	let querydata = Object.values(req.body);
	
	let sql = 'INSERT INTO marks (mark) VALUES(?)';
	connection.query(sql, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});

app.get('/getEvaluation', (req, res) => {
	let login = req.query.login;
	let group = req.query.group;
	
	let querydata = [];
	querydata.push(login);
	
	let sql = 'SELECT * FROM evaluating WHERE ID IN (SELECT Evaluation_ID FROM learning WHERE User_ID = (SELECT ID FROM users WHERE Login = (?)))';
	connection.query(sql, querydata, (err, results) => {
		if (err) return console.log(err);
		console.log(results);
		res.send(results);
	});
});



let Messages = [];

app.get('/getMessages', (req, res) => {
    console.log(Messages);
    res.send(JSON.stringify(Messages));
});

io.use((socket, next) => {
    let room = socket.handshake.query.room;
    return next();
});

io.on('connection', function(socket) {
    let room = socket.handshake.query.room;
    console.log(room);
    socket.join(room);
    console.log("connected");

    socket.on('message', function(message) {
        io.in(room).emit('message', message);
        console.log(JSON.parse(message));
        Messages.push(JSON.parse(message));
    });

    socket.on('disconnect', function() {
        console.log("disconnected");
        socket.leave(room);
    });

    socket.on('leave', function () {
        socket.leave(room);
    });
});



http.listen(port, function(){
    console.log('listening on localhost:' + port);
});
