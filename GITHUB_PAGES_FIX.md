# GitHub Pages Build Fix

## Issue
GitHub Pages build and deployment was failing with error #161 due to Jekyll attempting to process files in `node_modules` directories that contained Liquid template syntax conflicts.

## Root Cause
The specific error was:
```
Liquid Exception: Liquid syntax error (line 103): Variable '{{ bar: 1 }' was not properly terminated with regexp: /\}\}/ in handymanapp/node_modules/@typescript-eslint/eslint-plugin/docs/rules/consistent-type-assertions.mdx
```

Jekyll was trying to process TypeScript ESLint documentation files in `node_modules` that contained code examples with `{{ bar: 1 }` syntax, which Jekyll interpreted as incomplete Liquid template variables.

## Solution
Created `_config.yml` with proper `exclude` configuration to prevent Jekyll from processing:
- All `node_modules/` directories
- Build artifacts and cache directories
- Development files that shouldn't be part of the static site
- Documentation files that are not meant for the website

## Files Modified
- `_config.yml` (created) - Jekyll configuration with proper excludes

## Verification
The fix ensures that Jekyll only processes files intended for the static website while ignoring development dependencies and build artifacts that can cause template syntax conflicts.