FROM node:18-alpine
    
ENV APP_DIR=/app
    
WORKDIR $APP_DIR
    
COPY . .
    
RUN npm install

USER node
    
CMD npm run dev