const {ApolloServer}= require('apollo-server');// llamada a apolo
const  typeDefs = require('./db/schema') // LLAMADA A SCHEMA CON SU QUERY
const resolvers = require('./db/resolver')//llamada a los resolver ( COMPONENTE SCHEMA DE GRAPHQL)
const conectarDB = require('./config/db');//conectando a la base de datos
const jwt = require('jsonwebtoken')
require('dotenv').config({path:'variables.env'})


conectarDB()


const server = new ApolloServer({//CREO MI SERVER Y LE PASO SU QUERY Y RESOLVER
    typeDefs,
    resolvers,
    context: ( {req} ) =>{
        console.log(req.headers);
         const autheader = req.headers['authorization']
         if(autheader){
             try {
                 const usuario= jwt.verify(autheader.replace(`Bearer `,''),process.env.SECRETO)
                 console.log(usuario)
                return {usuario}
             } catch (error) {
                 console.log(error)
             }
         }
    }
});
server.listen({port : process.env.PORT || 4000}).then(({url})=>{
    console.log(`servidor funcionando ${url}`)
})
