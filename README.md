## Spargo.js

<p align="center"><img src="/logo_with_text.png" alt="Spargo.js Logo"></p>

The lightweight JavaScript framework for inserting a little reactivity into some markup.

https://spargojs.dev

## Why Spargo?

Spargo has many meanings: awesome, sprinkle, practicality, etc. We believe all of these represent a piece of Spargo.js; which is designed to add just a little reactivity to your otherwise boring markup.

## Getting Started

#### NPM

```console
npm i spargo
```

Then just import it and create a new instance of the Spargo class.

#### CDN

Just add the CDN to the head tag. There is both a minified version (cdn.min.js) and non-minified (cdn.js).

```html
<head>
    <!-- Other Items in head tag -->
    <script src="https://unpkg.com/spargo@1.5.0/dist/cdn.min.js" defer></script>
</head>
```

## Contributing

- clone this repo locally
- run `npm install` & `npm run start`
- Include the /dist/cdn.js file from a script tag on a webpage and you're good to go!

## Docs

Docs are available at https://spargojs.dev.

#### ignite

Used to make a piece of your markup reactive.

```html
<div ignite="home">
    <!-- Reactive Content -->
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            // Pieces of data, methods, getters, setters, etc.
        }
    }
</script>
```

#### @sync

Similar to Vue's v-model, it will keep a piece of state in sync.

```html
<div ignite="home">
    <input type="text" id="message" name="message" placeholder="Message" @sync="message" />
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            message: 'hello world',
        }
    }
</script>
```

#### @text

Used to display a piece of state as a value.

```html
<div ignite="home">
   <span @text="message"><!-- Will have value hello world --></span>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            message: 'hello world',
        }
    }
</script>
```

#### @if / @elseif / @else

Used to conditionally show markup.

```html
<div ignite="home">
    <div @if="show">Showing the if</div>
    <div @elseif="orShow">Showing the else if</div>
    <div @else>Finally, show the else</div>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            show: true,
            orShow: false,
        }
    }
</script>
```

#### @click

Used to add a click event to an element.

```html
<div ignite="home">
     <button type="button" @click="show">Show</button>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            display: false,
            show() {
                this.display = true;
            },
        }
    }
</script>
```

#### @class

Used to conditionally add classes to an element. The syntax is: condition => classes if true || classes if false.

```html
<div ignite="home">
     <button type="button" @class="marginTop => mt-4 || mt-0">Show</button>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            marginTop: true,
        }
    }
</script>
```

#### @href

Used to programmatically set an elements href attribute.

```html
<div ignite="home">
    <a @href="href">Go Home</a>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            href: '/home',
        }
    }
</script>
```

#### @for

Similar to Vue's v-for, it is used to iterate over a piece of state and display markup in the process.


```html
<div ignite="home">
    <div>
        <button type="button" @click="addPortugal">Add Portugal</button>
        <!-- Doing a named value tells Spargo it is a flat array -->
        <div @for="country in countries">
            <p @text="country"></p>
        </div>
        <!-- Doing an unnamed value (with an underscore) tells Spargo it is an array of objects -->
        <div @for="_ in users">
            <!-- Since Spargo is aware it is supposed to expect an array of objects, there is -->
            <!-- no need to include the value followed by a dot and a key (dot-notation). The @for -->
            <!-- could have been "user in users", and the @text user.name - going with convention. -->
            <!-- However, Spargo decided to keep things simple, and go a shorthand route. -->
            <p @text="name"></p>
            <p @text="email"></p>
        </div>
    </div>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            users: [
                {
                    name: 'Jon Doe',
                    email: 'jdoe@example.org'
                },
                {
                    name: 'Jane Cool',
                    email: 'jcool@example.org'
                },
                {
                    name: 'Jack Foo',
                    email: 'jfoo@example.org'
                },
                {
                    name: 'Jim Bar',
                    email: 'jbar@example.org'
                }
            ],
            countries: [
                'America',
                'Canada',
                'Mexico',
                'England'
            ],
            addPortugal() {
                // Spargo.js will not react to array or object changes. 
                // A simple workaround is to overwrite.
                this.countries = [...this.countries, 'Portugal'];
            },
        }
    }
</script>
```

#### @mask

Used to automatically format a text input field as a user types. Right now, there are only certain options:

1. phone (US Format)
2. currency (Any Format)
3. date (US Format, mm/dd/yyyy)

```html
<div ignite="home">
    <!-- As the user types, the value will be masked and updated 
         to a properly formatted US phone number -->
    <input 
        type="tel" 
        id="mask-phone" 
        name="mask-phone" 
        placeholder="Phone" 
        @sync="maskPhone" 
        @mask="phone" 
    />
    <!-- As the user types, the value will be masked and updated 
         to a properly formatted US currency value -->
    <input 
        type="text" 
        id="mask-currency-usd" 
        name="mask-currency-usd" 
        placeholder="USD" 
        @sync="maskCurrencyUsd" 
        @mask="currency" 
    />
    <!-- You may pass arguments to the currency mask via @mask-args.
         It is a pipe (|) delimited string of {local}|{currency} -->
    <input
        type="text"
        id="mask-currency-gbp"
        name="mask-currency-gbp"
        placeholder="GBP"
        @sync="maskCurrencyGbp"
        @mask="currency"
        @mask-args="en-GB|GBP"
    />
    <!-- As the user types, the value will be masked and updated 
         to a properly formatted US date (mm/dd/yyyy) -->
    <input
        type="text"
        id="mask-date"
        name="mask-date"
        placeholder="Date"
        @sync="date"
        @mask="date"
    />
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            maskPhone: '',
            maskCurrencyUsd: '',
            maskCurrencyGbp: '',
            date: '',
        }
    }
</script>
```

#### getters

Used to add a more complicated expression to other features.

```html
<div ignite="home">
    <div @if="show">Showing the if</div>
    <div @elseif="shouldShowElseIf">Showing the else if</div>
    <div @else>Finally, show the else</div>
    <button type="button" @click="showElse" @if="shouldShowElse">Show Else</button>
    <label for="latin">Latin</label>
    <input type="text" id="latin" name="latin" placeholder="Latin" @sync="latin" />
    <div>
        <span @text="getter"></span>
    </div>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            show: true,
            orShow: false
            latin: 'dum spiro spero',
            get getter() {
                return `Will add on to latin: ${this.latin}`
            },
            get shouldShowElseIf() {
                return this.orShow;
            },
            get shouldShowElse() {
                return this.show || this.orShow;
            },
            showElse() {
                this.show = false;
                this.orShow = false;
            },
        }
    }
</script>
```

#### setters

Used to conduct several actions off of setting a value.

```html
<div ignite="home">
     <div>
        <label for="setter">
            Setter
        </label>
        <input type="text" id="setter" name="setter" placeholder="Setter" @sync="updateSetterValue" />
    </div>
    <div>
        <span @text="setterValue"></span>
        <span @text="setterCount"></span>
    </div>
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            setterCount: 0,
            setterValue: null,
            set updateSetterValue(value) {
                this.setterCount++;
                this.setterValue = value;
            },
        }
    }
</script>
```

#### ignited

One of the lifecycle methods. This method will be run once the initialization process is done.

```html
<div ignite="home">
    <!-- Reactive Content -->
</div>
<script nonce="someRandomNonce">
    function home() {
        return {
            message: 'hello world',
            ignited() {
                // This is a good spot to do an API request for data!
                console.log(this.message);
            },
        }
    }
</script>
```

___

## CSP

Spargo.js is built to be CSP compliant and it is expected that proper CSP headers are used (including nonce).

## Colors
#F0EAFE
#D5B2FA
#313E5E