FROM node
RUN mkdir /scoreboard/
WORKDIR /scoreboard/
COPY ./*.json ./
RUN npm install 
COPY . /scoreboard
EXPOSE 3000

CMD ["node", "app.js"]
