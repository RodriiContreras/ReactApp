
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
 type Cliente{
     id:ID
     nombre:String
     apellido:String
     empresa:String!
     email:String!
     telefono:String
     vendedor:ID
 }
 type Pedido{
     id:ID
     pedido:[PedidoGrupo]
     total:Float
     cliente:ID
     vendedor:ID
     fecha:String
     estado:EstadoDeMiPedido
 }
 type PedidoGrupo{  
     id:ID
     cantidad:Int
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
   input ClienteInput{
       nombre:String!
       apellido:String!
       empresa:String!
       email:String!
       telefono:String   
   }
   
   type Query {
       obtenerUsuario(token:String!):Usuario

       obtenerProductos:[Producto]

       obtenerProductoId(id:ID!): Producto

       obtenerClientes:[Cliente]
       obtenerCliente(id:ID!):Cliente
       obtenerClientesVendedor:[Cliente]


   }
   input ProductoInput{
    nombre:String!
    precio:Float!
    existencia:Int!
   }

   input PedidoProductoInput{
       id:ID
       cantidad:Int
   }

   input PedidoInput{
       pedido:[PedidoProductoInput]
       total:Float!
       cliente:ID!
       estado:EstadoDeMiPedido
   }

   enum EstadoDeMiPedido{
       Pendiente
       Completado
       Cancelado
   }



type Mutation{
    nuevoUsuario(input : UsuarioInput) : Usuario
    autenticacionUsuario(input : AutenticarInput): Token

    #productos
    nuevoProducto(input:ProductoInput) : Producto
    actualizarProducto(id:ID!,input:ProductoInput):Producto
    eliminarProducto(id:ID!):String

    #clientes
   
    nuevoCliente(input:ClienteInput): Cliente
    actualizarCliente(id:ID!,input:ClienteInput):Cliente
    eliminarClientes(id:ID!) : String



    #pedidos
    nuevoPedido(input:PedidoInput) : Pedido 
}
`;




module.exports=typeDefs;