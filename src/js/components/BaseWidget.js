class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }
  get value() {
    //odczytywanie wartosci
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value) {
    //setter , metoda do ustawiania nowej wartosci value
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); //konwersja do int
    //console.log('newValue', newValue);
    //ADD validation
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      //isNan(nyValue)!==true ???
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }
  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    return !isNaN(value);
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
  setValue(value) {
    const thisWidget = this;
    thisWidget.value = value;
  }
}
export default BaseWidget;
