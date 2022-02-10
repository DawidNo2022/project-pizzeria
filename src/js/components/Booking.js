import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.selectedTable = -1;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  getData() {
    const thisBooking = this;
    console.log(thisBooking.datePicker);
    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepeat.join('&'),
    };
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        //console.log('bookings', bookings);
        // console.log('currentEvents', eventsCurrent);
        // console.log('repeat Events', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;

    const maxDate = thisBooking.datePicker.maxDate;
    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    let allAvailable = false;
    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }
    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(
          tableId
        ) > -1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
    thisBooking.dom.time = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesDiv = document.querySelector(
      select.booking.tablesDiv
    );
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.adress = document.querySelector(select.booking.address);
    thisBooking.dom.sendBookingBtn = document.querySelector(
      select.booking.btnBooking
    );
    thisBooking.dom.starters = document.querySelectorAll(
      select.booking.starters
    );
  }
  initTables(event) {
    const thisBooking = this;
    const clickedElement = event.target;
    if (
      clickedElement.classList.contains(classNames.booking.table) &&
      !clickedElement.classList.contains(classNames.booking.tableBooked)
    ) {
      const tableId = clickedElement.getAttribute('data-table');
      thisBooking.selectedTable = tableId;
      console.log('You choosed table nr=', thisBooking.selectedTable);

      clickedElement.classList.toggle('selected');
      for (let table of thisBooking.dom.tables) {
        if (table !== clickedElement) {
          table.classList.remove(classNames.booking.tableSelected);
        }
      }
    }
    if (clickedElement.classList.contains(classNames.booking.tableBooked)) {
      alert('This table is reserved');
    }
  }
  initWidgets() {
    const thisBooking = this;
    thisBooking.amountPeopleWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );
    thisBooking.datePicker = new DatePicker(thisBooking.dom.date);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.time);
    //thisBooking.amountPeopleWidget.addEventListener('click', function () {});
    //thisBooking.hoursAmountWidget.addEventListener('click', function () {});
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      thisBooking.removeTableSelection();
    });
    thisBooking.dom.tablesDiv.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });
    thisBooking.dom.sendBookingBtn.addEventListener('click', function () {
      //event.preventDefault();
      thisBooking.sendBooking();
      thisBooking.removeTableSelection();
      alert('Your booking is send!');
    });
  }
  removeTableSelection() {
    const thisBooking = this;
    for (let table of thisBooking.dom.tables) {
      if (table.classList.contains('selected')) {
        table.classList.remove('selected');
      }
    }
  }
  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.selectedTable),
      duration: parseInt(thisBooking.hoursAmountWidget.value),
      ppl: parseInt(thisBooking.amountPeopleWidget.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      adress: thisBooking.dom.adress.value,
    };
    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options).then(
      thisBooking.makeBooked(
        payload.date,
        payload.hour,
        payload.duration,
        payload.table
      ),
      thisBooking.updateDOM()
    );
    console.log('payload', payload);
  }
}
export default Booking;
