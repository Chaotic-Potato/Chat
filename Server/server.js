var Server = {
	clients: [],
	init: function() { 
		s.WebSocketServer = require('websocket').server
		s.http =  require("http") 
		s.server = s.http.createServer(function(res, req){}).listen(13579)
		s.wsServer = new s.WebSocketServer({
			httpServer: s.server,
			autoAcceptcons: false
		})
		s.wsServer.on('request', function(r) {
			var con = r.accept('echo-protocol', r.origin)
			con.room = "MAIN"
			s.clients.push(con)
			con.on('message', function(message) {
				var m = JSON.parse(message["utf8Data"])
				if (m["type"] == "init") {
					if (s.nameValid(m["data"])) {
						con.name = m["data"]
						s.send("[" + new Date().toLocaleTimeString() + "] " + m["data"] + " connected.")
					}
					else {
						con.sendUTF("Name Invalid!")
						con.close()
						return
					}
				}
				if (m["type"] == "list" || m["type"] == "init") {
					con.sendUTF("People online (" + s.clients.length + "): ") 
					for (i in s.clients) {
						if (s.clients[i].name != undefined) {
							con.sendUTF(s.clients[i].name + " (" + s.clients[i].room + ")")
						}
					}
				}
				else if (m["type"] == "message") {
					if (m["data"].length < 500) {
						s.newMessage(m["data"], con.name, con.room)
					}
				}
				else if (m["type"] == "room"){
					if (m["data"].length < 25 && m["data"].toUpperCase() != con.room) {
						s.send("[" + new Date().toLocaleTimeString() + "] " + con.name + " moved from '" + con.room + "' to '" + m["data"].toUpperCase()  + "'")
						con.room = m["data"].toUpperCase()
					}
				}
			})
			con.on('close', function(reasonCode, description) {
				if (con.name != undefined) {
					s.send("[" + new Date().toLocaleTimeString() + "] " + con.name + " disconnected.")
				}
				for (i in s.clients) {
					if (s.clients[i] == con) {
						s.clients.splice(i, 1)
					}
				}
			});
		})
	},
	newMessage: function (m, name, room) {
		s.send("[" + new Date().toLocaleTimeString() + "] <" + name + "> " + m, room)
	},
	send: function(m, room) {
		for (var i in s.clients){
			if (s.clients[i].room == room || room == undefined) {
				s.clients[i].sendUTF(m)
			}
		}
		console.log(m + " (To Room " + room + ")")
	},
	nameValid: function(name) {
		for (i in s.clients) {
			if (s.clients[i].name == name || name.length > 25) {
				return false
			}
		}
		return true
	}

}

function decode(string) {
	r = ""
	for (i in string) {
		r += (string.charAt(i) == "+" ? " " : string.charAt(i))
	}
	return decodeURIComponent(r)
}

var s = Server

s.init()