# Build environment
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We only bake the Google Maps API key into the frontend because it must be loaded in the browser
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
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
