import { templates } from '../settings.js';
class HomePage {
  constructor(element) {
    const thisHomePage = this;
    thisHomePage.render(element);
  }
  render(element) {
    const thisHomePage = this;
    const generatedHTML = templates.homeWidget();
    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;
  }
}
export default HomePage;
