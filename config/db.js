if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://richardcs:1234@blogapp-prod.tnlo3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}

}