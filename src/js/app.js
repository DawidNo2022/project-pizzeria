import { settings, select, classNames } from './settings.js'; //ten sam katalog
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import HomePage from './components/HomePage.js';
const app = {
  initBooking: function () {
    const thisBooking = this;
    thisBooking.bookContainer = document.querySelector(
      select.containerOf.booking
    );
    const book = new Booking(thisBooking.bookContainer);
    return book;
  },
  initHomePage: function () {
    const thisApp = this;
    thisApp.homeContainer = document.querySelector(select.containerOf.home);
    thisApp.homePage = new HomePage(thisApp.homeContainer);
  },
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.homeLinks = document.querySelectorAll(select.home.links);
    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break; //brak kolejnych iteracji petli
      }
    }
    thisApp.activatePage(pageMatchingHash);
    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElemend = this;
        event.preventDefault();
        /*get page id from href attribute */
        const id = clickedElemend.getAttribute('href').replace('#', '');
        /*run thisApp.activatePage with that id id */
        thisApp.activatePage(id);
        /*change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },
  activatePage: function (pageId) {
    const thisApp = this;
    /*add class active to matching pages, remove from non-matching*/
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /*add class active to matching links, remove from non-matching*/
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
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
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-Cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initData();

    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initHomePage();
  },
};

app.init();
