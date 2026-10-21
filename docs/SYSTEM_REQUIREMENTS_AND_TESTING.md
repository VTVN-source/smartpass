# SmartOutpass system requirements and testing

## System requirements

### Development machine

| Component | Minimum / supported requirement | Used for |
| --- | --- | --- |
| Operating system | Windows 10/11, macOS, or a current Linux distribution | Development host |
| Node.js | 20 or newer (the root README notes testing on Node 24) | API, web tooling, Expo tooling |
| npm | Bundled with Node.js; use the lockfiles in each app | Install dependencies |
| MariaDB | 10.6 or newer; MariaDB 11.4 is configured in Docker Compose. MySQL 8+ is also documented as compatible | Application database |
| Docker Desktop / Docker Engine | Optional; required only for the supplied MariaDB container workflow | Local database |
| Git | Current version | Source control |
| Browser | Current Chrome, Edge, Firefox, or Safari | Web application; HTTPS or localhost for geolocation and camera |

Install dependencies separately in `server`, `web`, and `mobile`; each has its own package lock. The web client can be built without the mobile toolchain. An Android emulator/device or iOS simulator/device is needed to exercise the mobile app. Native iOS builds require macOS and Xcode; Android native builds require Android Studio and its SDK. Expo Go supports the basic app flows, while background location and production push behavior require a development build and platform credentials.

### Runtime services and configuration

- MariaDB must be reachable by the server on the configured host and port (default 3306). The API defaults to port 4000 and the Vite development server to 5173.
- Copy `server/.env.example` to `server/.env`; configure database credentials and unique random `JWT_ACCESS_SECRET` and `QR_SIGNING_SECRET` values. Keep real credentials out of version control.
- Copy `web/.env.example` to `web/.env` only when its proxy/API targets need changing.
- Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL` to an address reachable from the phone (LAN IP, not `localhost`). Android emulator can use `10.0.2.2`.
- Push delivery, SMS, and external AI are optional integrations. The local app can use the configured console/no-SMS and built-in AI modes.
- Allow the browser/mobile client to reach the API and allow the API to reach MariaDB. Configure firewall/CORS rules for the chosen development addresses.

### Deployment sizing

The repository does not define a production workload or a measured minimum CPU/RAM/disk profile. For a small evaluation, start with a 2-vCPU, 4-GB-RAM host, SSD storage, and separate database backups; monitor the API, database, and uploaded files under real load before sizing production. This is a starting estimate, not a benchmark. Keep database storage persistent and backed up. Run scheduled jobs on exactly one API instance (`ENABLE_JOBS=true` on one instance only).

## Testing implementation

### Automated tests in this repository

The API uses Node's built-in test runner (`node:test`), so no test framework dependency is required. Unit tests cover geospatial calculations and geofence transitions, QR signature/scan decisions, tracking eligibility, overdue escalation, and AI feature/model math. Registration and recurring daily-pass tests are HTTP/database integration tests and skip unless an explicitly configured test database name contains `test`.

From `server/`:

```bash
npm test                 # all tests; DB integration tests safely skip unless configured
npm run test:unit         # DB-independent unit tests only
npm run test:integration  # registration and daily-pass integration tests
```

For integration tests, create a disposable MariaDB database (for example `smartoutpass_test`) and use dedicated credentials with permission to drop/create that database. Set `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USER`, `TEST_DB_PASSWORD`, and `TEST_DB_NAME` in the test shell. The integration suite drops and re-migrates that database. Never point `TEST_DB_NAME` at development or production data. The suite does not read `server/.env` for the database target.

### Manual smoke test

1. Start MariaDB, migrate, and seed a local demo database using the instructions in the root README.
2. Start the API and web app; verify login for student, warden, security, parent, and admin demo roles.
3. Submit an outpass, approve it, scan EXIT and ENTRY, and confirm a third scan is rejected.
4. Grant trip consent, verify tracking is accepted only for an active trip, then revoke consent and verify location submission is rejected.
5. For mobile, connect a device/emulator to the API, then check login, QR scan, foreground tracking, and map updates. Test background tracking only in a development build.

The web package currently provides a production build command (`npm run build`) but does not have a separate automated UI-test runner configured. The mobile package likewise has no automated UI-test runner configured.
