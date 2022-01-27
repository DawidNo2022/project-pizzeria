import { select, settings, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import CartProduct from './CartProduct.js';
class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);
  }
  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0; // calosciowa ilosc sztuk
    thisCart.subtotalPrice = 0; //zsumowana cena bez dostawy

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      console.log('total number', thisCart.totalNumber);
      thisCart.subtotalPrice += +product.price;
    }
    if (thisCart.totalNumber === 0) {
      thisCart.totalPrice = 0;
      thisCart.subtotalPrice = 0;

      console.log('total pusty kosz', thisCart.totalPrice);
      for (let price of thisCart.dom.totalPrice) {
        price.innerHTML = thisCart.totalPrice;
      }
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
    } else {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;

      console.log('totalPrice', thisCart.dom.totalPrice);
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      console.log('Subtotalprice', thisCart.subtotalPrice);
      for (let price of thisCart.dom.totalPrice) {
        console.log('Price', price);
        price.innerHTML = thisCart.totalPrice;
      }

      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    }
  }
  remove(product) {
    const thisCart = this;
    product.dom.wrapper.remove();
    console.log('product rem', product);
    const indexOfProduct = thisCart.products.indexOf(product);
    console.log('indeks =', indexOfProduct);
    const removedProduct = thisCart.products.splice(indexOfProduct, 1);
    console.log('removedValues', removedProduct);
    thisCart.update();
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json;
      })
      .then(function (parsedResponse) {
        console.log('parsed Response', parsedResponse);
      });
    console.log('payload', payload);
    return payload;
  }
  add(menuProduct) {
    const thisCart = this;
    // console.log('adding product', menuProduct);
    // const thisProduct = this;
    /*generate HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);
    /*create element using utils.createElementFromHTML*/
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    /*find menu container*/
    //const cardContainer = document.querySelector(select.containerOf.cart);
    /*add element to menu*/
    //cardContainer.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart.products', thisCart.products);
    //new CartProduct(menuProduct, generatedDOM);
    thisCart.update();
  }
}
export default Cart;
