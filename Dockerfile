# Use the official Node.js 20 lightweight Alpine image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install ONLY production dependencies to keep the image slim
RUN npm install --only=production

# Copy pre-compiled frontend assets and backend server files directly from the host
COPY dist ./dist
COPY server ./server

# Set default port expected by Google Cloud Run (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Start the unified Express server
CMD ["node", "server/index.js"]
