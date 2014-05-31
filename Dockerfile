FROM ubuntu:14.04
RUN apt-get install -y nodejs npm build-essential git
RUN npm install -g grunt-cli
RUN ln -s /usr/bin/nodejs /usr/local/bin/node
CMD ["node", "main.js"]
ADD . /opt/gsati
WORKDIR /opt/gsati
EXPOSE 8080