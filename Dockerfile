# Build environment
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Maps API key is set at build time (it's a public browser key, not a secret)
ENV VITE_GOOGLE_MAPS_API_KEY=AIzaSyCifu2guK74ZFxS0jM7K3Deon_82nsDB-s
RUN npm run build

# Production environment
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
EXPOSE 8080
ENV NODE_ENV=production
# Gemini API key is passed as a runtime env var on Cloud Run (not baked into the image)
CMD ["npm", "start"]
