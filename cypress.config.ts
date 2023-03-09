import { defineConfig } from "cypress";

export default defineConfig({
  screenshotOnRunFailure: false,
  video: false,

  e2e: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
  },
});
