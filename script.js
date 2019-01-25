// Code goes here

let state = {
  searchText:"",
  currentProductToAdd:null
}
let cart = [];
let addCartButton = null;
let txtEmail = null;
let txtPassword = null;
let btnSignUp = null;
let signup = null;
let home = null;
let mainDiv = null;
let products = null;

window.onload = function(){

  mainDiv = document.getElementById("main");
  signup = document.getElementById("signup");
  home = document.getElementById("home");

  
  addCartButton = document.getElementById("btnAddToCart");
  txtEmail = document.getElementById("email");
  txtPassword = document.getElementById("password");
  btnSignUp = document.getElementById("btnSignUp");
  btnSignUp.onclick = signUp;
  fetch("https://acastore.herokuapp.com/products")
  .then(response=> response.json()) 
  .then(serverProducts => {
    products = serverProducts
    listProducts(products);
  })

  if(sessionStorage.getItem("user")){
    home.style.display = "block";
    signup.style.display = "none";
    return;
  }

  
  
}

const cartUpdater = (userId,productList) => {
   let cartNum = null;
   const postmode = {
    method: 'post',
    headers: {
      "Content-type": "application/json"
    }, 
    body: JSON.stringify({"userId":userId,"products":[]}), 
  }
  if(!productList){
    fetch("https://acastore.herokuapp.com/carts",postmode)
    .then(response=> response.json()) 
    .then(carts => {
      cartNum=carts.id
      userInfo = JSON.parse(sessionStorage.getItem('user'))
      userInfo.cartId = cartNum;
      console.log(userInfo)
      const putmode = {
        method: 'put',
        headers: {
          "Content-type": "application/json"
        }, 
        body: JSON.stringify(userInfo),
      }

      fetch("https://acastore.herokuapp.com/users/"+userId,putmode)
      .then(response=> response.json()) 
      .then(user => {
      })
    })
  }

}

function signUp(){
  let email = txtEmail.value;
  let password = txtPassword.value;

  const postmode = {
    method: 'post',
    headers: {
      "Content-type": "application/json"
    }, 
    body: JSON.stringify({"email":email,"password":password}), 
  }
  home.style.display = "block";
  signup.style.display = "none";



  fetch("https://acastore.herokuapp.com/users")
  .then(response=> response.json()) 
  .then(users => {
    const foundUser = users.find(user => {
      return user.email === email && user.password === password
    })
    if(foundUser){
      sessionStorage.setItem('user', JSON.stringify(foundUser));
    }else{
      fetch("https://acastore.herokuapp.com/users",postmode)
      .then(response=> response.json()) 
      .then(user => {
        sessionStorage.setItem('user', JSON.stringify(user));
        cartUpdater(JSON.parse(sessionStorage.getItem('user')).id)
        // create empty cart entry by not sending a product list, only an id
      })
      .catch(function (err) {
      console.log(err)
      });
    }
  })
  .catch(function (err) {
    console.log(err)
  });
}
function searchTextChanged(e){
  state.searchText = e.value;
}
function search(){
  let filteredProducts = products.filter(p=> {
    return p.name && p.name.toLowerCase().indexOf(state.searchText.toLowerCase()) != -1
    });
  listProducts(filteredProducts);
}

function showProductDetail(id){
  addCartButton.style.display = "block";
  let product = products.find(p=>p.id === id);
  state.currentProductToAdd = product;
  mainDiv.innerHTML = product.description;
}
function listProducts(products){
  const removeNulls = products.reduce((acc,product)=> {
    if(product.name){
      acc.push(product)
      return acc
    }
    return acc
  },[])
  let prodDivs = removeNulls.map(p=>{
    return `<hr><div onclick="showProductDetail(${p.id})">${p.name}</div>`
    
  });
  mainDiv.innerHTML = prodDivs.join("");
}
function addToCart(prod){
  cart.push(prod);
  showHome();
}
function showHome(){
  addCartButton.style.display = "none";
  state.currentProductToAdd = null;
  listProducts(products);
}
function placeOrder(){
 
}
function showCart(){
  listProducts(cart);
  var e = document.createElement('div');
  e.innerHTML = "<button onClick='placeOrder()'>Place Order</button>";
  mainDiv.appendChild(e);
}