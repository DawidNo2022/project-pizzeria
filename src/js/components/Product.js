import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
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
    // app.cart.add(thisProduct.prepareCartProduct());
    console.log('prepareProduct', thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-Cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
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
            optionImage.classList.remove(classNames.menuProduct.wrapperActive);
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
export default Product;
