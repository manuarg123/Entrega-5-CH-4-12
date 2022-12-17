const express = require('express')
const { engine } = require('express-handlebars')
const Productos = require('./data/productos')
const PORT = 8080
const productsDB = new Productos()

const app = express()
app.use(express.urlencoded({ extended: true }))
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get('/', viewProductList)
app.get('/agregarProducto', viewCreateProduct)
app.post('/product', validateProduct, postProduct)
app.listen(PORT, () => console.log(` Servidor abierto en el puerto: ${PORT}`))

function viewProductList(req, res) {
  const products = productsDB.getAllProducts()
  res.render('list', { products })
}

function viewCreateProduct(req, res) {
  const { error, title, price, thumbnail } = req.query
  return res.render('form', { error, title, price, thumbnail })
}

function postProduct(req, res) {
  const { error } = req
  if (error && error.length > 0) {
    return res.redirect(
      `/agregarProducto/?error=${error}&title=${req.title}&price=${req.price}&thumbnail=${req.thumbnail}`
    )
  }
  const { title, price, thumbnail } = req.body
  productsDB.postProduct({ title, price, thumbnail })
  return res.redirect('/')
}

function validateProduct(req, res, next) {
  const { title, price, thumbnail } = req.body
  if (!title || !price || !thumbnail || !title.trim() || !thumbnail.trim()) {
    req.error = 'Tiene que cargar datos que faltan'
  } else if (isNaN(price)) {
    req.error = 'Debe ingresar números'
  } else if (!thumbnail.includes('http')) {
    req.error = 'Url incorrecta'
  }
  req.title = title
  req.price = price
  req.thumbnail = thumbnail
  next()
}