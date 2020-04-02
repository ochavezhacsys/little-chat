const http = require('http');
const routesViews = require('./routes/views.js');
const routesStatic = require('./routes/static.js');
const fs = require('fs')
const mode = "dev"
const env = JSON.parse(fs.readFileSync("app/env.json"))[mode]

const userActions = require("./models/userActions")
const chatActions = require("./models/chatActions")
let { user , chat } = require('./database/sequelize')(["user","chat"] , fs)

let transtactions = [
    new userActions ( user ) ,
    new chatActions ( chat )
]

const server = http.createServer( (req, res) => {
    res.statusCode = 200;
    res.json = data =>{
        res.setHeader('Content-Type', 'application/json');
        res.end( JSON.stringify( data ) )
    }
    const proccessRequest = () =>{
        let urls = req.url.split("/")
        if(urls[1] == "api"){
            req.urlApi = req.url.replace("/api/","").split("/")
            for(let a of transtactions){
                a.routes( req , res )
            }
        }else{
            if( routesViews.exe( fs , res , req , env ) ){
                if(urls[1] == "static"){
                    routesStatic.exe( fs , res , "app/public" , urls)
                }
            }
        }
    }
    if(req.method == "POST" || req.method == "PUT"){
        req.on('data', data => {
            req.body = JSON.parse( data )
            proccessRequest()
        })
    }else{
        proccessRequest()
    }
    
});


var io = require('socket.io')(server);
io.on('connection', function(socket){
    const res = {
        json(data){
            io.emit("chat", JSON.stringify( data ) );
        }
    }
    socket.on('chat-post', function(msgText){
        let data = JSON.parse(msgText)
        let req = {method:"POST", url:data.url, body:data.body}
        req.urlApi = req.url.replace("/api/","").split("/")
        for(let a of transtactions){
            a.routes( req , res )
        }
    })
    socket.on('chat-put', function(msgText){
        let data = JSON.parse(msgText)
        let req = {method:"PUT", url:data.url, body:data.body}
        req.urlApi = req.url.replace("/api/","").split("/")
        for(let a of transtactions){
            a.routes( req , res )
        }
    })
    
})

server.listen(env.port, env.host, () => {
    console.log("Server run ", env )
});