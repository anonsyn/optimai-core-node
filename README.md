# electron-app

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Environment Configuration

Before running the application, you need to set up environment variables for both the application and building/deployment:

#### 1. Application Environment Variables

Create a `.env` file by copying from the example:

```bash
$ cp .env.example .env
```

Edit the `.env` file and configure the following variables:

- `VITE_API_URL`: API server URL (default: https://api.optimai.network)
- `VITE_DASHBOARD_URL`: Dashboard URL (default: https://node.optimai.network)
- `VITE_LP_URL`: Landing page URL (default: https://optimai.network)
- `VITE_DEVICE_SECRET`: Device secret key (default: mob-secret-key)
- `VITE_CLIENT_APP_ID`: Client application ID (required)
- `VITE_TELEGRAM_CLIENT_SECRET`: Telegram client secret (required)
- `VITE_ENV`: Environment mode (development/production)
- `VITE_DEV_DURATION_MINUTES`: Development duration in minutes (default: 1)
- `VITE_MIN_DURATION_MINUTES`: Minimum duration in minutes (default: 3)
- `VITE_MAX_DURATION_MINUTES`: Maximum duration in minutes (default: 8)
- `VITE_FEED_URL`: Update feed URL (default: https://core-node.optimai.network)

#### 2. Build Environment Variables (for publishing only)

Create the electron-builder environment file:

```bash
$ cp electron-builder.env.example electron-builder.env
```

Edit the `electron-builder.env` file and update the following variables:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID (required for app signing and distribution)
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key (required for app signing and distribution)

**Note:**

- The `.env` file contains application configuration and should be kept secure
- The `electron-builder.env` file is only used for publishing and contains AWS credentials for code signing and app distribution
- Both files should never be committed to version control

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
