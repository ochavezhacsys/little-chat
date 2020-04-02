module.exports = {
    exe(fs , res , folder , urls){
        if(urls[2] == "css"){
            res.end(fs.readFileSync(`${folder}/assets/css/${urls[3]}`))
        }
        if(urls[2] == "js"){
            res.setHeader('Content-Type', 'text/javascript');
            if(urls[3].search("socket.io") > -1){
                res.end(fs.readFileSync(`node_modules/socket.io-client/dist/`+urls[3]))
            }else{
                res.end(fs.readFileSync(`${folder}/assets/js/${urls[3]}`))
            }
        }
    }
}