const {ApolloServer}= require('apollo-server');// llamada a apolo
const resolvers = require('./db/resolver')//llamada a los resolver ( COMPONENTE SCHEMA DE GRAPHQL)
const  typeDefs = require('./db/schema') // LLAMADA A SCHEMA CON SU QUERY
const conectarDB = require('./config/db')//conectando a la base de datos


conectarDB()
const server = new ApolloServer({//CREO MI SERVER Y LE PASO SU QUERY Y RESOLVER
    typeDefs,
    resolvers,
});
server.listen().then(({url})=>{
    console.log(`servidor funcionando ${url}`)
})
