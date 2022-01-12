/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //console.log('new Product:', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /*create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      //metoda do pobierania elementow w kontenerze
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }
    initAccordion() {
      const thisProduct = this;
      //find the clickable trigger(element that should react to clicking)
      // const clickableTrigger = thisProduct.element.querySelector(
      //   select.menuProduct.clickable
      // );
      //Start: add event listener to clickable trigger on event click
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        //prevent default action for event
        event.preventDefault();
        //find active product(product that has active class)
        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );
        //if there is active product and it is not thisProduct.element ,remove active class from it
        if (activeProduct != null && activeProduct != thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        //toggle active class on thisProduct.element
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
      });
    }
    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
      console.log('prepareProduct', thisProduct.prepareCartProduct());
    }
    initOrderForm() {
      //funkcje callback -wyjasnic
      const thisProduct = this;
      //console.log('metoda initOrderForm');
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }
    processOrder() {
      const thisProduct = this;
      //console.log('metoda procesOrder');
      const formData = utils.serializeFormToObject(thisProduct.form); // dostep do form przzez JS objekt
      //console.log('formData', formData);
      // set price to default price
      let price = thisProduct.data.price; //zmienna do przechowywania ceny

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log(paramId, param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
          const optionImage = thisProduct.imageWrapper.querySelector(
            `.${paramId}-${optionId}`
          );
          // console.log('optionImage', optionImage);
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);
          if (optionImage) {
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.wrapperActive);
            } else {
              optionImage.classList.remove(
                classNames.menuProduct.wrapperActive
              );
            }
          }
          if (optionSelected) {
            // check if the option is not default
            if (!option.default) {
              //zapytac o wyjasnienie czy tak jest ok 10.01.22
              price += option.price;
              // add option price to price variable
            }
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price -= option.price;
            }
          }
        }
      }

      // update calculated price in the HTML
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    prepareCartProductParams() {
      const thisProduct = this;
      //console.log('metoda CartProdParams');
      const formData = utils.serializeFormToObject(thisProduct.form); // dostep do form przzez JS objekt
      // console.log('formData', formData);
      const params = {};
      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        //console.log(paramId, param);
        params[paramId] = {
          label: param.label,
          options: {},
        };

        // for every option in  category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            // check if the option is not default
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      //thisWidget.value = settings.amountWidget.defaultValue;
      //console.log('Amount Widget', thisWidget);
      //console.log('Argument constructora', element);
      thisWidget.getElements(element);
      console.log('element', thisWidget);
      thisWidget.setValue(
        thisWidget.input.value || settings.amountWidget.defaultValue
      );

      thisWidget.initAction();
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    setValue(value) {
      const thisWidget = this;
      const min = settings.amountWidget.defaultMin;
      const max = settings.amountWidget.defaultMax;
      const newValue = parseInt(value); //konwersja do int
      //console.log('newValue', newValue);
      //ADD validation
      if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= min &&
        newValue <= max
      ) {
        //isNan(nyValue)!==true ???
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }
    initAction() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
  //koszyk
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
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(
        select.cart.phone
      );
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
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidgetCart();
      thisCartProduct.initActions();
      //console.log('CartProduct', thisCartProduct);
    }
    getElements(element) {
      const thisCartProduct = this;
      //thisCartProduct.element = element;
      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget =
        thisCartProduct.dom.wrapper.querySelector(
          select.cartProduct.amountWidget
        );

      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.price
      );
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.edit
      );
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.remove
      );
      thisCartProduct.dom.totalNumber =
        thisCartProduct.dom.wrapper.querySelector(select.cart.totalNumber);
    }
    initAmountWidgetCart() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(
        thisCartProduct.dom.amountWidget
      );

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        //thisProduct.processOrder();
        thisCartProduct.price =
          thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
        //console.log('Cena nowa', thisCartProduct.price);
        thisCartProduct.amount = thisCartProduct.amountWidget.value;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        console.log('amount widget ma', thisCartProduct.amountWidget.value);
        //thisCartProduct.dom.totalNumber.innerHTML = thisCartProduct.totalNumber;
      });
    }
    remove() {
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('Started remove');
    }

    getData() {
      const thisCartProduct = this;
      const product = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
      console.log('Product -getData', product);
      return product;
    }
    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }
  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(
          thisApp.data.products[productData].id,
          thisApp.data.products[productData]
        ); // wytlumaczyc
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
      fetch(url)
        .then(function (rowResponse) {
          return rowResponse.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(this.data));
    },
    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();

      thisApp.initCart();
    },
  };

  app.init();
}
