
const {gql}= require('apollo-server');

const typeDefs= gql`

 type Usuario{
     id : ID
     nombre: String
     apellido: String
     email: String
     creado : String
 }
 type Token{
     token:String
 }

 type Producto{
  id:ID
  nombre:String
  existencia:Int
  precio:Float
  creado:String
 }

   input UsuarioInput{
       nombre:String!
       apellido:String!
       email:String!
       password:String!
   }

   input AutenticarInput{
       email:String!
       password:String!
   }
   
   type Query {
       obtenerUsuario(token:String!):Usuario

       obtenerProductos:[Producto]

       obtenerProductoId(id:ID!): Producto

   }
   input ProductoInput{
    nombre:String!
    precio:Float!
    existencia:Int!
   }



type Mutation{
    nuevoUsuario(input : UsuarioInput) : Usuario
    autenticacionUsuario(input : AutenticarInput): Token

    #productos
    nuevoProducto(input:ProductoInput) : Producto
    actualizarProducto(id:ID!,input:ProductoInput):Producto
    eliminarProducto(id:ID!):String
}
`;




module.exports=typeDefs;