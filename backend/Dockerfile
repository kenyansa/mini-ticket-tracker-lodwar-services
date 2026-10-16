FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# migrate.js reads schema.sql from its own folder, and tsc does not copy .sql files
COPY db/schema.sql ./dist/db/schema.sql
EXPOSE 3000
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed-admin.js && node dist/src/server.js"]