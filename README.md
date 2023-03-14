## Spargo.js

<p align="center"><img src="/logo_with_text.png" alt="Spargo.js Logo"></p>

The lightweight JavaScript framework for inserting a little reactivity into some markup.

## Why Spargo?

Spargo has many meanings: awesome, sprinkle, practicality, etc. We believe all of these represent a piece of Spargo.js; which is designed to add just a little reactivity to your otherwise boring markup.

## Getting Started

#### NPM

`npm i spargojs`

Then just import it and create a new instance of the Spargo class.

#### CDN

Just add the CDN to the head tag. There is both a minified version (cdn.min.js) and non-minified (cdn.js).

```html
<head>
    <!-- Other Items in head tag -->
    <script src="https://unpkg.com/spargojs@0.0.34/dist/cdn.min.js" defer></script>
</head>
```

## Contributing

- clone this repo locally
- run `npm install` & `npm run start`
- Include the /dist/cdn.js file from a script tag on a webpage and you're good to go!

## Pre-Alpha

Right now Spargo.js is in heavy development and bugs are to be expected.

## Docs

Docs Site Coming Soon!

#### ignite

Use ignite to make a piece of your markup reactive.

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

Used to display a piece of state as a value

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

Used to conditionally show markup

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

Used to add a click event to an element

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

#### getters

Used to add a more complicated expression to other features

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

Used to conduct several actions off of setting a value

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
            // Defines the pieces of state that get updated via setters and
            // should be reactive in the dom accordingly.
            // Without this, then the @text's in the dom will not 
            // update every time the pieces of state update in the object.
            updatedBySetters: ['setterValue', 'setterCount'],
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
                console.log(this.message);
            },
        }
    }
</script>
```

___
#### *In Process*

#### @for

Similar to Vue's v-for, will be used to iterate over a piece of state and display markup in the process.

#### @mask

Used to automatically format a text input field as a user types.

#### @spark

Another lifecycle method. This method will be run at the very beginning of the initialization process.

## CSP

Spargo.js is built to be CSP compliant and it is expected that proper CSP headers are used (including nonce).

## Colors
#F0EAFE
#D5B2FA
#313E5E