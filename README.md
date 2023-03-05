## Spargo.js

<p align="center"><img src="/logo_with_text.png" alt="Spargo.js Logo"></p>

A lightweight JavaScript framework for inserting a little reactivity into some markup. It is inspired by [Alpine.js](https://github.com/alpinejs/alpine) (the idea for Spargo, and initial coding, both existed before Alpine.js was first released, but after Alpine.js became public it inspired the development of Spargo).

## Why Spargo?

Spargo has many meanings: awesome, sprinkle, practicality, etc. We believe all of these represent a piece of Spargo.js; which is designed to add just a little reactivity to your otherwise boring markup.

## Version

Right now, it is in pre-alpha. Most expected features are not finished.

## Docs

Coming soon!

A little sneak peak:

```html
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy"
        content="script-src 'nonce-jFdn249Fnwelk429Df932jS3U2' 'self' data:; default-src 'self';">
    <title>Spargo Test</title>
    <script type="module" src="app.js"></script>
</head>

<body>
    <div ignite="home">
        <input type="text" @sync="message" />
        <span @text="message"></span>
    </div>

    <div ignite="foo">
        <input type="text" @sync="fun" />
        <input type="text" @sync="again" />
        <span @text="fun"></span>
        <span @text="again"></span>
    </div>
</body>

</html>
<script nonce="jFdn249Fnwelk429Df932jS3U2">
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
            again: 'sweet',
            ignited() {
                console.log(this.fun);
            },
        }
    }
</script>
```

## Colors
#F0EAFE
#D5B2FA
#313E5E