FROM stack
ADD . /opt/gsati
WORKDIR /opt/gsati
CMD ["nodejs", "main.js"]
EXPOSE 8080