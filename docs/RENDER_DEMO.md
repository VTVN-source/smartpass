# Render public demo deployment

This repository can deploy the React site and Node API as separate Render services. Render assigns each service an `onrender.com` address. The API remains on Render's free web plan and may take about a minute to wake after 15 minutes with no traffic.

## Database requirement

The API uses MariaDB/MySQL (`mysql2`) and its migrations contain MySQL syntax. Render Blueprints provision PostgreSQL, which is not a drop-in replacement. Create a MariaDB/MySQL database with a provider that allows connections from Render and keep its host, port, database name, username and password available. Do not use Render's ephemeral filesystem to store a database.

## Deploy

1. Push this repository to a Git provider and connect it to Render.
2. In Render, create a **Blueprint** from this repository and select `render.yaml`.
3. For the API service's prompted values, enter the external MariaDB connection settings and set:
   - `DB_SSL` to `true` for Aiven's required TLS connection.
   - `CORS_ORIGINS` to the web service's Render URL, for example `https://smartoutpass-web.onrender.com`.
   - `VITE_API_URL` to the API URL plus `/api`, for example `https://smartoutpass-api.onrender.com/api`.
   - `VITE_SOCKET_URL` to the API origin, for example `https://smartoutpass-api.onrender.com`.
4. After the API deploys, open its Render Shell or run the database migration from a machine that can reach the database, then create a minimal demo admin using `npm run db:migrate` and `npm run seed:minimal` with `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` set. Do not run the destructive demo seed against real data.
5. Open the static site's Render URL and verify `/api/health` on the API returns `ok: true`.

The Blueprint prompts for secrets and database settings; never commit production `.env` values. The static site build needs the API URL values at build time, so enter them before its first successful deployment. Uploaded files live on the API's ephemeral filesystem on the free plan and may disappear after restart/redeploy; use sample records and avoid relying on uploaded files for the demo.
