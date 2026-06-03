const js = require("@eslint/js");
const globals = require("globals");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  {
    // Sadece projenin içindeki kaynak kodları tarayacak
    files: ["**/*.js"], 
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: "latest",
      // Projenin Node.js ortamında çalıştığını kesin olarak belirtiyoruz
      globals: {
        ...globals.node
      },
      sourceType: "commonjs" // Projenin 'require' kullandığını belirtir
    },
    rules: {
      "no-unused-vars": "off", // Kullanılmayan değişkenler için hataları 
    }
  }
]);