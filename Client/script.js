var Client = {
	connect: function() {
		c.sock = new WebSocket("ws://potatobox.no-ip.info:13579", 'echo-protocol')
		c.sock.onmessage = function (evt) { 
			var span = document.createElement("span")
			span.textContent = evt.data
			get("chat").appendChild(span)
			get("chat").appendChild(document.createElement("br"))
			get("chat").scrollTop = get("chat").scrollHeight
		}
		c.sock.onopen = function() {
			c.sock.send(JSON.stringify({"type" : "init", "data" : c.name}))
		}
		c.sock.onclose = function() { 
			alert("Disconnected from Server")
		}
		c.name = get("name").value
		get("stat").textContent = "Connected as: " + c.name
		get("connect").style.visibility = "hidden"
		get("chat").style.visibility = "visible"
		get("input").style.visibility = "visible"
	},
	resize: function() {
		c.repos("chat", 70, 10, window.innerWidth - 26, window.innerHeight - 146)
		c.repos("chatInput", window.innerHeight - 61, 10, window.innerWidth - 351, 50)
		c.repos("send", window.innerHeight - 61, window.innerWidth - 331, 100, 50)
		c.repos("list", window.innerHeight - 61, window.innerWidth - 221, 100, 50)
		c.repos("clear", window.innerHeight - 61, window.innerWidth - 111, 100, 50)
		c.repos("roomInput", 10, 10, 200, 50)
		c.repos("room", 10, 220, 100, 50)
		c.repos("stat", 20, 330)
	},
	repos: function(id, t, l, w, h) { 
		get(id).style.top = t
		get(id).style.left = l
		if (w != undefined) {
			get(id).style.width = w
			get(id).style.height = h
		}
	},
	send: function() {
		if (get("chatInput").value.length < 500) {
			c.sock.send(JSON.stringify({"type" : "message", "data" : get("chatInput").value}))
		}
		else {
			alert("Message too long!")
		}
		get("chatInput").value = ""
	},
	list: function() {
		c.sock.send(JSON.stringify({"type" : "list"}))
	},
	room: function() {
		c.sock.send(JSON.stringify({"type" : "room", "data" : get("roomInput").value}))
	},
	clear: function() {
		get("chat").innerHTML = ""
	}
}

get = function(id) {return document.getElementById(id)}

var c = Client

window.onresize = c.resize
c.resize()