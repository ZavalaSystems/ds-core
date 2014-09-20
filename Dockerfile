FROM ubuntu:14.04
RUN apt-get update
RUN apt-get install -y nodejs openjdk-7-jre-headless
RUN ln -s /usr/bin/nodejs /usr/local/bin/node
CMD ["node", "main.js"]
ADD . /opt/gsati
WORKDIR /opt/gsati
EXPOSE 8080