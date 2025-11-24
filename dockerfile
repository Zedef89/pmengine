# NODE RUNTIME
FROM node:18

# WORKING DIR
WORKDIR /app

# COPY package.json & package-lock.json
COPY package*.json ./

# INSTALL DEPENDENCIES
RUN npm install --production

# COPY THE REST
COPY . .

# EXPOSE PORT FOR FLY
EXPOSE 3100

# START YOUR FASTIFY SERVER
CMD ["node", "index.js"]
