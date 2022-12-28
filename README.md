# Nomoi Reporter

CLI to generate automated reports based on github issues

## Pre-requisites

- Install [Node.js](https://nodejs.org/en/).

## Installation

Install the cli app using `npm`

```
npm i -g @nomoi/reporter
```

## Usage

```
Usage: reporter generate [options] <repository> <labels...>

Gets all the issues from a repository and creates a markdown report

Arguments:
  repository             the target repository in the form 'user/repo'
  labels                 only parse issues with these labels

Options:
  -m, --metadata <path>  the path to the metadata file (default: "./.audit.json")
  -o, --out-file <path>  the path to the generated markdown report (default: "reports/automated.md")
  -h, --help             display help for command

```

## Build from source

Clone the repository and move to the root folder
```
git clone https://github.com/nomoixyz/reporter.git && cd reporter
```

**OPTIONAL**: Change to a desired branch or tag
```
git checkout beta
```

Install the dependencies using `npm`
```
npm install
```

Build the project
```
npm run build
```

Run locally
```
node dist/app.js --help
```

Or link globally
```
npm link
reporter --help
```

