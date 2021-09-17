//CADA ARQUIVO PODE SER SALVO AS ROTAS RELACIONADAS A ETAPA.
// Nesse caso, esse arquivo serve para todas as rotas relacioandas a etapa de adm do blogs

const express = require("express")
const router = express.Router()  // esse comando serve para criar rotas em arquivos separados ao do controler.
//FORMA DE USAR UM MODEL DE FORMA EXTERNA DENTRO DO MONGOOSE:
const mongoose = require('mongoose'); // IMPORTA O MONGOOSE
require('../models/Categoria')        // CHAMA O ARQUIVO DO MODEL
const Categoria = mongoose.model('categorias')  // CHAMA O MONGOOSE.MODEL() QUE PASSARA UMA REFERENCIA DESSE MODEL PARA UMA VARIAVEL, NO EX:Categoria
//o parametro 'categoria' está sendo buscado no arquivo Categoria.js >> mongoose.model("categorias", Categoria)
require("../models/Postagem")
const Postagem = mongoose.model('postagens')
const {eAdmin} = require("../helpers/eAdmin") // {eAdmin} >> pega apenass a funcao eAdmin de helpers/eAdmin.js
// para rota que eu quiser proteger o acesso, colocar eAdmin, na função de rota


router.get('/', function (req, res) {
    res.render("admin/index") // render() >> renderiza o arquivo  e utilizando o handlebars é possivel criar diretório, como no ex. "admin.index"
})

router.get('/posts', eAdmin, function (req, res) {
    res.send("Pagina de Posts")
})

router.get('/categorias', eAdmin, function (req, res) {
    Categoria.find().lean().then((categorias) => {  //  Listando categorias atraves da funcao find() e no then renderiza a pagina com o objeto categorias
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) =>{
        req.flash('error_msg', "Houve um erro ao listar as categorias!")
        res.redirect('/admin')
    })

})

router.get('/categorias/add', eAdmin, function (req, res) {
    res.render("admin/addcategorias")
})

//rota para envio do cadastro de categorias
router.post('/categorias/nova', eAdmin, function (req, res) {

    // validaçao manual de formulario
    var erros = [];
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug Inválido"})  // valor textp aparecerá em addcategorias.handlebars
    }
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno!"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})  // { erros: erros} >> esse erro está estruturado no {{#each}} dentro de addcategorias.hladeblars
    }else{
        const novaCategoria = {
            nome: req.body.nome,  // .nome faz referencia ao ID=nome no arquivo addcategorias.handlebars
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")  // msg por tempo curto, pois carregar a pagina sobre a msg. aparecerá essa info caso tenha ocorrido o cadastro com sucesso, atraveis de success_ criado no 2.1.2 de app.js
            res.redirect("/admin/categorias")  // redireciona para rota mencionada
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        }) // para aparecer o req.flash message na pagina, deve-se criar uma partial exclusiva para cada message
    }
    // com .render() pode-se passar variaveis para ser renderizados na pagina
    // .flash() >> tipo de session que somente aparece uma vez, pois ao carregado uma pagina ela ja some

})

// crirando rota para ediçao das categorias - botao de edicao de cada categorias
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => { //preencher os dados de forma automatica no form
    // chama o model Categoria / .findOne() pesquisara somente um /  {_id: req.params.id} fara uma busca, no caso pelo id, sendo procure um >>> _id : através do >> res.params.id (pegara o id do navegador)
        // Categoria.findOne({_id: String(req.params.id).slice(1, 25)}).then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria});
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe.");
        res.redirect("/admin/categorias");
    });
});

// rota de ediçao  atraves do post enviado
router.post("/categorias/edit", eAdmin, (req,res)=>{
    // const categorias = new Categoria(req.body)
    // // Categoria.findOne({_id:req.body.id}).lean().then((categoria)=>{
    // Categoria.findOne({_id:req.body.id}).lean().then((categoria) => {
    //     categoria.nome = req.body.nome  //pegara o campo 'nome' da categoria a ser editada (categoria.nome) e sera atribuido nesse campo o valor que está sendo prenchido no formulario de ediçao (req.body.nome)
    //     categoria.slug = req.body.slug
    //     // ^^^^^^^^pegara aqui e atribuira ô valor que está sendo digitado no formulario pelo req.body.<nomeatribu>
    //     categorias.save().then(()=>{
        Categoria.findOneAndUpdate({_id:req.body.id},
                                    {nome:req.body.nome,slug:req.body.slug}).then(() => {
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            // console.log(err)
            req.flash("error_msg", "Houve um erro ao salvar a edição da categoria")
            res.redirect("/admin/categorias")
        })
    })
//     }).catch((err)=>{
//         req.flash("error_msg", "Houve um erro ao editar a categoria")
//         res.redirect("/admin/categorias")
//     })
// })

// rota para deletar a categoria criada
router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => { // o uso o req.body é devido nos estarmos utilizando a informaçao do formulario para deletar categoria no categorias.handle, com o campo hidden com o valor do _id
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao deletar a categoria.")
        res.redirect("/admin/categorias")
    })
})









// ----------------  criando rota de postagem  -------------------------------- //
router.get("/postagens", eAdmin, (req,res) =>{
    // Listando as postagens
                            //nome do campo no model Postagem
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) =>{
        res.render("admin/postagens", {postagens:postagens})
    }).catch((err) =>{
        req.flash("error_msg"," Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req, res) =>{  // nao esqueça de colocar.lean() antes de .then()
    Categoria.find().lean().then((categorias) =>{ // Encontre TODOS(find()) no Model Categoria e entao renderize todos os views deka na pagina postagem
        res.render("admin/addpostagem", {categorias:categorias})  // {categorias:categorias} >> passara todas as views existente para essa categoria de postagem, 
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario!")
        res.redirect("/admin")
    })
})

// criando rota para salvar postagens no BD
router.post('/postagens/nova', eAdmin, (req, res) =>{
    //criando uma validação da caixa de selecao da postagem
    var erros = []
    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria!"}) // aparecer no #each do addpostagem
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", "Postagem criada com sucesso!"),
            res.redirect("/admin/postagens")
        // caso a nova postagem seja realizada com sucesso, ocorrera a ação mencionada acima
        }).catch((err) =>{
            console.log(err)
            req.flash("error_msg", "houve um erro durante o salvamento da postagem!"),
            res.redirect("/admin/postagens")
        })
    }
})


router.get('/postagens/edit/:id', eAdmin, (req, res) => {
 //     // fazendo buscas no mongo em sequenciaada, ou seja, 1º busco por Postagem e em seguida busco por Categoria e depois é renderizado na view
    // Postagem.findById(req.params.id).lean().populate('categoria').then( (postagens) =>
    Postagem.findOne({_id:req.params.id}).lean().then((postagem) =>
    {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {postagem: postagem, categorias: categorias})
            }).catch((err) =>{
                req.flash("error_msg","Houve um erro ao listar as categorias!")
                res.redirect("/admin/postagens")
            })
    })
});

//rota para editar/atualizar postagem
router.post("/postagens/edit", eAdmin, (req,res) =>{
        const postagens = new Postagem(req.body)
    // Postagem.findOne({_id: req.body.id}).lean().then((postagem)=>{
       Postagem.findByIdAndUpdate({_id:req.body.id}).lean().then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
         // postagem.data = req.body.date   // se esta linha for valida não aparece a data depois da atualização

        postagens.save().then(() =>{
            req.flash("success_msg","Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg","ERRO INTERNO")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "HOuve um erro ao salvar a edição!")
        res.redirect("/admin/postagens")
    })
})

// rota para deletar a postagem criada
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.findByIdAndRemove({_id: req.params.id}).lean().then(() => { // o uso o req.body é devido nos estarmos utilizando a informaçao do formulario para deletar categoria no categorias.handle, com o campo hidden com o valor do _id
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Houve um erro interno.")
        res.redirect("/admin/postagens")
    })
})




module.exports = router
// sempre deve exportar o router no final dos arquivos de rotas//