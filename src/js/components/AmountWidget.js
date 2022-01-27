import { settings, select } from '../settings.js';
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
export default AmountWidget;
