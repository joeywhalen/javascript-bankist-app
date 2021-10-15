'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const accountOne = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const accountTwo = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [accountOne, accountTwo];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (dateOne, dateTwo) =>
    Math.round(Math.abs(dateTwo - dateOne) / 1000 * 60 * 60 * 24);
  
  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);
  
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`; 
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
      } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;
    
    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    
    // Decrease 1 second
    time--;
  };
  
  // Set time to 5 minutes
  let time = 300;
  
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +(inputLoginPin.value)) { // + replaces Number
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      //weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale, options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    
    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
      
      // Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
///////////////////////////////////////
// Converting and Checking Numbers
/*
console.log(23 === 23.0); //  true

// Base 10: 0 to 9; 1/10 = 0.1; 3/10 = 3.3333333
// Binary: base 2: 0 1
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false (in JavaScript)

// Conversion
console.log(Number('23')); // 23
console.log(+'23'); // 23 (+ generates type coercion)

// Parsing
console.log(Number.parseInt('30px', 10)); // 10: base 10; 30 (number, not a string)
console.log(Number.parseInt('e23', 10)); // NaN

console.log(Number.parseInt('  2.5rem  ')); // 2
console.log(Number.parseFloat('  2.5rem  ')); // 2.5; Number.parseFloat is preferred method

console.log(parseFloat('  2.5rem  ')); // 2.5

// Check if value is NaN
console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // false (infinity)

// Checking if value is number
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false (string, not the number 20)
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite(23 / 0)); // false (infinity)

console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(23 / 0)); // false
*/

///////////////////////////////////////
// Math and Rounding
/*
console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // 5
console.log(8 ** (1 / 3)); // 2

console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23
console.log(Math.max(5, 18, '23px', 11, 2)); // NaN

console.log(Math.min(5, 18, 23, 11, 2)); // 2

console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.1592653589793

console.log(Math.trunc(Math.random() * 6) + 1); // Generates random number between 1 and 6

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// Math.random: 0...1 -> 0...(max - min) -> min...max
console.log(randomInt(10, 20)); 

// Rounding integers
console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); // 24

console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9)); // 24

console.log(Math.floor(23.3)); // 23; floor and trunc remove decimal numbers when dealing with positive numbers
console.log(Math.floor(23.9)); // 23

console.log(Math.trunc(23.3)); // 23

console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // -24
console.log(Math.ceil(-23.3)); // -23

// Rounding decimals
console.log((2.7).toFixed(0)); // 3
console.log((2.7).toFixed(3)); // 2.700
console.log((2.345).toFixed(2)); // 2.35
console.log(+(2.345).toFixed(2)); // 2.35; + converts string to number
*/

///////////////////////////////////////
// The Remainder Operator
/*
console.log(5 % 2); // 1
console.log(5 / 2); // 2.5; 5 = 2 * 2 + 1

console.log(8 % 3); // 2
console.log(8 / 3); // 2.666; 8 = 2 * 3 + 2

console.log(6 % 2); // 0
console.log(6 / 2); // 3

console.log(7 % 2); // 1
console.log(7 / 2); // 3.5

const isEven = n => n % 2 === 0; // Function to determine if a number is even
console.log(isEven(8)); // true
console.log(isEven(23)); // false
console.log(isEven(514)); // true

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0, 2, 4, 6
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    // 0, 3, 6, 9
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/

///////////////////////////////////////
// Working with BigInt: allows for storing large numbers
/*
console.log(2 ** 53 - 1); // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(2 ** 53 + 1); // 9007199254740992; unsafe number
console.log(2 ** 53 + 2); // 9007199254740994; unsafe number
console.log(2 ** 53 + 3); // 9007199254740996; unsafe number
console.log(2 ** 53 + 4); // 9007199254740996; unsafe number

console.log(4838430248342043823408394839483204n);
console.log(BigInt(48384302)); // 48384302n

// Operations
console.log(10000n + 10000n); // 20000n
console.log(36286372637263726376237263726372632n * 10000000n); // 362863726372637263762372637263726320000000n
// console.log(Math.sqrt(16n)); // Uncaught TypeError: Cannot convert a BigInt value to a number

const huge = 20289830237283728378237n;
const num = 23;
console.log(huge * BigInt(num)); // 466666095457525752699451n

// Exceptions
console.log(20n > 15); // true
console.log(20n === 20); // false; === does not do type coercion
console.log(typeof 20n); // bigInt
console.log(20n == '20'); // true; == does do type coercion

console.log(huge + ' is REALLY BIG!!!'); // 20289830237283728378237 is REALLY BIG!!!

// Divisions
console.log(11n / 3n); // 3n
console.log(10 / 3); // 3.3333333333333335
*/

///////////////////////////////////////
// Creating Dates
// Create a date
/*
const now = new Date();
console.log(now); // Wed Oct 13 2021 13:24:31 GMT-0400 (Eastern Daylight Time)

console.log(new Date('Aug 02 2020 18:05:41')); // Sun Aug 02 2020 18:05:41 GMT-0400 (Eastern Daylight Time)
console.log(new Date('December 24, 2015')); // Thu Dec 24 2015 00:00:00 GMT-0500 (Eastern Standard Time)
console.log(new Date(account1.movementsDates[0])); // Mon Nov 18 2019 16:31:17 GMT-0500 (Eastern Standard Time)

console.log(new Date(2037, 10, 19, 15, 23, 5)); // Thu Nov (Jan is 0) 19 2037 15:23:05 GMT-0500 (Eastern Standard Time)
console.log(new Date(2037, 10, 31)); // Tue Dec 01 2037 00:00:00 GMT-0500 (Eastern Standard Time)

console.log(new Date(0)); // Wed Dec 31 1969 19:00:00 GMT-0500 (Eastern Standard Time)
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // (3 days * 24 hours * 60 minutes * 60 seconds * 1000 miliseconds) Sat Jan 03 1970 19:00:00 GMT-0500 (Eastern Standard Time)

// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future); // Thu Nov 19 2037 15:23:00 GMT-0500 (Eastern Standard Time)
console.log(future.getFullYear());// 2037
console.log(future.getMonth()); // 10
console.log(future.getDate()); // 19
console.log(future.getDay()); // 4 (4th day of the week; 0 is Sunday)
console.log(future.getHours()); // 15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 0
console.log(future.toISOString()); // 2037-11-19T20:23:00.000Z
console.log(future.getTime()); // 2142274980000 (miliseconds passed since Jan 1, 1970)

console.log(new Date(2142256980000)); // Thu Nov 19 2037 10:23:00 GMT-0500 (Eastern Standard Time)

console.log(Date.now()); // 1634223665335

future.setFullYear(2040);
console.log(future); // Mon Nov 19 2040 15:23:00 GMT-0500 (Eastern Standard Time)
*/

///////////////////////////////////////
// Operations With Dates
/*
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future); // 2142274980000

const calcDaysPassed = (dateOne, dateTwo) =>
  Math.abs(dateTwo - dateOne) / (1000 * 60 * 60 * 24); // Convert miliseconds into days

const daysOne = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(daysOne); // 10
*/

///////////////////////////////////////
// Internationalizing Numbers (Intl)
/*
const num = 3884764.23;

const options = {
  style: 'currency', // unit, percent
  unit: 'celsius', // mph
  currency: 'EUR',
  // useGrouping: false,
};

console.log('US:      ', new Intl.NumberFormat('en-US', options).format(num)); // US:       €3884764.23 useGrouping: false
console.log('US:      ', new Intl.NumberFormat('en-US', options).format(num)); // US:       €3,884,764.23
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num)); // Germany:  3.884.764,23 €
console.log('Syria:   ', new Intl.NumberFormat('ar-SY', options).format(num)); // Syria:    ٣٬٨٨٤٬٧٦٤٫٢٣ €
console.log(navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)); // en-US €3,884,764.23
*/

///////////////////////////////////////
// Timers
/*
// setTimeout
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ingOne, ingTwo) => console.log(`Here is your pizza with ${ingOne} and ${ingTwo} 🍕`),
  3000, // 3 seconds = 3 * 1000 miliseconds
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
*/