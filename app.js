// 1º - CARREGANDO MODULOS - npm install --save <nomeDoModulo>
const express = require('express');  //// npm install --save express
const handlebars = require('express-handlebars'); // npm install --save express-handlebars
const bodyParser = require('body-parser'); // npm install --save body-parser
const mongoose = require('mongoose'); // npm install --save mongoose
const session = require('express-session') // npm install --save express-session
const flash = require('connect-flash'); // npm install --save connect-flash
const app = express();
const admin = require('./Routes/admin') // menciona os arquivos dos grupos de rotas criados
const path = require('path'); // diretório padrao do node que serve para manipular pastas da aplicacao
// const { info } = require('console');  apagar esse
require("./models/Postagem")  // chama o Model de Postagem
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('./Routes/usuario');
const passport = require('passport');
require("./config/auth")(passport)  // autenticaçao de usuarios atraves do functin passport (no auth.js module.exports)
const db = require("./config/db")

// 2º - CONFIGURAÇÕES
    // 2.1 Configurando Sessão  - app.use() >> serve para criaçao e configuração de midlewares
    app.use(session({
        secret: "cursodende",  // tipo uma chave para gerar uma sessao, pode ser qualqer valor/resultado
        resave: true,
        saveUninitialized: true
    }))
    // 2.1.1 Configurando passport para autenticaçao de usuarios
    app.use(passport.initialize())
    app.use(passport.session())

    // 2.1.2 - Configurando o flash
    app.use(flash());
    // 2.1.3 - Configurando o Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")//  criando duas variaveis globais (pode ser acessar em qualquer parte da aplicaçao) >> res.locals.<nomeVariavel>
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null // res.locals.user armazenara a variavel usuario autenticado // req.user do passport para fazer a armazenagem de usuario autenbticado 
        next()
    })

    // 2.2 - Configurando o Body-Parser
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    // 2.3 - Configurando o Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    // 2.4 - Configurando o Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI , {
        useNewUrlParser: true, useUnifiedTopology: true
    }).then(()=>{
        console.log("Conectado ao mongoDB")
    }).catch((err) => {
        console.log('Erro ao se conectar: ' + err)
    })
    // 2.5 - Configurando a Pasta Public (arquivos staticos - js,css,img, bootstrap)
    app.use('/static', express.static(path.join(__dirname + '/public')));// menciona que todos os arquivos estaticos estao na pasta 'public'
    // Criando um Middleware
            // responsavel pela comunicação/ itermediaçao entre as request client e server, assim, com o middleware é posvveil manipular as request e response antes de chegar ao seus destinos
    app.use((req, res, next)=>{
        console.log('Middleware activate')  // aparecera a cada request ao servidor
        next()  // esse comando ira passar a requisição
    })

// 3º - ROTAS
    // 3.1 - Criando a rota Principal - HOME PAGE das postagens
    app.get('/', function (req, res) {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
            res.render("index", {postagens:postagens})
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get('/404', (req,res) =>{
        res.send("erro 404")
    })

    app.get("/postagem/:slug", (req,res) =>{
        Postagem.findOne({slug:req.params.slug}).lean().then((postagens,categoria) =>{ // Pesquisara uma postagem (findOne) pelo slug dela (slug:) sendo passado pelo parametro da rota req.params.slug
            if(postagens){
                res.render("postagem/index", {postagens:postagens,categoria:categoria})
            }else{
                req.flash("error_msg","Esta postagem não existe")
                res.redirect("/")
            }

        }).catch((err) =>{
            req.flash("error_msg", "")
            res.redirect("/")
        })
    })

    // 3.2 - Criando rotas através de prefixo de rotas >> http://localhost:3000/"admin"/posts 
    //app.use('/admin' >>> PrefixoDeRota, admin  >>> const criada mencionado o arquivo das rotas)
    app.use('/admin', admin) // chama a const criada para as rotas, no ex. foi admin
    // nesse caso, é criado uma path (prefixo de rotas) /admin/<com as rotas criadas no arquivo admin>
    // sendo a rota:  http://localhost:3000/admin/ // http://localhost:3000/admin/posts  // http://localhost:3000/admin/categorias



    // ---------------------rotas CATEGORIA ---------------------------
    // rota para listagem de categorias
    app.get("/categorias", (req, res) =>{
        Categoria.find().lean().then((categorias) =>{
            res.render("categorias/index", {categorias: categorias}) // arquivo na view
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro intern ao listar as categorias!")
            res.redirect("/")
        })
    })


    //criando rota categoria ao selecionar a categoria
    app.get("/categorias/:slug", (req,res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{  // buscara as categorias que pertence o id que for passado no browser pelo slug
                                 res.render("categorias/postagens", {postagens: postagens, categoria: categoria})    
                                //res.render("categorias/postagens", {postagens:postagens.map(Categoria=> Categoria.toJSON())})
                                }).catch((err)=>{
                                    console.log(err)
                                    req.flash("error_msg","Houve um erro ao listar os posts!")
                                    res.redirect("/")
                                })
            }else{
                req.flash("error_msg", "Essa categoria não existe!")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno ao carregar página desta categoria!")
            res.redirect("/")
        })
    })

//REGISTRO DE USUARIOS PARA AUTENTITAÇÃO
    app.use('/admin', admin)
    app.use("/usuarios", usuarios)


// 4º - OUTROS
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{console.log("SERVIDOR RODANDO...")})