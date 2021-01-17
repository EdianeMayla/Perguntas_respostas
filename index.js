const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");
//database

connection // autenticação obrigatoria
  .authenticate()
  .then(() => {
    console.log("conexao feita com o banco de dados!");
  })
  .catch((msgErro) => {
    console.log(msgErro);
  });

//Dizendo para o express usar o EJS como view engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//Body parser - obrigatorio

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//rotas

//esta rota busca todos os dados do banco, o comando raw filtra apenas o que foi preenchido
//na tabela prlo programa, e o order, traz ordenado.

app.get("/", (req, res) => {
  Pergunta.findAll({
    raw: true,
    order: [
      ["id", "DESC"], //ASC = crescente e DESC = decrescente
    ],
  }).then((perguntas) => {
    res.render("index", {
      perguntas: perguntas,
    });
  });
});

app.get("/Perguntar", (req, res) => {
  res.render("perguntar");
});


app.post("/salvarpergunta", (req, res) => {
  var titulo = req.body.titulo;
  var descricao = req.body.descricao;

  Pergunta.create({
    titulo: titulo,
    descricao: descricao,
  }).then(() => {
    res.redirect("/");
  });
});

app.get("/pergunta/:id", (req, res) => {
  var id = req.params.id;
  Pergunta.findOne({
    //busca no banco uma informação igual a algo que vc determine.
    where: { id: id },
  }).then((pergunta) => {
    console.log(pergunta);
    if (pergunta != undefined) {//pergunta encontrada
        Resposta.findAll({
          where: {perguntaId: pergunta.id},
          order:[
            ['id', 'DESC']
          ]
        }).then(respostas => {
            res.render("pergunta", {
              pergunta: pergunta,
              respostas: respostas
            });
        });
    }else{//pergunta nao encontrada
      res.redirect("/");
    }
  });
});

app.post("/responder", (req, res) => {
  var corpo = req.body.corpo;
  var perguntaId = req.body.pergunta;
  Resposta.create({
    corpo: corpo,
    perguntaId: perguntaId
  }).then(() => {
     res.redirect("/pergunta/" + perguntaId);
  });

});

app.post("/pergunta/delete", (req, res) =>{
   var id = req.body.id;
     Pergunta.destroy({
       where: { 
         id:id
       }
     }).then(() =>{
      Resposta.destroy({
          where: {
          perguntaId:id
          }
      })
        res.redirect("/")
     });

});

app.post("/resposta/:id/:perguntaId", (req, res) => {
  var id = req.params.id;
  var perguntaId = req.params.perguntaId;

      Resposta.destroy({
        where: {
          id:id
        }
      }).then(() => {
        res.redirect("/pergunta/" + perguntaId);
      });
})

app.listen(4000, () => {
  //Obrigatorio para o servidor rodar
  console.log("O servidor está funcionando!"); //opcional
});
