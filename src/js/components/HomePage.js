import { templates, classNames, select } from '../settings.js';
class HomePage {
  constructor(element) {
    const thisHomePage = this;
    thisHomePage.render(element);
    thisHomePage.initLinks();
  }
  render(element) {
    const thisHomePage = this;
    const generatedHTML = templates.homeWidget();
    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;
  }

  activatePage(id) {
    const thisHomePage = this;
    thisHomePage.pages = document.querySelector(
      select.containerOf.pages
    ).children;
    thisHomePage.navLinks = document.querySelectorAll(select.nav.links);

    for (let page of thisHomePage.pages) {
      page.classList.toggle(classNames.pages.active, page.id == id);
    }
    /*add class active to matching links, remove from non-matching*/
    for (let link of thisHomePage.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + id
      );
    }
  }
  initLinks() {
    const thisHomePage = this;
    /*add class active to matching pages, remove from non-matching*/
    thisHomePage.homeLinks = document.querySelectorAll(select.home.links);
    for (let link of thisHomePage.homeLinks) {
      link.addEventListener('click', function (event) {
        const clickedElemend = this;
        event.preventDefault();
        /*get page id from href attribute */
        const id = clickedElemend.getAttribute('href').replace('#', '');
        /*run thisApp.activatePage with that id */
        thisHomePage.activatePage(id);
        /*change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  }
}
export default HomePage;
