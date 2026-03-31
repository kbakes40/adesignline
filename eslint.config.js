const {
    defineConfig,
} = require("eslint/config");

const unicorn = require("eslint-plugin-unicorn");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    extends: compat.extends("next", "prettier"),

    plugins: {
        unicorn,
    },

    rules: {
        "no-unused-vars": ["error", {
            args: "after-used",
            argsIgnorePattern: "^_",
            caughtErrors: "none",
            ignoreRestSiblings: true,
            vars: "all",
            varsIgnorePattern: "^_",
        }],

        "prefer-const": "error",
        "react-hooks/exhaustive-deps": "error",

        "unicorn/filename-case": ["error", {
            case: "kebabCase",
        }],
    },
}]);
