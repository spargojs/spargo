## Spargo.js

<p align="center"><img src="/logo_with_text.png" alt="Spargo.js Logo"></p>

The lightweight JavaScript framework for inserting a little reactivity into some markup. It is inspired by [Alpine.js](https://github.com/alpinejs/alpine). It should be mentioned that the idea for Spargo, and initial coding, both existed before Alpine.js was first released. However, after Alpine.js became public it inspired the development of Spargo.

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
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy"
        content="script-src 'nonce-jFdn249Fnwelk429Df932jS3U2' 'self' data:; default-src 'self'; style-src https://cdn.tailwindcss.com 'unsafe-inline'">
    <title>Spargo Test</title>
    <script src="https://unpkg.com/spargojs@0.0.22/dist/cdn.min.js" nonce="jFdn249Fnwelk429Df932jS3U2" defer></script>
    <script src="https://cdn.tailwindcss.com" nonce="jFdn249Fnwelk429Df932jS3U2"></script>
</head>

<body class="bg-gray-100 font-sans antialiased">
    <div class="flex justify-center mt-8" ignite="home">
        <div class="mr-3">
            <div class="relative mb-3 xl:w-96">
                <div class="relative">
                    <label for="message" class="text-gray-700">
                        Message
                    </label>
                    <input type="text" id="message"
                        class="rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                        name="message" placeholder="Message" @0.0.22/>
                </div>
            </div>
            <div>
                <span class="text-xl ml-1" @0.0.22/span>
            </div>
        </div>
        <div>
            <div class="relative mb-3 xl:w-96">
                <label for="latin" class="text-gray-700">
                    Latin
                </label>
                <input type="text" id="latin"
                    class="rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-transparent"
                    name="latin" placeholder="Latin" @0.0.22/>
            </div>
            <div>
                <span class="text-xl ml-1" @0.0.22/span>
            </div>
        </div>
    </div>
</body>

</html>
<script nonce="jFdn249Fnwelk429Df932jS3U2">
    function home() {
        return {
            message: 'hello world',
            latin: 'dum spiro spero',
            ignited() {
                console.log(this.message);
            },
        }
    }
</script>
```

## Colors
#F0EAFE
#D5B2FA
#313E5E