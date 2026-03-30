# Nimbleways Next.js Boilerplate

## IDE extensions

### VSCode

it s highly required to install the recommended extensions by runing in vscode prompt command
`> Show recommended extensions`

### Jetbrians IDE

install manually this [Conventional commit plugin](https://plugins.jetbrains.com/plugin/13389-conventional-commit).

## Package manager

We use `pnpm` as package manager. The version is enforced for all the developers by setting it explicitly with `engines.npm` in `package.json`.

## Corepack

We use `corepack` to ensure all developers use the same version of package managers. Corepack is a tool that comes with Node.js and manages package manager versions. It reads the version requirements from `package.json` and automatically installs and uses the correct version of the package manager.

To enable corepack, run:

```sh
corepack enable && corepack prepare --activate
```

To update the version used by the team

```sh
# corepack use pnpm@<version>
# eg:
corepack use pnpm@latest
```
