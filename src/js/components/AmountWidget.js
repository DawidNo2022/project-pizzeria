import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue); //wyjasnic
    const thisWidget = this;
    //thisWidget.value = settings.amountWidget.defaultValue;
    console.log('Amount Widget', thisWidget);
    //console.log('Argument constructora', element);
    thisWidget.getElements(element);
    console.log('element', thisWidget);

    thisWidget.initAction();
    thisWidget.value = thisWidget.dom.input.value;
  }
  getElements() {
    const thisWidget = this;

    //thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrase = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  initAction() {
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function () {
      //thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrase.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}
export default AmountWidget;
