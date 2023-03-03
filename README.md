## Ignis.js

A lightweight Javascript framework for inserting a little reactivity into some markup. It is inspired by [Alpine.js](https://github.com/alpinejs/alpine) (the idea for Ignis, and initial coding, both existed before Alpine.js was first released, but after Alpine.js became public it inspired the development of Ignis).

## Why Ignis?

Ignis is Latin for flame - and is designed to add just a little fire to your otherwise boring markup landscape.

## Version

Right now, it is in pre-alpha. Most expected features are not finished. Once it is in alpha, it will be pushed up into NPM and made publically available.

## Docs

Coming soon!

A little sneak peak:

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>Ignis Test</title>
    <script type="module" src="app.js"></script>
</head>

<body>
    <div ignite="home">
        <input type="text" @sync="message" />
        This is it: {{ message }}
    </div>

    <div ignite="foo">
        <input type="text" @sync="fun" />
        {{ fun }}
    </div>
</body>

</html>
<script>
    function home() {
        return {
            message: 'hello world',
            ignited() {
                console.log(this.message);
            },
        }
    }

    function foo() {
        return {
            fun: 'bar',
            ignited() {
                console.log(this.fun);
            },
        }
    }
</script>
```