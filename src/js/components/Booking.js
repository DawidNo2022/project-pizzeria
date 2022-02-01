import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.date = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.time = element.querySelector(
      select.widgets.hourPicker.wrapper
    );
    console.log(thisBooking.dom.time.input);
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.amountPeopleWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );
    thisBooking.dateWidget = new DatePicker(thisBooking.dom.date);
    thisBooking.timeWidget = new HourPicker(thisBooking.dom.time);
    //thisBooking.amountPeopleWidget.addEventListener('click', function () {});
    //thisBooking.hoursAmountWidget.addEventListener('click', function () {});
  }
}
export default Booking;
